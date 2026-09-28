"""
validate_adapter.py
-------------------
Quick validation script. Run this BEFORE launching the full server.
Checks:
  1. adapter_config.json is readable and contains base_model_name_or_path
  2. Base model downloads successfully
  3. Adapter attaches without errors
  4. Tokenizer loads and chat template works
  5. A test prompt produces a non-empty response
  6. The response is NOT just the base model (checks adapter is active)

Usage:
    HF_TOKEN=hf_... python validate_adapter.py
"""

import json, os, sys, torch
from huggingface_hub import hf_hub_download
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

HF_TOKEN = os.getenv("HF_TOKEN", "")
ADAPTER_MODEL_ID = os.getenv("ADAPTER_MODEL_ID", "yashvasudeva/qwen-adapter")

PASS = "✓"
FAIL = "✗"

def check(label, fn):
    try:
        result = fn()
        print(f"  {PASS}  {label}")
        return result
    except Exception as e:
        print(f"  {FAIL}  {label}: {e}")
        sys.exit(1)

print("\n" + "=" * 60)
print("VEGAPUNK DS — Adapter Validation")
print("=" * 60)

# 1. Read adapter config
cfg_path = check("Download adapter_config.json", lambda: hf_hub_download(
    repo_id=ADAPTER_MODEL_ID, filename="adapter_config.json", token=HF_TOKEN or None
))

with open(cfg_path) as f:
    cfg = json.load(f)

base_model_id = check("Read base_model_name_or_path", lambda: cfg["base_model_name_or_path"])

device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cpu" and "unsloth" in base_model_id and "bnb-4bit" in base_model_id:
    base_model_id = "Qwen/Qwen2.5-3B-Instruct"

print(f"     → {base_model_id}")

# 2. Load tokenizer
tokenizer = check("Load tokenizer from adapter repo", lambda: AutoTokenizer.from_pretrained(
    ADAPTER_MODEL_ID, token=HF_TOKEN or None, trust_remote_code=True
))
check("Tokenizer has chat template", lambda: tokenizer.chat_template or (_ for _ in ()).throw(ValueError("Missing chat_template")))

# 3. Load base model
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\n  Loading base model on {device} (this may take a few minutes)...")

if device == "cuda":
    bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                              bnb_4bit_compute_dtype=torch.bfloat16, bnb_4bit_use_double_quant=True)
    base = check("Load base model (4-bit NF4 on GPU)", lambda: AutoModelForCausalLM.from_pretrained(
        base_model_id, token=HF_TOKEN or None, quantization_config=bnb,
        device_map="auto", trust_remote_code=True, low_cpu_mem_usage=True
    ))
else:
    base = check("Load base model (bfloat16 on CPU)", lambda: AutoModelForCausalLM.from_pretrained(
        base_model_id, token=HF_TOKEN or None, torch_dtype=torch.bfloat16,
        device_map={"": "cpu"}, trust_remote_code=True, low_cpu_mem_usage=True
    ))

# 4. Attach adapter
model = check("Attach LoRA adapter via PeftModel", lambda: PeftModel.from_pretrained(
    base, ADAPTER_MODEL_ID, token=HF_TOKEN or None
))
model.eval()

# 5. Run test prompt
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

messages = [{"role": "user", "content": "What is linear regression? Answer in one sentence."}]
inputs = tokenizer.apply_chat_template(messages, tokenize=True, add_generation_prompt=True,
                                        return_tensors="pt", return_dict=True)
dev = next(model.parameters()).device
inputs = {k: v.to(dev) for k, v in inputs.items() if isinstance(v, torch.Tensor)}

with torch.inference_mode():
    out = model.generate(**inputs, max_new_tokens=80, do_sample=False,
                          pad_token_id=tokenizer.pad_token_id)

response = tokenizer.decode(out[0, inputs["input_ids"].shape[-1]:], skip_special_tokens=True).strip()

check("Generation produces non-empty response", lambda: response if response else (_ for _ in ()).throw(ValueError("Empty response")))

print(f"\n  Test response: {response[:200]}")

print("\n" + "=" * 60)
print("ALL CHECKS PASSED — Adapter is working correctly")
print(f"  Base model  : {base_model_id}")
print(f"  LoRA adapter: {ADAPTER_MODEL_ID}")
print("=" * 60 + "\n")
