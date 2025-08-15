'use client';
import UserNav from '@/components/UserNav';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };

export default function ChatPage(){
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const boxRef = useRef<HTMLDivElement|null>(null);

  async function load(){
    const r = await fetch('/api/chat'); // берём мои последние 50 (из твоего GET)
    const j = await r.json();
    setMessages(j.messages || []);
    // Зафиксировать, что мы “прочитали” входящие
    const latest = (j.messages||[]).filter((m:Msg)=>true).reduce((mx:number,m:Msg)=>Math.max(mx,m.id),0);
    localStorage.setItem('chatLastSeenId', String(latest));
    localStorage.setItem('chatLastSeenId_admin', String(latest));
  }

  async function send(){
    if(!text.trim()) return;
    // на бэке POST ожидает { toId, text } или { toId, body }
    // для простоты отправим админу (id=1) — подстрой под свой id админа при необходимости
    const r1 = await fetch('/api/me'); const j1 = await r1.json();
    const meId = j1?.user?.id;
    const toId = meId===1 ? 2 : 1; // примитивно: если админ, писать первому юзеру; если юзер — админу (id=1)
    await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ toId, text }) });
    setText('');
    await load();
  }

  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; },[messages]);

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
          borderRadius:16,
          border:'1px solid rgba(148,163,184,.35)',
          background:'rgba(17,24,39,.55)',
          backdropFilter:'blur(30px)', // 30% аналог — сильный blur
          padding:12
        }}>
          <div ref={boxRef} style={{maxHeight:420, overflowY:'auto', padding:8}}>
            {(messages||[]).map(m=>(
              <div key={m.id} style={{
                display:'inline-block',
                margin:'6px 0',
                padding:'8px 10px',
                borderRadius:10,
                background:'rgba(30,41,59,.85)',
                border:'1px solid rgba(51,65,85,.6)',
                color:'#e5e7eb'
              }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{display:'flex', gap:8, marginTop:8}}>
            <input className="input" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..."
              style={{flex:1, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}}/>
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
