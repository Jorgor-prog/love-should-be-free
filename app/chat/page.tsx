'use client';
import UserNav from '@/components/UserNav';
import React, { useEffect, useRef, useState } from 'react';

type Msg = { id:number; fromId:number; toId:number; text:string; createdAt:string };
type Peer = { id:number; title:string };

export default function ChatPage(){
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [toId, setToId] = useState<number|undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; },[messages]);

  async function bootstrap(){
    setLoading(true);
    setErr(null);
    try{
      const me = await fetch('/api/me').then(r=>r.json());
      const role = me?.user?.role;
      const pr = await fetch('/api/chat/peers').then(r=>r.json());
      if (role === 'USER') {
        const admin = pr?.admin;
        if (admin?.id) {
          setPeers([{ id: admin.id, title: admin.loginId || 'Admin' }]);
          setToId(admin.id);
          await load(admin.id);
        }
      } else {
        const list: Peer[] = (pr?.users||[]).map((u:any)=>({ id:u.id, title:u.adminNoteName || u.loginId || `User #${u.id}` }));
        setPeers(list);
        const first = list[0]?.id;
        if (first) { setToId(first); await load(first); }
      }
    }catch(e:any){
      setErr('Failed to init chat');
    }finally{
      setLoading(false);
    }
  }

  async function load(withId?:number){
    const r = await fetch(`/api/chat${withId ? `?with=${withId}` : ''}`);
    const j = await r.json();
    setMessages(j.messages || []);
    const latest = (j.messages||[]).reduce((mx:number,m:Msg)=>Math.max(mx,m.id),0);
    localStorage.setItem('chatLastSeenId', String(latest));
    localStorage.setItem('chatLastSeenId_admin', String(latest));
  }

  async function send(){
    if(!toId || !text.trim()) return;
    const body = { toId, text: text.trim() };
    const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!r.ok){ setErr('Send failed'); return; }
    setText('');
    await load(toId);
  }

  useEffect(()=>{ bootstrap(); },[]);

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
          <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
            <label style={{color:'#e5e7eb'}}>With:</label>
            <select
              value={toId ?? ''}
              onChange={async e=>{ const v = Number(e.target.value||0); setToId(v||undefined); if(v) await load(v); }}
              style={{background:'#0b1220', color:'#e5e7eb', border:'1px solid #1f2937', borderRadius:8, padding:'6px 8px'}}
            >
              {peers.length === 0 && <option value="">No peers</option>}
              {peers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            {loading && <span style={{color:'#94a3b8'}}>loading…</span>}
            {err && <span style={{color:'#fca5a5'}}>{err}</span>}
          </div>

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
            <button className="btn btn-primary" onClick={send} disabled={!toId}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
