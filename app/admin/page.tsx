'use client';
import React, { useEffect, useState } from 'react';

type UserLite = {
  id: number;
  loginId: string;
  password?: string;
  adminNoteName?: string;
  profile?: { nameOnSite?:string; idOnSite?:string; residence?:string; photoUrl?:string };
  codeConfig?: { code?: string; emitIntervalSec?: number; paused?: boolean };
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserLite[]>([]);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [adminNoteName, setAdminNoteName] = useState('');
  const [code, setCode] = useState('');
  const [emitInterval, setEmitInterval] = useState(22);

  async function loadUsers() {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function openUser(id: number) {
    const res = await fetch(`/api/admin/users/${id}`);
    const data = await res.json();
    const u: UserLite = data.user;
    setSelected(u);
    setAdminNoteName(u.adminNoteName || '');
    setCode(u.codeConfig?.code || '');
    setEmitInterval(u.codeConfig?.emitIntervalSec || 22);
  }

  async function saveModeration() {
    if (!selected) return;
    await fetch(`/api/admin/users/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ adminNoteName, code, emitIntervalSec: emitInterval })
    });
    await openUser(selected.id);
  }

  async function saveProfile() {
    if (!selected) return;
    const nameOnSite = (document.getElementById('nameOnSite') as HTMLInputElement).value;
    const idOnSite = (document.getElementById('idOnSite') as HTMLInputElement).value;
    const residence = (document.getElementById('residence') as HTMLInputElement).value;

    await fetch(`/api/admin/users/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ profile: { nameOnSite, idOnSite, residence } })
    });
    await openUser(selected.id);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selected) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    await fetch(`/api/admin/users/${selected.id}/photo`, { method:'POST', body: fd });
    await openUser(selected.id);
  }

  async function deleteUser() {
    if (!selected) return;
    if (!confirm('Delete this user permanently?')) return;
    await fetch(`/api/admin/users/${selected.id}`, { method:'DELETE' });
    setSelected(null);
    await loadUsers();
  }

  useEffect(()=>{ loadUsers(); },[]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap: 24 }}>
        <div>
          <h3>Users</h3>
          <div style={{ display:'grid', gap:8 }}>
            {users.map(u=>(
              <button key={u.id} className="btn" onClick={()=>openUser(u.id)}>
                {u.profile?.nameOnSite || `User #${u.id}`}
              </button>
            ))}
          </div>
        </div>

        <div>
          {selected ? (
            <>
              <div className="panel">
                <h3>User details</h3>
                <div><b>Login:</b> {selected.loginId}</div>
                <div><b>Password:</b> {selected.password || '—'}</div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
                  <div>
                    <label>Name on site</label>
                    <input id="nameOnSite" className="input" defaultValue={selected.profile?.nameOnSite||''} />
                    <label style={{ marginTop:8 }}>ID on site</label>
                    <input id="idOnSite" className="input" defaultValue={selected.profile?.idOnSite||''} />
                    <label style={{ marginTop:8 }}>Residence</label>
                    <input id="residence" className="input" defaultValue={selected.profile?.residence||''} />
                    <button className="btn btn-primary" style={{ marginTop:8 }} onClick={saveProfile}>Save profile</button>
                  </div>

                  <div>
                    <div className="muted">Profile photo</div>
                    {selected.profile?.photoUrl ? (
                      <img src={selected.profile.photoUrl} alt="photo" style={{ width:140, height:140, borderRadius:'50%', objectFit:'cover', border:'2px solid #e5e7eb' }} />
                    ) : <div className="muted">No photo</div>}
                    <input type="file" accept="image/*" onChange={uploadPhoto} style={{ marginTop:8 }} />
                  </div>
                </div>
              </div>

              <div className="panel" style={{ marginTop:16 }}>
                <h3>Moderation menu</h3>
                <label>Internal name</label>
                <input className="input" value={adminNoteName} onChange={e=>setAdminNoteName(e.target.value)} />

                <label style={{ marginTop:8 }}>
                  CODE <span className="muted">({code?.length || 0} characters)</span>
                </label>
                <textarea className="input" style={{ height:160 }} value={code} onChange={e=>setCode(e.target.value)} />

                <label style={{ marginTop:8 }}>Emit interval, seconds</label>
                <input className="input" type="number" min={1} value={emitInterval} onChange={e=>setEmitInterval(parseInt(e.target.value||'1'))} />

                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button className="btn btn-primary" onClick={saveModeration}>Save</button>
                  <button className="btn" onClick={deleteUser} style={{ borderColor:'#dc2626', color:'#dc2626' }}>Delete user</button>
                </div>
              </div>
            </>
          ) : (
            <div className="muted">Select a user from the list</div>
          )}
        </div>
      </div>
    </div>
  );
}
