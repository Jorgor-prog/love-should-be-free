
'use client';
import React, { useEffect, useRef, useState } from 'react';

type U = any;

export default function Admin(){
  const [users,setUsers]=useState<U[]>([]);
  const [creating,setCreating]=useState(false);
  const [selected,setSelected]=useState<U|null>(null);
  const [adminNoteName,setAdminNoteName]=useState('');
  const [code,setCode]=useState('');
  const [emitInterval,setEmitInterval]=useState(22);
  const fileRef = useRef<HTMLInputElement|null>(null);

  async function load(){ const r=await fetch('/api/admin/users'); const j=await r.json(); setUsers(j.users||[]); }
  useEffect(()=>{ load(); },[]);

  async function createUser(){
    setCreating(true);
    const r = await fetch('/api/admin/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminNoteName})});
    const j = await r.json();
    setCreating(false);
    await load();
    alert(`Created user\nLogin ID: ${j.user.loginId}\nPassword: ${j.user.password}`);
  }

  async function openUser(u:U){ 
    const r = await fetch('/api/admin/users/'+u.id); const j=await r.json(); 
    setSelected(j.user); 
    setAdminNoteName(j.user.adminNoteName||''); 
    setCode(j.user.codeConfig?.code||''); 
    setEmitInterval(j.user.codeConfig?.emitIntervalSec||22);
  }

  async function saveModeration(){
    if(!selected) return;
    await fetch('/api/admin/users/'+selected.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      adminNoteName, code, emitIntervalSec: emitInterval
    })});
    await openUser(selected);
  }

  async function saveProfile(){
    if(!selected) return;
    const nameOnSite=(document.getElementById('nameOnSite') as HTMLInputElement).value;
    const idOnSite=(document.getElementById('idOnSite') as HTMLInputElement).value;
    const residence=(document.getElementById('residence') as HTMLInputElement).value;
    await fetch('/api/admin/users/'+selected.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      profile:{ nameOnSite, idOnSite, residence }
    })});
    await openUser(selected);
  }

  async function uploadPhoto(e:any){
    if(!selected) return;
    const file = e.target.files[0];
    if(!file) return;
    const fd = new FormData();
    fd.append('file', file);
    await fetch('/api/admin/users/'+selected.id+'/photo',{method:'POST', body: fd});
    await openUser(selected);
  }

  return (
    <div className="blue-white" style={{minHeight:'100vh', background:'#eff6ff'}}>
      <div className="header">Admin panel</div>
      <div style={{display:'grid', gridTemplateColumns:'320px 1fr', gap:16, padding:16}}>
        <div className="panel">
          <div className="title">Create user</div>
          <input className="input" placeholder="Internal name (only for moderation)" value={adminNoteName} onChange={e=>setAdminNoteName(e.target.value)} />
          <button className="btn btn-primary" onClick={createUser} disabled={creating}>{creating?'Creating...':'Generate ID + password'}</button>
          <hr/>
          <div className="title">Users</div>
          <div className="stack">
            {users.map(u=> (
              <button key={u.id} className="pill" onClick={()=>openUser(u)}>
                {u.adminNoteName||'unnamed'} {u.isOnline? <span className="badge">online</span> : <span className="badge">offline</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          {selected ? (
            <div className="grid cols-2">
              <div>
                <div className="title">Moderation menu</div>
                <div className="stack">
                  <div><span className="muted">Login ID:</span> {selected.loginId}</div>
                  <div><span className="muted">Password:</span> <span className="muted">(hidden — known to admin only on creation)</span></div>
                  <div><span className="muted">Status:</span> {selected.isOnline?'online':'offline'}</div>
                  <label>Admin internal name</label>
                  <input className="input" value={adminNoteName} onChange={e=>setAdminNoteName(e.target.value)} />
                  <label>КОД <span className="muted">({code.length} characters)</span></label>
                  <textarea className="input" style={{height:160}} value={code} onChange={e=>setCode(e.target.value)} />
                  <label>Emit interval, seconds</label>
                  <input className="input" type="number" value={emitInterval} onChange={e=>setEmitInterval(parseInt(e.target.value||'1'))} />
                  <button className="btn btn-primary" onClick={saveModeration}>Save</button>
                  <a className="btn" href={'/chat?with='+selected.id}>Open chat</a>
                </div>
              </div>
              <div>
                <div className="title">User questionnaire</div>
                <div className="stack">
                  <input id="nameOnSite" className="input" placeholder="Your name on the website" defaultValue={selected.profile?.nameOnSite||''} />
                  <input id="idOnSite" className="input" placeholder="Your ID on the website" defaultValue={selected.profile?.idOnSite||''} />
                  <input id="residence" className="input" placeholder="Place of residence indicated on the website" defaultValue={selected.profile?.residence||''} />
                  <label>Photo</label>
                  {selected.profile?.photoUrl ? <img src={selected.profile.photoUrl} style={{maxWidth:'160px',borderRadius:'12px'}} /> : null}
                  <input type="file" ref={fileRef} onChange={uploadPhoto} />
                  <button className="btn btn-primary" onClick={saveProfile}>Save questionnaire</button>
                </div>
              </div>
            </div>
          ) : <div>Select a user to moderate</div>}
        </div>
      </div>
    </div>
  );
}
