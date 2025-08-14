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
    await fetch('/api/admin/users/'+selected.id,{
      method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ adminNoteName, code, emitIntervalSec: emitInterval })
    });
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

  async function deleteUser(){
    if(!selected) return
