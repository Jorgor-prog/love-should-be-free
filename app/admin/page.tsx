'use client';
import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [codeLength, setCodeLength] = useState<number>(0);

  async function loadUsers() {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function loadUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}`);
    const data = await res.json();
    setSelected(data.user || null);

    // Подсчёт символов кода
    if (data.user?.code) {
      setCodeLength(data.user.code.length);
    } else {
      setCodeLength(0);
    }
  }

  async function deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('User deleted');
        setSelected(null);
        loadUsers();
      } else {
        alert('Failed to delete user');
      }
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ flex: 1 }}>
          <h3>Users</h3>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <button onClick={() => loadUser(u.id)}>{u.profile?.nameOnSite || u.id}</button>
              </li>
            ))}
          </ul>
        </div>

        {selected && (
          <div style={{ flex: 2 }}>
            <h3>User details</h3>
            <div><b>Login:</b> {selected.loginId}</div>
            <div><b>Password:</b> {selected.password || '—'}</div>
            <div><b>Name on site:</b> {selected.profile?.nameOnSite}</div>
            <div><b>ID on site:</b> {selected.profile?.idOnSite}</div>
            <div><b>Residence:</b> {selected.profile?.residence}</div>

            {selected.profile?.photoUrl && (
              <img
                src={selected.profile.photoUrl}
                alt="photo"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #ccc',
                  marginTop: 10
                }}
              />
            )}

            <div style={{ marginTop: 10 }}>
              <b>Code length:</b> {codeLength}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" onClick={() => deleteUser(selected.id)}>Delete user</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
