'use client';
import UserNav from '@/components/UserNav';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };

export default function ChatPage(){
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [adminId, setAdminId] = useState<number|undefined>(undefined);
  const [err, setErr] = useState<string|null>(null);
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; },[messages]);

  async function loadOnce(aid:number){
    const r = await fetch(`/api/chat?with=${aid}`);
    const j = await r.json();
    setMessages(j.messages || []);
    const latest = (j.messages||[]).reduce((mx:number,m:Msg)=>Math.max(mx,m.id),0);
    localStorage.setItem('chatLastSeenId', String(latest));
  }

  async function bootstrap(){
    setErr(null);
    try{
      // берём айди админа
      const pr = await fetch('/api/chat/peers').then(r=>r.json());
      const aid = pr?.admin?.id;
      if(!aid){ setErr('Admin not found'); return; }
      setAdminId(aid);
      await loadOnce(aid);
    }catch{ setErr('Failed to init chat'); }
  }

  async function send(){
    if(!adminId || !text.trim()) return;
    const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ toId: adminId, text: text.trim() }) });
    if(!r.ok){ setErr('Send failed'); return; }
    setText('');
    await loadOnce(adminId);
  }

  useEffect(()=>{ bootstrap(); },[]);
  useEffect(()=>{
    if(!adminId) return;
    const id = setInterval(()=>loadOnce(adminId), 7000);
    return ()=>clearInterval(id);
  },[adminId]);

  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center'
    }}>
      <UserNav/>
      <div style={{maxWidth:960, margin:'24px auto', padding:'0 12px'}}>
        <div style={{
          borderRadius:16, border:'1px solid rgba(148,163,184,.35)',
          background:'rgba(17,24,39,.55)', backdropFilter:'blur(30px)', padding:12
        }}>
          <a className="btn" href="/dashboard" style={{marginBottom:8, display:'inline-block'}}>Back</a>

          <div ref={boxRef} style={{maxHeight:420, overflowY:'auto', padding:8}}>
            {(messages||[]).map(m=>(
              <div key={m.id} style={{
                display:'inline-block', margin:'6px 0', padding:'8px 10px',
                borderRadius:10, background:'rgba(30,41,59,.85)',
                border:'1px solid rgba(51,65,85,.6)', color:'#e5e7eb'
              }}>
                {m.text}
              </div>
            ))}
            {messages.length === 0 && <div style={{color:'#94a3b8'}}>No messages yet</div>}
          </div>

          <div style={{display:'flex', gap:8, marginTop:8}}>
            <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..."
              style={{flex:1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}}/>
            <button className="btn btn-primary" onClick={send} disabled={!adminId}>Send</button>
          </div>
          {err && <div style={{marginTop:8, color:'#fca5a5'}}>{err}</div>}
        </div>
      </div>
    </div>
  );
}
