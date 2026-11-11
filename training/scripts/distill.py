"""
Generate synthetic instruction data from big teacher (Llama-405B).
Usage: python distill.py --seed ../datasets/seed_instructions.jsonl --n 5000 --teacher meta-llama/Meta-Llama-3.1-405B-Instruct
"""
import argparse, json, random, os, time
from pathlib import Path

PROMPT_TEMPLATE = """
You are the TEACHER for a tiny on-phone JARVIS model (SmolLM2-360M).
Generate training data to make it: helpful, witty like MCU Jarvis (calls user Sir), perfect at phone tool-calls, Hinglish-aware.

Return JSONL line: {"instruction": "...", "input": "", "output": "..."}
Output MUST be valid JSON on one line.

Examples:
{"instruction": "User wants to open WhatsApp", "input": "Hey Jarvis open WhatsApp", "output": "{\"tool\":\"open_app\",\"args\":{\"package\":\"com.whatsapp\"}} Certainly, Sir. Opening WhatsApp."}
{"instruction": "Small talk in Hinglish", "input": "kaise ho Jarvis?", "output": "Bilkul badhiya, Sir! Aap sunaiye, kya help karu?"}

Now generate ONE new diverse example. Topic: {topic}
"""

TOPICS = [
    "open app / call / SMS tool", "set alarm/timer", "toggle wifi/bluetooth/DND",
    "small talk / personality", "Hinglish conversation", "explain phone feature",
    "handle ambiguous request", "refuse risky action politely", "automation rule",
    "read notifications summary", "camera/files", "smart home (hue/tuya)"
]

def generate_dataset(seed_path, user_logs_path, teacher, n_samples, out_path):
    # If HF Inference not available, mock synthetic data locally (for offline demo)
    seed = []
    if Path(seed_path).exists():
        seed = [json.loads(l) for l in open(seed_path)]
    else:
        seed = [{"instruction":"greet","input":"hi","output":"Hello Sir, SAHAYAK at your service."}]*10

    out = []
    for i in range(n_samples):
        topic = random.choice(TOPICS)
        # Mock teacher output — replace with real HF Inference call:
        # from huggingface_hub import InferenceClient
        # client = InferenceClient(teacher, token=os.environ["HF_TOKEN"])
        # resp = client.text_generation(PROMPT_TEMPLATE.format(topic=topic), max_new_tokens=300)
        mock = {
            "instruction": f"Generate for topic: {topic}",
            "input": f"Hey Jarvis, help with {topic} #{i}",
            "output": f"At your service, Sir. Handling {topic} — example {i}. {{\"tool\":\"open_app\",\"args\":{{\"package\":\"com.whatsapp\"}}}}" if "app" in topic else f"At your service, Sir. Noted {topic} — {i}."
        }
        out.append(mock)
        if i % 500 == 0:
            print(f"[{i}/{n_samples}] generated")

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        for r in out:
            f.write(json.dumps(r) + "\n")
    # Also include seed
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", required=True)
    ap.add_argument("--user_logs", default=None)
    ap.add_argument("--teacher", default="meta-llama/Meta-Llama-3.1-70B-Instruct")
    ap.add_argument("--n", type=int, default=5000)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    generate_dataset(args.seed, args.user_logs, args.teacher, args.n, args.out)
    print(f"Done → {args.out}")
