'use client';
import React, { useEffect, useState } from 'react';

type Profile = { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
type CodeCfg = { code?:string; emitIntervalSec?:number; paused?:boolean };
type UserLite = { id:number; loginId:string; password?:string|null; adminNoteName?:string|null; profile?:Profile; codeConfig?:CodeCfg; isOnline?:boolean; updatedAt?:string };

export default function AdminPage() {
  useEffect(()=>{
  (async ()=>{
    const me = await fetch('/api/me').then(r=>r.json()).catch(()=>null);
    if(me?.user?.role !== 'ADMIN') window.location.href = '/dashboard';
  })();
},[]);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [internalName, setInternalName] = useState('');
  const [code, setCode] = useState('');
  const [emitInterval, setEmitInterval] = useState(22);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(()=>{ document.body.style.background = '#0f172a'; return ()=>{ document.body.style.background=''; };},[]);

  // Heartbeat
  useEffect(()=>{
    const tick = () => fetch('/api/heartbeat', { method:'POST' }).catch(()=>{});
    tick();
    const id = setInterval(tick, 30000);
    return ()=>clearInterval(id);
  },[]);

  // Иконка чата с индикатором
  useEffect(()=>{
    let stop=false;
    const check = async ()=>{
      try{
        const r = await fetch('/api/chat/inbox');
        const j = await r.json();
        const latestId = j?.latestId || 0;
        const lastSeen = Number(localStorage.getItem('chatLastSeenId_admin')||'0');
        if(!stop) setHasUnread(latestId>lastSeen);
      }catch{}
    };
    check();
    const id = setInterval(check, 12000);
    return ()=>{ stop=true; clearInterval(id); };
  },[]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  function showToast(msg:string){
    setToast(msg);
    setTimeout(()=>setToast(null), 3000);
  }

  async function loadUsers() {
    const r = await fetch('/api/admin/users');
    if (!r.ok) { alert('Auth error. Re-login as Admin.'); return; }
    const j = await r.json();
    setUsers(j.users || []);
  }

  async function openUser(id: number) {
    const r = await fetch(`/api/admin/users/${id}`);
    const j = await r.json();
    const u: UserLite = j.user;
    setSelected(u);
    setInternalName(u.adminNoteName || '');
    setCode(u.codeConfig?.code || '');
    setEmitInterval(u.codeConfig?.emitIntervalSec || 22);
  }

  async function createUser() {
    setCreating(true);
    const r = await fetch('/api/admin/users', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ adminNoteName: internalName })
    });
    setCreating(false);
    if (!r.ok) { alert('Failed to create'); return; }
    const j = await r.json();
    showToast('пользователь создан');
    // Очищаем поля и выбор
    setSelected(null);
    setCode('');
    setEmitInterval(22);
    setInternalName('');
    await loadUsers();
    alert(`User created\nLogin: ${j.user.loginId}\nPassword: ${j.user.password}`);
  }

  async function saveProfile() {
    if (!selected) return;
    const nameOnSite = (document.getElementById('nameOnSite') as HTMLInputElement).value;
    const idOnSite = (document.getElementById('idOnSite') as HTMLInputElement).value;
    const residence = (document.getElementById('residence') as HTMLInputElement).value;
    await fetch(`/api/admin/users/${selected.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ profile:{ nameOnSite, idOnSite, residence } })
    });
    await openUser(selected.id);
    showToast('пользователь сохранен');
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`/api/admin/users/${selected.id}/photo`, { method:'POST', body: fd });
    await openUser(selected.id);
    showToast('пользователь сохранен');
  }

  async function saveModeration() {
    if (!selected) return;
    await fetch(`/api/admin/users/${selected.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ adminNoteName: internalName, code, emitIntervalSec: emitInterval })
    });
    await openUser(selected.id);
    showToast('пользователь сохранен');
  }

  async function deleteUser() {
    if (!selected) return;
    if (!confirm('Delete this user permanently?')) return;
    await fetch(`/api/admin/users/${selected.id}`, { method:'DELETE' });
    setSelected(null);
    await loadUsers();
    showToast('пользователь удален');
  }

  useEffect(()=>{ loadUsers(); },[]);

  const now = Date.now();
  const isOnline = (u:UserLite) => {
    const ts = u.updatedAt ? new Date(u.updatedAt).getTime() : 0;
    return !!u.isOnline && (now - ts) < 120000; // 2 мин
  };

  return (
    <div style={{ minHeight:'100vh', color:'#e5e7eb' }}>
      {/* top bar */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'rgba(17,24,39,0.6)', backdropFilter:'saturate(120%) blur(4px)', borderBottom:'1px solid #1f2937', position:'sticky', top:0, zIndex:10}}>
        <div style={{fontSize:22, fontWeight:700}}>Admin Panel</div>
        <div style={{display:'flex', gap:10}}>
          <a className="btn" href="/chat" style={{position:'relative', borderColor:'#38bdf8', color:'#38bdf8'}}>
            Chat
            {hasUnread && <span style={{position:'absolute', top:-3, right:-6, width:10, height:10, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 0 2px rgba(17,24,39,0.6)'}}/>}
          </a>
          <button className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap: 24, padding:20 }}>
        {/* LEFT: list + create */}
        <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding:16, boxShadow:'0 8px 22px rgba(0,0,0,.25)' }}>
          <h3 style={{marginTop:0}}>Users</h3>

          <div style={{display:'flex', gap:8, marginBottom:12}}>
            <input
              className="input"
              placeholder="Internal name"
              value={internalName}
              onChange={e=>setInternalName(e.target.value)}
              style={{flex:1, minWidth:0, background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}}
            />
            <button
              className="btn"
              onClick={createUser}
              disabled={creating}
              style={{borderColor:'#38bdf8', color:'#38bdf8'}}
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>

          <div style={{ display:'grid', gap:8 }}>
            {users.map(u=>(
              <button
                key={u.id}
                className="btn"
                onClick={()=>openUser(u.id)}
                style={{
                  textAlign:'left',
                  background:'#0b1220',
                  border:'1px solid #1f2937',
                  color:'#e5e7eb',
                  borderRadius:10,
                  padding:'10px 12px',
                  display:'flex',
                  alignItems:'center',
                  gap:8
                }}
              >
                <span style={{
                  width:10, height:10, borderRadius:'50%',
                  background: isOnline(u) ? '#22c55e' : '#64748b'
                }}/>
                {u.adminNoteName || `User #${u.id}`}
              </button>
            ))}
            {users.length === 0 && <div className="muted" style={{color:'#94a3b8'}}>No users yet</div>}
          </div>
        </div>

        {/* RIGHT: details */}
        <div>
          {selected ? (
            <>
              <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding:16, boxShadow:'0 8px 22px rgba(0,0,0,.25)' }}>
                <h3 style={{marginTop:0}}>User details</h3>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                  <div>
                    <div><b>Login:</b> {selected.loginId}</div>
                    <div><b>Password:</b> {selected.password ?? '—'}</div>

                    <label style={{ display:'block', marginTop:12 }}>Internal name</label>
                    <input
                      className="input"
                      value={internalName}
                      onChange={e=>setInternalName(e.target.value)}
                      style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}}
                    />

                    <label style={{ display:'block', marginTop:12 }}>Name on site</label>
                    <input id="nameOnSite" className="input" defaultValue={selected.profile?.nameOnSite||''}
                      style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />

                    <label style={{ display:'block', marginTop:8 }}>ID on site</label>
                    <input id="idOnSite" className="input" defaultValue={selected.profile?.idOnSite||''}
                      style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />

                    <label style={{ display:'block', marginTop:8 }}>Residence</label>
                    <input id="residence" className="input" defaultValue={selected.profile?.residence||''}
                      style={{width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px'}} />

                    <button className="btn" style={{borderColor:'#a78bfa', color:'#a78bfa', marginTop:12}} onClick={saveProfile}>Save profile</button>
                  </div>

                  <div>
                    <div className="muted" style={{color:'#94a3b8'}}>Profile photo</div>
                    {selected.profile?.photoUrl ? (
                      <img
                        src={selected.profile.photoUrl}
                        alt="photo"
                        style={{ width:140, height:140, borderRadius:'50%', objectFit:'cover', border:'2px solid #334155', boxShadow:'0 8px 16px rgba(0,0,0,.35)', marginTop:6 }}
                      />
                    ) : <div className="muted" style={{color:'#94a3b8', marginTop:6}}>No photo</div>}
                    <input type="file" accept="image/*" onChange={uploadPhoto}
                      style={{ marginTop:8, color:'#e5e7eb' }} />
                  </div>
                </div>
              </div>

              <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding:16, marginTop:16, boxShadow:'0 8px 22px rgba(0,0,0,.25)' }}>
                <h3 style={{marginTop:0}}>Moderation</h3>

                <label>CODE <span style={{color:'#94a3b8'}}>({code?.length || 0} characters)</span></label>
                <textarea
                  className="input"
                  style={{ height:160, width:'100%', background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px' }}
                  value={code}
                  onChange={e=>setCode(e.target.value)}
                />

                <label style={{ marginTop:8, display:'block' }}>Emit interval, seconds</label>
                <input
                  className="input"
                  type="number" min={1}
                  value={emitInterval}
                  onChange={e=>setEmitInterval(parseInt(e.target.value||'1'))}
                  style={{ background:'#0b1220', border:'1px solid #1f2937', color:'#e5e7eb', borderRadius:8, padding:'8px 10px' }}
                />

                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button className="btn" style={{borderColor:'#38bdf8', color:'#38bdf8'}} onClick={saveModeration}>Save</button>
                  <button className="btn" onClick={deleteUser} style={{ borderColor:'#ef4444', color:'#ef4444' }}>Delete user</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color:'#94a3b8' }}>Select a user from the list</div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
          background:'#111827', color:'#e5e7eb', border:'1px solid #1f2937', borderRadius:10,
          padding:'10px 14px', boxShadow:'0 10px 22px rgba(0,0,0,.35)', zIndex:100
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
