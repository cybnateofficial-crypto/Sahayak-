"""
Kaggle T4x2 version — push dataset to Kaggle Datasets for reproducibility.
kaggle datasets init -p .
kaggle datasets create -p . --dir-mode tar
python kaggle_train.py
"""
from scripts.distill import generate_dataset
from scripts.finetune import main as finetune_main
import sys
sys.argv = ["finetune", "--base_model","HuggingFaceTB/SmolLM2-360M-Instruct","--dataset","../datasets/jarvis_synthetic.jsonl","--output_dir","./jarvis-lora","--lora_r","16","--use_4bit"]
# Kaggle gives 30h/week free GPU — perfect for weekly evolve loop
print("Kaggle train ready — run as notebook or script with GPU on")
