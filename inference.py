"""
inference.py
------------
Production inference server for Vegapunk DS.

Model-loading pipeline:
    unsloth/Qwen2.5-3B-Instruct-bnb-4bit  (base, ~1.8 GB, 4-bit NF4)
        ↓  AutoModelForCausalLM.from_pretrained()
    yashvasudeva/qwen-adapter               (LoRA adapter, ~120 MB)
        ↓  PeftModel.from_pretrained()
    Fine-tuned model
        ↓
    /generate  HTTP endpoint (Flask)

Environment variables:
    HF_TOKEN          Required. Hugging Face access token.
    ADAPTER_MODEL_ID  Optional. Defaults to yashvasudeva/qwen-adapter.
    PORT              Optional. Defaults to 8000.

Usage:
    pip install -r requirements_inference.txt
    HF_TOKEN=hf_... python inference.py
"""

import json
import os
import sys
import traceback
from pathlib import Path

import torch
from flask import Flask, jsonify, request
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# ── Configuration ─────────────────────────────────────────────────────────────

HF_TOKEN = os.getenv("HF_TOKEN", "")
ADAPTER_MODEL_ID = os.getenv("ADAPTER_MODEL_ID", "yashvasudeva/qwen-adapter")
PORT = int(os.getenv("PORT", 8000))

MAX_NEW_TOKENS = 1024
TEMPERATURE = 0.6
TOP_P = 0.9
REPETITION_PENALTY = 1.05

SYSTEM_PROMPT = (
    "You are Vegapunk DS, a world-class AI fine-tuned on data science, machine learning, "
    "deep learning, statistical modeling, causal inference, and data engineering. "
    "Provide mathematically rigorous responses with LaTeX formulas and clean code."
)


# ── Device helpers ─────────────────────────────────────────────────────────────

def detect_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


# ── Model loading ──────────────────────────────────────────────────────────────

def read_base_model_from_adapter(adapter_id: str, token: str) -> str:
    """
    Pull base_model_name_or_path directly from the adapter's adapter_config.json.
    This is the authoritative source — we never hardcode the base model.
    """
    from huggingface_hub import hf_hub_download
    cfg_path = hf_hub_download(
        repo_id=adapter_id,
        filename="adapter_config.json",
        token=token or None,
    )
    with open(cfg_path, "r") as f:
        cfg = json.load(f)
    base = cfg.get("base_model_name_or_path")
    if not base:
        raise ValueError("adapter_config.json is missing 'base_model_name_or_path'.")
    return base


def load_model_and_tokenizer():
    """
    Step-by-step:
      1. Read base model ID from adapter_config.json (never hardcoded).
      2. Load tokenizer from the adapter repo (has fine-tuned chat template).
      3. Load base model with 4-bit NF4 quantization on GPU, or bfloat16/float32 on CPU.
      4. Attach LoRA adapter via PeftModel.from_pretrained().
      5. Return (tokenizer, model).
    """
    token = HF_TOKEN or None

    print("=" * 70)
    print("VEGAPUNK DS — Model Loading")
    print("=" * 70)

    # Step 1: Read base model ID from adapter config
    print(f"\n[1/4] Reading adapter config from '{ADAPTER_MODEL_ID}'...")
    base_model_id = read_base_model_from_adapter(ADAPTER_MODEL_ID, HF_TOKEN)
    print(f"       Base model  : {base_model_id}")
    print(f"       LoRA adapter: {ADAPTER_MODEL_ID}")

    # Step 2: Load tokenizer from adapter repo (has fine-tuned chat template)
    print(f"\n[2/4] Loading tokenizer from adapter repo...")
    tokenizer = AutoTokenizer.from_pretrained(
        ADAPTER_MODEL_ID,
        token=token,
        trust_remote_code=True,
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"
    print(f"       Vocab size  : {len(tokenizer)}")
    print(f"       Chat template: {'present' if tokenizer.chat_template else 'MISSING'}")

    # Step 3: Load base model
    device = detect_device()
    print(f"\n[3/4] Loading base model on device='{device}'...")

    if device == "cuda":
        # 4-bit NF4 quantisation — matches the training setup exactly
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_id,
            token=token,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
            low_cpu_mem_usage=True,
        )
    else:
        # CPU / MPS — load in bfloat16 if supported, float32 otherwise
        dtype = torch.bfloat16 if device != "mps" else torch.float32
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_id,
            token=token,
            torch_dtype=dtype,
            device_map={"": device},
            trust_remote_code=True,
            low_cpu_mem_usage=True,
        )
    print("       Base model loaded.")

    # Step 4: Attach LoRA adapter
    print(f"\n[4/4] Attaching LoRA adapter from '{ADAPTER_MODEL_ID}'...")
    model = PeftModel.from_pretrained(
        base_model,
        ADAPTER_MODEL_ID,
        token=token,
    )
    model.eval()

    print("\n" + "=" * 70)
    print("✓ PEFT adapter loaded successfully")
    print(f"  Base model  : {base_model_id}")
    print(f"  LoRA adapter: {ADAPTER_MODEL_ID}")
    print(f"  Device      : {device}")
    print("=" * 70 + "\n")

    return tokenizer, model


# ── Inference ──────────────────────────────────────────────────────────────────

def run_inference(tokenizer, model, messages: list, max_new_tokens: int = MAX_NEW_TOKENS) -> str:
    # Prepend system prompt if not already present
    if not messages or messages[0].get("role") != "system":
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    try:
        encoded = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
            return_dict=True,
        )
    except Exception:
        # Fallback: manual prompt
        raw = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in messages)
        raw += "\nASSISTANT:"
        encoded = tokenizer(raw, return_tensors="pt")

    # Move inputs to model device
    try:
        device = model.get_input_embeddings().weight.device
    except Exception:
        device = next(model.parameters()).device

    model_inputs = {k: v.to(device) for k, v in encoded.items() if isinstance(v, torch.Tensor)}

    if "attention_mask" not in model_inputs:
        model_inputs["attention_mask"] = torch.ones_like(model_inputs["input_ids"])

    input_len = model_inputs["input_ids"].shape[-1]

    with torch.inference_mode():
        outputs = model.generate(
            **model_inputs,
            max_new_tokens=max_new_tokens,
            temperature=TEMPERATURE,
            top_p=TOP_P,
            do_sample=True,
            repetition_penalty=REPETITION_PENALTY,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    generated = outputs[0, input_len:]
    return tokenizer.decode(generated, skip_special_tokens=True).strip()


# ── Flask API ──────────────────────────────────────────────────────────────────

app = Flask(__name__)
_tokenizer = None
_model = None


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "adapter": ADAPTER_MODEL_ID}), 200


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(force=True)
    messages = data.get("messages", [])
    max_tokens = int(data.get("max_new_tokens", MAX_NEW_TOKENS))

    if not messages:
        return jsonify({"error": "messages is required"}), 400

    try:
        text = run_inference(_tokenizer, _model, messages, max_tokens)
        return jsonify({"text": text, "model": ADAPTER_MODEL_ID})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Startup ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not HF_TOKEN:
        print("ERROR: HF_TOKEN environment variable is not set.")
        sys.exit(1)

    try:
        _tokenizer, _model = load_model_and_tokenizer()
    except Exception:
        print("\nFATAL: Failed to load model.")
        traceback.print_exc()
        sys.exit(1)

    print(f"Starting inference server on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=False)
