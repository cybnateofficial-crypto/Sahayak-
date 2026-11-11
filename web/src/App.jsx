import React, { useState, useRef, useEffect } from 'react'

function mockJarvis(text){
  const t = text.toLowerCase()
  if (t.includes('hello')||t.includes('hey jarvis')||t.includes('hi jarvis')) return "Good evening, Sir. Systems nominal, on-device brain online. How may I assist? — Try 'open WhatsApp' or 'set alarm 7am'"
  if (t.includes('open whatsapp')) return `{"tool":"open_app","args":{"package":"com.whatsapp"}}\nCertainly, Sir. Opening WhatsApp — at your service.`
  if (t.includes('instagram')) return `{"tool":"open_app","args":{"package":"com.instagram.android"}}\nRight away, Sir. Launching Instagram.`
  if (t.includes('call')) return `{"tool":"place_call","args":{"number":"+91-XXXX"}}\nDialing, Sir. One moment.`
  if (t.includes('alarm')) return `{"tool":"set_alarm","args":{"hour":"7","minute":"0"}}\nAlarm set for 7 AM, Sir. Shall I add a label?`
  if (t.includes('battery')) return "Battery 87%, Sir. Shall I enable power saver for your evening?"
  if (t.includes('kaise')||t.includes('kya haal')) return "Bilkul badhiya, Sir! Main yahin hoon — bolo kya karwana hai?"
  if (t.includes('who are you')) return "I am SAHAYAK — your personal JARVIS, Sir. Living on your phone, private and evolving. This is the app preview. Full LLM runs on-device via MLC-LLM."
  if (t.includes('self improve')||t.includes('kaggle')||t.includes('colab')) return "My evolution, Sir: your chats (opt-in, anonymized) → Llama-405B teacher on Kaggle/Colab distills 5k cases → QLoRA on SmolLM2-360M → GGUF Q4 → OTA to phone weekly. Fully offline after that."
  return `At your service, Sir. You said: "${text}" — On-device I'd answer instantly; for deeper reasoning I'd ping the hybrid cloud.`
}

