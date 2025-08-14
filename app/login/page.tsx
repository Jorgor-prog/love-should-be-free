
'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function LoginPage(){
  const [loginId,setLoginId]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');

  async function onSubmit(e:any){
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ loginId, password }) });
    if(!res.ok){ setError('Invalid credentials'); return; }
    const data = await res.json();
    window.location.href = data.role === 'ADMIN' ? '/admin' : '/dashboard';
  }

  return (
    <div className="centered" style={{background:'#0b1020',color:'#111'}}>
      <div className="bg-overlay">
        <Image src="/images/Logo_1.png" alt="logo" width={560} height={560} className="logo-behind" priority />
      </div>
      <form onSubmit={onSubmit} className="card">
        <div className="title" style={{textAlign:'center'}}>LOVE SHOULD BE FREE</div>
        <div className="stack">
          <input className="input" placeholder="Login ID" value={loginId} onChange={e=>setLoginId(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn btn-primary" type="submit">Sign in</button>
          {error ? <div className="muted" style={{color:'#b91c1c'}}>{error}</div> : null}
        </div>
      </form>
    </div>
  );
}
