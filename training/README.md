# Self-Evolution Factory

Weekly loop:

1. **Phone exports** `user_logs.jsonl` (opt-in, anonymized) → upload to Colab/Kaggle
2. **Distill** 5k-20k samples from `Llama-3.1-405B-Instruct` (or 70B if quota limited)
3. **QLoRA fine-tune** SmolLM2-360M (r=16) — T4 20min/5k
4. **Eval** tool accuracy + personality
5. **Merge & quantize** → `GGUF Q4_K_M` (280MB) → OTA to phone

Costs: Colab Free T4 (15GB) handles 5k-8k; Kaggle T4x2 handles 20k. No billing needed.

Env: `HF_TOKEN` (read) for teacher inference. For Together API, set `TOGETHER_API_KEY`.
