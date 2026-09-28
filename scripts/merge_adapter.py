# -*- coding: utf-8 -*-
"""
merge_adapter.py
----------------
Step 1 of the CPU deployment pipeline.

Merges the LoRA adapter (from ./model/) into the FULL, unquantized base
model (Qwen/Qwen2.5-3B-Instruct) and saves a clean float16 checkpoint
ready for GGUF conversion.

Why NOT use the bnb-4bit base?
  The training base was unsloth/Qwen2.5-3B-Instruct-bnb-4bit (4-bit NF4).
  Merging LoRA into a 4-bit model produces degraded weights because the
  dequantisation is lossy. Starting from the original BF16 weights gives
  a clean, accurate merge that GGUF can re-quantise properly.

Usage (PowerShell):
    $env:HF_TOKEN="hf_..."
    .\\venv\\Scripts\\python.exe scripts\\merge_adapter.py

Output:
    ./merged_model/   — standard HuggingFace model directory (FP16)
"""

import os, sys, shutil, torch
from pathlib import Path

HF_TOKEN      = os.getenv("HF_TOKEN")
ADAPTER_DIR   = Path("model")           # local LoRA adapter
BASE_MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"   # full-precision base
OUTPUT_DIR    = Path("merged_model")

# ── Sanity checks ─────────────────────────────────────────────────────────────
if not HF_TOKEN:
    print("ERROR: Set $env:HF_TOKEN before running.")
    sys.exit(1)

if not (ADAPTER_DIR / "adapter_config.json").exists():
    print(f"ERROR: adapter_config.json not found in {ADAPTER_DIR}")
    sys.exit(1)

print("=" * 70)
print("MERGE LoRA ADAPTER -> FULL MODEL (FP16)")
print("=" * 70)
print(f"  Base model : {BASE_MODEL_ID}")
print(f"  Adapter    : {ADAPTER_DIR}")
print(f"  Output     : {OUTPUT_DIR}")
print()

# ── 1. Load tokenizer from local adapter dir ─────────────────────────────────
print("[1/4] Loading tokenizer from adapter directory...")
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained(
    str(ADAPTER_DIR),
    trust_remote_code=True,
)
print(f"      Vocab size : {len(tokenizer)}")

# ── 2. Load full base model in BF16 ──────────────────────────────────────────
print(f"\n[2/4] Downloading / loading base model in BF16  (this may take a while)...")
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL_ID,
    token=HF_TOKEN,
    torch_dtype=torch.bfloat16,
    device_map="cpu",          # keep on CPU — we only need the weights
    trust_remote_code=True,
    low_cpu_mem_usage=True,
)
print("      Base model loaded.")

# ── 3. Apply LoRA adapter and merge ──────────────────────────────────────────
print("\n[3/4] Applying LoRA adapter and merging weights...")
from peft import PeftModel

peft_model = PeftModel.from_pretrained(
    base_model,
    str(ADAPTER_DIR),
    torch_dtype=torch.bfloat16,
)

merged_model = peft_model.merge_and_unload()
merged_model.eval()
print("      LoRA weights merged successfully.")

# ── 4. Save merged checkpoint ─────────────────────────────────────────────────
print(f"\n[4/4] Saving merged model to {OUTPUT_DIR} ...")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

merged_model.save_pretrained(
    str(OUTPUT_DIR),
    safe_serialization=True,   # saves as .safetensors
    max_shard_size="2GB",
)
tokenizer.save_pretrained(str(OUTPUT_DIR))

print("\n" + "=" * 70)
print("[OK]  MERGE COMPLETE")
print(f"   Saved to: {OUTPUT_DIR.resolve()}")
print()
print("Next step -> convert to GGUF:")
print("   .\\venv\\Scripts\\python.exe scripts\\convert_to_gguf.py")
print("=" * 70)
