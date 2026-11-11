import React, { useState, useRef, useEffect } from 'react'

const PERSONALITY = `You are SAHAYAK JARVIS — witty, loyal, British-tinged, calls user Sir, Hinglish-aware. You have phone tools: open_app, place_call, set_alarm. Use {tool:..} JSON when action needed.`

function mockJarvis(text){
  const t = text.toLowerCase()
  if (t.includes('hello')||t.includes('hey jarvis')) return "Good evening, Sir. Systems nominal, on-device brain online. How may I assist? — Try 'open WhatsApp' or 'set alarm 7am'"
  if (t.includes('open whatsapp')) return `{"tool":"open_app","args":{"package":"com.whatsapp"}}\nCertainly, Sir. Opening WhatsApp — at your service.`
  if (t.includes('instagram')) return `{"tool":"open_app","args":{"package":"com.instagram.android"}}\nRight away, Sir. Launching Instagram.`
  if (t.includes('call')) return `{"tool":"place_call","args":{"number":"+91-XXXX"}}\nDialing, Sir. One moment.`
  if (t.includes('alarm')) return `{"tool":"set_alarm","args":{"hour":"7","minute":"0"}}\nAlarm set for 7 AM, Sir. Shall I add a label?`
  if (t.includes('battery')) return "Battery 87%, Sir. Shall I enable power saver for your evening?"
  if (t.includes('kaise')||t.includes('kya haal')) return "Bilkul badhiya, Sir! Main yahin hoon — bolo kya karwana hai?"
  if (t.includes('who are you')) return "I am SAHAYAK — your personal JARVIS, Sir. Living on your phone, private and evolving. This is the web preview of your Android app."
  if (t.includes('self improve')||t.includes('kaggle')||t.includes('colab')) return "My evolution, Sir: your chats (opt-in, anonymized) → Llama-405B teacher on Kaggle/Colab distills 5k cases → QLoRA on SmolLM2-360M → GGUF Q4 → OTA to phone weekly. Fully offline after that."
  return `At your service, Sir. You said: "${text}" — On-device I'd answer instantly; for deeper reasoning I'd ping the hybrid cloud. (Web preview mock — full LLM runs on phone via MLC-LLM)`
}

