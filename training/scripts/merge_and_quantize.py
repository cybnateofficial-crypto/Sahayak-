"""
Merge LoRA into base + export GGUF Q4_K_M for Android.
"""
import argparse, torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lora", required=True)
    ap.add_argument("--base", default="HuggingFaceTB/SmolLM2-360M-Instruct")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    base = AutoModelForCausalLM.from_pretrained(args.base, torch_dtype=torch.float16, device_map="cpu")
    model = PeftModel.from_pretrained(base, args.lora)
    merged = model.merge_and_unload()
    merged.save_pretrained(args.out)
    AutoTokenizer.from_pretrained(args.base).save_pretrained(args.out)
    print(f"Merged → {args.out}")
    print("Next: llama.cpp convert to GGUF → adb push to phone or OTA via server")

if __name__ == "__main__": main()
