'use client';
import React, { useState } from 'react';

export default function LoginPage(){
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setErr(null); setLoading(true);
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ loginId, password })});
    setLoading(false);
    if(!r.ok){ const j = await r.json().catch(()=>({})); setErr(j?.error||'Login failed'); return; }
    // получаем реальную роль с сервера
    const me = await fetch('/api/me').then(x=>x.json()).catch(()=>null);
    const role = me?.user?.role;
    if(role === 'ADMIN') window.location.href = '/admin';
    else window.location.href = '/dashboard';
  }

  return (
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'rgba(15,23,42,1)'}}>
      <form onSubmit={submit} style={{width:360, background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding:18, color:'#e5e7eb'}}>
        <h2 style={{marginTop:0}}>Sign in</h2>
        <input className="input" placeholder="Login" value={loginId} onChange={e=>setLoginId(e.target.value)}
               style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
               style={{width:'100%', marginTop:8, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />
        {err && <div style={{marginTop:8, color:'#fca5a5'}}>{err}</div>}
        <button disabled={loading} className="btn btn-primary" style={{marginTop:12, width:'100%'}}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