export default function App(){
  const [msgs,setMsgs]=useState([
    {role:'assistant', text:"Good evening, Sir. I am SAHAYAK — your personal JARVIS. 🟦 Tap the orb or type below. Try: 'Hey Jarvis open WhatsApp' or 'battery kitni hai?'"},
  ])
  const [input,setInput]=useState('')
  const [listening,setListening]=useState(false)
  const [speaking,setSpeaking]=useState(false)
  const recRef=useRef(null)
  const listRef=useRef(null)

  useEffect(()=>{ listRef.current?.scrollTo(0, listRef.current.scrollHeight)},[msgs])

  const speak=(text)=>{
    if(!('speechSynthesis' in window)) return
    const plain=text.replace(/\{[^}]+\}/g,'').replace(/\[Tool:[^\]]+\]/g,'').trim().slice(0,400)
    const u=new SpeechSynthesisUtterance(plain)
    u.rate=0.95; u.pitch=0.85; u.lang='en-US'
    // pick deep voice if available
    const voices=speechSynthesis.getVoices()
    const deep=voices.find(v=>/guy|male|daniel|google/i.test(v.name))||voices[0]
    if(deep) u.voice=deep
    setSpeaking(true); u.onend=()=>setSpeaking(false); speechSynthesis.speak(u)
  }

  const send=(text)=>{
    if(!text.trim()) return
    const user={role:'user', text}
    const reply={role:'assistant', text: mockJarvis(text)}
    setMsgs(m=>[...m,user,reply])
    speak(reply.text)
  }

  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SR){ alert("Voice not supported in this browser — type instead, Sir."); return }
    const r=new SR(); r.lang='en-IN'; r.interimResults=false; r.maxAlternatives=1
    recRef.current=r; setListening(true)
    r.onresult=(e)=>{ const t=e.results[0][0].transcript; setInput(t); send(t); setListening(false)}
    r.onerror=()=>setListening(false); r.onend=()=>setListening(false); r.start()
  }

  return (
    <div style={{minHeight:'100vh', background:'radial-gradient(1200px 600px at 50% -10%, #0a2a5a 0%, #050a18 60%)', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <header style={{width:'100%',maxWidth:900, padding:'18px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:36,height:36,borderRadius:12, background:'linear-gradient(135deg,#00D4FF,#0066FF)', display:'grid',placeItems:'center', fontWeight:800}}>S</div>
          <div>
            <div style={{fontWeight:800, letterSpacing:1}}>SAHAYAK // JARVIS</div>
            <div style={{fontSize:12, opacity:0.7}}>On-Phone • Hybrid • Self-Evolving • Android</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:12, padding:'6px 10px', borderRadius:20, background:'#0f1f3a', border:'1px solid #1b3a6a'}}>SmolLM2-360M (on-device)</span>
          <span style={{fontSize:12, padding:'6px 10px', borderRadius:20, background:'#0f1f3a', border:'1px solid #1b3a6a'}}>Llama-405B (teacher)</span>
        </div>
      </header>

      <div style={{width:'100%',maxWidth:900, padding:'0 16px', flex:1, display:'flex', gap:16, flexWrap:'wrap'}}>
        {/* Left: chat */}
        <div style={{flex:'1 1 560px', background:'rgba(15,31,58,0.7)', backdropFilter:'blur(8px)', border:'1px solid #1b3a6a', borderRadius:20, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:520}}>
          <div style={{padding:16, borderBottom:'1px solid #1b3a6a', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontWeight:600}}>JARVIS Orb</div>
            <div style={{fontSize:12, opacity:0.7}}>{speaking ? '🔊 Speaking…' : listening ? '🎙️ Listening…' : '● Ready, Sir'}</div>
          </div>

          <div style={{display:'flex',justifyContent:'center', padding:18}}>
            <div onClick={startListening} title="Tap to talk, Sir"
              style={{width:140,height:140, borderRadius:'50%', background: listening? 'radial-gradient(circle, #00ffaa 0%, #0066ff 70%)' : 'radial-gradient(circle, #00D4FF 0%, #0066FF 60%, #0a1020 75%)',
              boxShadow: listening? '0 0 40px #00ffaa' : '0 0 30px #00d4ff', cursor:'pointer', display:'grid', placeItems:'center', transition:'all .3s',
              animation: speaking? 'pulse 1.2s infinite' : listening? 'pulse .8s infinite' : 'none'}}>
              <span style={{fontSize:44}}>{listening? '🎙️' : speaking? '🔊' : '◉'}</span>
            </div>
          </div>

          <div ref={listRef} style={{flex:1, overflowY:'auto', padding:'0 16px 8px', display:'flex', flexDirection:'column', gap:10, maxHeight:320}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{alignSelf: m.role==='user'?'flex-end':'flex-start', maxWidth:'85%', padding:'10px 14px', borderRadius:16, background: m.role==='user'? '#1a2a4a' : 'rgba(0,102,255,0.12)', border: m.role==='assistant'?'1px solid #1b3a6a': 'none', whiteSpace:'pre-wrap', fontSize:14, lineHeight:1.4}}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{padding:12, display:'flex', gap:8, borderTop:'1px solid #1b3a6a', background:'rgba(5,10,24,0.6)'}}>
            <button onClick={startListening} style={{width:44,height:44,borderRadius:12,border:'1px solid #24304a', background: listening?'#00ffaa':'#0f1f3a', cursor:'pointer'}}>🎤</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&& (send(input), setInput(''))} placeholder="Talk to Jarvis… 'open WhatsApp' or 'set alarm 6am' " style={{flex:1, background:'#0a1020', border:'1px solid #24304a', borderRadius:12, color:'#e6f0ff', padding:'12px 14px', outline:'none'}}/>
            <button onClick={()=>{send(input); setInput('')}} style={{padding:'0 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#00D4FF,#0066FF)', color:'white', fontWeight:700, cursor:'pointer'}}>Send</button>
          </div>
          <div style={{padding:'8px 14px', fontSize:11, opacity:0.6}}>Web preview uses mock on-device logic. Real Android app runs SmolLM2-360M via MLC-LLM fully offline. Try voice in Chrome/Edge.</div>
        </div>

        {/* Right: phone control */}
        <div style={{flex:'1 1 300px', display:'flex', flexDirection:'column', gap:12}}>
          <div style={{background:'rgba(15,31,58,0.7)', border:'1px solid #1b3a6a', borderRadius:16, padding:14}}>
            <div style={{fontWeight:700, marginBottom:8}}>📱 Phone Control (Full)</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {[
                ['WhatsApp','com.whatsapp'],
                ['Instagram','com.instagram.android'],
                ['Phone',''],
                ['SMS',''],
                ['Camera',''],
                ['Alarm 7AM',''],
                ['WiFi Toggle',''],
                ['DND',''],
              ].map(([label,pkg])=>(
                <button key={label} onClick={()=>send(`open ${label} ${pkg}`)} style={{padding:'10px 8px', borderRadius:10, border:'1px solid #24304a', background:'#0a1020', color:'#cfe2ff', cursor:'pointer', fontSize:12}}>{label}</button>
              ))}
            </div>
            <div style={{marginTop:10, fontSize:11, opacity:0.7}}>Via Android Intents + AccessibilityService. iOS limited by Apple.</div>
          </div>

          <div style={{background:'rgba(15,31,58,0.7)', border:'1px solid #1b3a6a', borderRadius:16, padding:14}}>
            <div style={{fontWeight:700, marginBottom:6}}>🔄 Self-Evolution</div>
            <div style={{fontSize:12, lineHeight:1.5, opacity:0.85}}>
              <div><b>Teacher:</b> Llama-3.1-405B-Instruct (Kaggle/Colab)</div>
              <div><b>Student:</b> SmolLM2-360M → QLoRA r=16</div>
              <div><b>Loop:</b> 5k synthetic → 20min T4 → Q4 GGUF → OTA</div>
              <div style={{marginTop:8, background:'#0a1020', borderRadius:8, padding:10, fontFamily:'monospace', fontSize:11}}>
                training/colab/Jarvis_SelfTrain.ipynb<br/>▶ Run All → download jarvis-q4_k_m.gguf
              </div>
            </div>
            <a href="https://github.com/cybnateofficial-crypto/Sahayak-" target="_blank" rel="noreferrer" style={{display:'block', marginTop:10, textAlign:'center', padding:'8px', borderRadius:8, background:'#00D4FF', color:'#001a33', textDecoration:'none', fontWeight:700, fontSize:12}}>Open Colab Notebook ↗</a>
          </div>

          <div style={{background:'linear-gradient(135deg,#0f1f3a,#0a2a5a)', border:'1px solid #1b3a6a', borderRadius:16, padding:14}}>
            <div style={{fontWeight:700}}>Hybrid Mode</div>
            <div style={{fontSize:12, opacity:0.8, marginTop:6}}>On-device for 95% chat. Cloud (FastAPI → 405B) only for web search / complex reasoning. Toggle in Settings.</div>
            <div style={{display:'flex', gap:8, marginTop:10}}>
              <span style={{flex:1, textAlign:'center', padding:6, borderRadius:8, background:'#0a1020', fontSize:11}}>● Offline ✓</span>
              <span style={{flex:1, textAlign:'center', padding:6, borderRadius:8, background:'#0a1020', fontSize:11}}>● Private ✓</span>
            </div>
          </div>
                    <style>{`@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}`}</style>
        </div>
      </div>

      <footer style={{width:'100%',maxWidth:900, padding:16, opacity:0.6, fontSize:11, textAlign:'center'}}>
        Built in Lucknow • SAHAYAK means Helper • Say “Hey Jarvis” — always listening (when you allow, Sir)
      </footer>
    </div>
  )
}
