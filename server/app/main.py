from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(title="Sahayak Hybrid Server")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ChatReq(BaseModel):
    message: str
    history: list = []

@app.get("/")
def root(): return {"status":"SAHAYAK JARVIS hybrid server online, Sir","model":"Llama-3.1-405B teacher fallback"}

@app.post("/chat")
def chat(req: ChatReq):
    # Proxy to Together / HF / OpenAI for hard queries
    # Fallback mock
    return {"reply": f"Cloud brain here, Sir — you said: '{req.message}'. On-device handled it, but I can do deeper reasoning if needed.", "source":"hybrid-cloud"}

@app.post("/training/upload")
def upload(logs: dict):
    # Store anonymized logs for next distillation
    return {"received": len(logs), "next_train":"Sunday 2AM IST"}

@app.get("/ota/latest")
def ota():
    return {"version":"0.1.0","url":"https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/resolve/main/model.safetensors","changelog":"Initial Jarvis personality + tool use"}
