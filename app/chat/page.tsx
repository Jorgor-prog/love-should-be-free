
'use client';
import React, { useEffect, useState } from 'react';

export default function ChatPage(){
  const [me,setMe]=useState<any>(null);
  const [withId,setWithId]=useState<number|undefined>(undefined);
  const [messages,setMessages]=useState<any[]>([]);
  const [body,setBody]=useState('');

  async function loadMe(){
    const r = await fetch('/me.json'); const j = await r.json(); setMe(j.user);
    if(j.user?.role==='USER'){
      setWithId(j.admin?.id);
    } else {
      const url = new URL(window.location.href);
      const w = url.searchParams.get('with');
      if (w) setWithId(parseInt(w));
    }
  }

  async function load(){
    if(!withId) return;
    const r = await fetch('/api/chat?with='+withId); const j = await r.json();
    setMessages(j.messages||[]);
  }

  useEffect(()=>{ loadMe(); },[]);
  useEffect(()=>{ if(withId){ load(); const t=setInterval(load, 2000); return ()=>clearInterval(t);} },[withId]);

  async function send(){
    if(!withId || !body.trim()) return;
    await fetch('/api/chat',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ toId: withId, body }) });
    setBody(''); load();
  }

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc'}}>
      <div className="nav">
        <div className="brand">Support chat</div>
        <a className="btn" href={me?.role==='ADMIN'?'/admin':'/dashboard'}>Back</a>
      </div>
      <div style={{maxWidth:900, margin:'20px auto'}}>
        {me?.role==='ADMIN' && !withId ? <div className="panel">Open chat from Admin panel by choosing a user</div> : null}
        <div className="chatbox">
          {messages.map(m=> (
            <div key={m.id} style={{margin:'6px 0', textAlign: m.fromId===me?.id?'right':'left'}}>
              <span className="badge">{m.fromId===me?.id? 'you':'them'}</span> {m.body}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input className="input" placeholder="Type a message..." value={body} onChange={e=>setBody(e.target.value)} />
          <button className="btn btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
