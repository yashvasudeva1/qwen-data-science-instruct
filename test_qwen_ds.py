"""
test_qwen_ds_fixed.py
---------------------
Inference tester for:
    yashvasudeva/qwen-ds-finetuned

Fixes the BatchEncoding/tensor issue from the previous version:
`apply_chat_template(..., return_tensors="pt")` can return a
BatchEncoding/dict-like object rather than a raw Tensor.

Set your HF token as an environment variable before running.

PowerShell:
    $env:HF_TOKEN="hf_your_token_here"

Run:
    python test_qwen_ds_fixed.py
"""

import os
import sys
import traceback

import torch
from huggingface_hub import HfApi
from transformers import AutoTokenizer
from peft import AutoPeftModelForCausalLM


MODEL_ID = "yashvasudeva/qwen-ds-finetuned"

MAX_NEW_TOKENS = 512
TEMPERATURE = 0.2
TOP_P = 0.9
REPETITION_PENALTY = 1.05


def get_token():
    token = os.getenv("HF_TOKEN")

    if not token:
        print("\nERROR: HF_TOKEN is not set.")
        print("\nPowerShell:")
        print('$env:HF_TOKEN="hf_your_token_here"')
        sys.exit(1)

    return token


def get_device(model):
    try:
        return model.get_input_embeddings().weight.device
    except Exception:
        return next(model.parameters()).device


def print_environment():
    print("=" * 80)
    print("QWEN DS FINE-TUNED MODEL — INFERENCE TEST")
    print("=" * 80)
    print(f"Model repository : {MODEL_ID}")
    print(f"PyTorch          : {torch.__version__}")
    print(f"CUDA available   : {torch.cuda.is_available()}")

    if torch.cuda.is_available():
        print(f"GPU              : {torch.cuda.get_device_name(0)}")
    else:
        print("Running on CPU. Generation may be slow.")

    print("=" * 80)


def load_model(token):
    print("\n[1/3] Checking Hugging Face repository...")

    api = HfApi(token=token)
    info = api.model_info(MODEL_ID)
    print(f"Repository found: {info.id}")

    print("\n[2/3] Loading tokenizer...")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        token=token,
        trust_remote_code=True,
    )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print("Tokenizer loaded.")

    print("\n[3/3] Loading PEFT model + base model...")
    print("This may take some time on CPU.")

    model = AutoPeftModelForCausalLM.from_pretrained(
        MODEL_ID,
        token=token,
        device_map="auto",
        torch_dtype="auto",
        low_cpu_mem_usage=True,
        trust_remote_code=True,
    )

    model.eval()

    print("Model loaded successfully.")
    print(f"Input device: {get_device(model)}")

    return tokenizer, model


def prepare_inputs(tokenizer, messages, device):
    """
    Apply the model's chat template and ALWAYS return a real tensor dict.

    This is the key fix for the previous:
        AttributeError: 'BatchEncoding' object has no attribute 'shape'
    """

    try:
        encoded = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
            return_dict=True,
        )

        # Newer Transformers may return a dict-like BatchEncoding.
        if hasattr(encoded, "items"):
            model_inputs = {
                key: value.to(device)
                for key, value in encoded.items()
                if torch.is_tensor(value)
            }
        else:
            # Defensive fallback.
            model_inputs = {
                "input_ids": encoded.to(device)
            }

    except TypeError:
        # Compatibility fallback for Transformers versions where
        # return_dict is not accepted by apply_chat_template.
        encoded = tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        )

        if isinstance(encoded, dict):
            model_inputs = {
                key: value.to(device)
                for key, value in encoded.items()
                if torch.is_tensor(value)
            }
        else:
            model_inputs = {
                "input_ids": encoded.to(device)
            }

    # Make sure input_ids exists.
    if "input_ids" not in model_inputs:
        raise RuntimeError(
            f"Tokenizer did not return input_ids. Keys: {list(model_inputs.keys())}"
        )

    # Some models need attention_mask. If it wasn't returned, create one.
    if "attention_mask" not in model_inputs:
        model_inputs["attention_mask"] = torch.ones_like(
            model_inputs["input_ids"]
        )

    return model_inputs


def generate(tokenizer, model, messages):
    device = get_device(model)

    model_inputs = prepare_inputs(
        tokenizer=tokenizer,
        messages=messages,
        device=device,
    )

    input_ids = model_inputs["input_ids"]

    print(f"\nInput tokens: {input_ids.shape[-1]}")
    print("Generating...")

    with torch.inference_mode():
        outputs = model.generate(
            **model_inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=TEMPERATURE,
            top_p=TOP_P,
            do_sample=True,
            repetition_penalty=REPETITION_PENALTY,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    # Only decode tokens produced after the prompt.
    generated_tokens = outputs[0, input_ids.shape[-1]:]

    response = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True,
    ).strip()

    return response


def main():
    token = get_token()
    print_environment()

    try:
        tokenizer, model = load_model(token)
    except Exception:
        print("\nFAILED TO LOAD MODEL.")
        traceback.print_exc()
        sys.exit(1)

    # ---------------------------------------------------------
    # Smoke test
    # ---------------------------------------------------------
    print("\n" + "=" * 80)
    print("SMOKE TEST")
    print("=" * 80)

    smoke_messages = [
        {
            "role": "user",
            "content": (
                "Hello! Briefly introduce yourself and explain "
                "what you are specialized in."
            ),
        }
    ]

    try:
        response = generate(
            tokenizer,
            model,
            smoke_messages,
        )

        print("\nAssistant:")
        print(response)

    except Exception:
        print("\nGENERATION FAILED.")
        traceback.print_exc()
        sys.exit(1)

    # ---------------------------------------------------------
    # Interactive chat
    # ---------------------------------------------------------
    print("\n" + "=" * 80)
    print("INTERACTIVE MODE")
    print("=" * 80)
    print("Type your questions below.")
    print("Commands: exit / quit")
    print("=" * 80)

    history = []

    while True:
        try:
            user_message = input("\nYou: ").strip()

            if not user_message:
                continue

            if user_message.lower() in {"exit", "quit"}:
                print("Goodbye.")
                break

            history.append(
                {
                    "role": "user",
                    "content": user_message,
                }
            )

            response = generate(
                tokenizer,
                model,
                history,
            )

            print(f"\nAssistant: {response}")

            history.append(
                {
                    "role": "assistant",
                    "content": response,
                }
            )

        except KeyboardInterrupt:
            print("\n\nStopped.")
            break

        except Exception:
            print("\nGeneration error:")
            traceback.print_exc()


if __name__ == "__main__":
    main()