export default function App(){
  const [msgs,setMsgs]=useState([
    {role:'assistant', text:"Good evening, Sir. I am SAHAYAK — your personal JARVIS. 🟦 Tap the orb or type below. Try: 'Hey Jarvis open WhatsApp' or 'battery kitni hai?'\n\n📲 Tap 'Install JARVIS App' below to add to home screen!"},
  ])
  const [input,setInput]=useState('')
  const [listening,setListening]=useState(false)
  const [speaking,setSpeaking]=useState(false)
  const [installed,setInstalled]=useState(false)
  const recRef=useRef(null)
  const listRef=useRef(null)

  useEffect(()=>{
    if(window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    window.addEventListener('appinstalled',()=>setInstalled(true))
  },[])

  useEffect(()=>{ listRef.current?.scrollTo(0, listRef.current.scrollHeight)},[msgs])

  const speak=(text)=>{
    if(!('speechSynthesis' in window)) return
    const plain=text.replace(/\{[^}]+\}/g,'').replace(/\[Tool:[^\]]+\]/g,'').trim().slice(0,400)
    const u=new SpeechSynthesisUtterance(plain)
    u.rate=0.95; u.pitch=0.85; u.lang='en-US'
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
    // Handle tool simulation
    if(reply.text.includes('"tool"')){
      try{
        const m = reply.text.match(/\{[^}]+\}.*?\}/)
        if(m) setTimeout(()=> setMsgs(prev=>[...prev, {role:'assistant', text:`⚡ Tool executed: ${m[0]} — (In real Android APK this would open the app)`}]), 600)
      }catch{}
    }
  }

  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition
    if(!SR){ alert("Voice not supported — type instead, Sir."); return }
    const r=new SR(); r.lang='en-IN'; r.interimResults=false; r.maxAlternatives=1
    recRef.current=r; setListening(true)
    r.onresult=(e)=>{ const t=e.results[0][0].transcript; setInput(t); send(t); setListening(false)}
    r.onerror=()=>setListening(false); r.onend=()=>setListening(false); r.start()
  }

  return (
    <div style={{minHeight:'100vh', background:'radial-gradient(1200px 600px at 50% -10%, #0a2a5a 0%, #050a18 60%)', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <header style={{width:'100%',maxWidth:900, padding:'18px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <img src="/icon-192.png" style={{width:36,height:36,borderRadius:12, objectFit:'cover'}} alt="JARVIS"/>
          <div>
            <div style={{fontWeight:800, letterSpacing:1}}>SAHAYAK // JARVIS</div>
            <div style={{fontSize:12, opacity:0.7}}>{installed ? '✓ Installed as App • ' : ''}On-Phone • Hybrid • Self-Evolving</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:11, padding:'6px 10px', borderRadius:20, background:'#0f1f3a', border:'1px solid #1b3a6a'}}>SmolLM2-360M</span>
          <span style={{fontSize:11, padding:'6px 10px', borderRadius:20, background:'#0f1f3a', border:'1px solid #1b3a6a'}}>Llama-405B teacher</span>
        </div>
      </header>

      {!installed && (
        <div style={{width:'100%',maxWidth:900, padding:'0 16px'}}>
          <div style={{background:'linear-gradient(135deg,#00D4FF,#0066FF)', color:'#001a33', borderRadius:12, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, fontWeight:600}}>
            <span>📲 Install as APK-like app → Tap the button at bottom or Chrome menu → "Install app"</span>
            <span style={{fontSize:11, background:'white', padding:'4px 8px', borderRadius:8}}>PWA Ready</span>
          </div>
        </div>
      )}

      <div style={{width:'100%',maxWidth:900, padding:'12px 16px', flex:1, display:'flex', gap:16, flexWrap:'wrap'}}>
        <div style={{flex:'1 1 560px', background:'rgba(15,31,58,0.7)', backdropFilter:'blur(8px)', border:'1px solid #1b3a6a', borderRadius:20, display:'flex', flexDirection:'column', overflow:'hidden', minHeight:520}}>
          <div style={{padding:16, borderBottom:'1px solid #1b3a6a', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontWeight:600}}>JARVIS Orb {installed && '• App Mode'}</div>
            <div style={{fontSize:12, opacity:0.7}}>{speaking ? '🔊 Speaking…' : listening ? '🎙️ Listening…' : '● Ready, Sir'}</div>
          </div>

          <div style={{display:'flex',justifyContent:'center', padding:18}}>
            <div onClick={startListening} title="Tap to talk, Sir"
              style={{width:140,height:140, borderRadius:'50%', background: listening? 'radial-gradient(circle, #00ffaa 0%, #0066ff 70%)' : 'radial-gradient(circle, #00D4FF 0%, #0066FF 60%, #0a1020 75%)',
              boxShadow: listening? '0 0 40px #00ffaa' : '0 0 30px #00d4ff', cursor:'pointer', display:'grid', placeItems:'center', transition:'all .3s'}}>
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
          <div style={{padding:'8px 14px', fontSize:11, opacity:0.6}}>Install this page as app: Chrome → ⋮ → Install app / Add to Home Screen. Real Android APK built via app_android/.</div>
        </div>

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
              ].map(([label])=>(
                <button key={label} onClick={()=>send(`open ${label}`)} style={{padding:'10px 8px', borderRadius:10, border:'1px solid #24304a', background:'#0a1020', color:'#cfe2ff', cursor:'pointer', fontSize:12}}>{label}</button>
              ))}
            </div>
            <div style={{marginTop:10, fontSize:11, opacity:0.7}}>Via Android Intents + AccessibilityService in real APK.</div>
          </div>

          <div style={{background:'rgba(15,31,58,0.7)', border:'1px solid #1b3a6a', borderRadius:16, padding:14}}>
            <div style={{fontWeight:700, marginBottom:6}}>🔄 Self-Evolution</div>
            <div style={{fontSize:12, lineHeight:1.5, opacity:0.85}}>
              <div><b>Teacher:</b> Llama-3.1-405B (Kaggle/Colab)</div>
              <div><b>Student:</b> SmolLM2-360M → QLoRA</div>
              <div><b>Loop:</b> 5k → 20min T4 → Q4 → OTA</div>
              <div style={{marginTop:8, background:'#0a1020', borderRadius:8, padding:10, fontFamily:'monospace', fontSize:11}}>
                training/colab/Jarvis_SelfTrain.ipynb<br/>▶ Run All → jarvis-q4_k_m.gguf
              </div>
            </div>
          </div>

          <div style={{background:'linear-gradient(135deg,#0f1f3a,#0a2a5a)', border:'1px solid #1b3a6a', borderRadius:16, padding:14}}>
            <div style={{fontWeight:700}}>📦 Get Real APK</div>
            <div style={{fontSize:11, opacity:0.8, marginTop:6, lineHeight:1.5}}>
              Option A: <b>This PWA = APK</b> via Chrome (instant, 0 build time)<br/>
              Option B: Native Kotlin APK → <code>app_android/</code><br/>
              Option C: TWA Bubblewrap wrapper (Play Store)
            </div>
            <div style={{display:'flex', gap:8, marginTop:10}}>
              <span style={{flex:1, textAlign:'center', padding:6, borderRadius:8, background:'#0a1020', fontSize:11}}>● Offline ✓</span>
              <span style={{flex:1, textAlign:'center', padding:6, borderRadius:8, background:'#0a1020', fontSize:11}}>● Private ✓</span>
            </div>
          </div>
        </div>
      </div>

      <footer style={{width:'100%',maxWidth:900, padding:16, opacity:0.6, fontSize:11, textAlign:'center'}}>
        SAHAYAK JARVIS • Lucknow • Long-press orb for "Hey Jarvis" wake word (real APK)
      </footer>
    </div>
  )
}
