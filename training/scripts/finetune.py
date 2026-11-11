"""
QLoRA fine-tune SmolLM2-360M on synthetic Jarvis data.
Colab T4: 5k samples ~18 min, 20k ~55 min
"""
import argparse, torch, json
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base_model", default="HuggingFaceTB/SmolLM2-360M-Instruct")
    ap.add_argument("--dataset", required=True)
    ap.add_argument("--output_dir", default="./jarvis-lora")
    ap.add_argument("--lora_r", type=int, default=16)
    ap.add_argument("--lora_alpha", type=int, default=32)
    ap.add_argument("--epochs", type=int, default=2)
    ap.add_argument("--batch_size", type=int, default=4)
    ap.add_argument("--grad_accum", type=int, default=4)
    ap.add_argument("--lr", type=float, default=2e-4)
    ap.add_argument("--use_4bit", action="store_true")
    args = ap.parse_args()

    tok = AutoTokenizer.from_pretrained(args.base_model)
    tok.pad_token = tok.eos_token

    bnb = BitsAndBytesConfig(load_in_4bit=args.use_4bit, bnb_4bit_compute_dtype=torch.bfloat16) if args.use_4bit else None
    model = AutoModelForCausalLM.from_pretrained(args.base_model, device_map="auto", quantization_config=bnb, torch_dtype=torch.bfloat16)

    peft = LoraConfig(r=args.lora_r, lora_alpha=args.lora_alpha, lora_dropout=0.05, target_modules=["q_proj","v_proj","k_proj","o_proj","gate_proj","up_proj","down_proj"], task_type="CAUSAL_LM")
    model = get_peft_model(model, peft)

    ds = load_dataset("json", data_files=args.dataset, split="train")
    def fmt(ex):
        return f"<|im_start|>user\n{ex['instruction']}\n{ex['input']}<|im_end|>\n<|im_start|>assistant\n{ex['output']}<|im_end|>"
    ds = ds.map(lambda x: {"text": fmt(x)})

    trainer = SFTTrainer(
        model=model, train_dataset=ds, tokenizer=tok,
        args=SFTConfig(
            output_dir=args.output_dir, num_train_epochs=args.epochs,
            per_device_train_batch_size=args.batch_size, gradient_accumulation_steps=args.grad_accum,
            learning_rate=args.lr, packing=True, max_seq_length=1024,
            dataset_text_field="text", logging_steps=20, save_steps=200,
            bf16=True, optim="paged_adamw_8bit"
        )
    )
    trainer.train()
    trainer.save_model(args.output_dir)
    print(f"Saved LoRA → {args.output_dir}")

if __name__ == "__main__": main()
