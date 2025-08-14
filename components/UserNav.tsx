'use client';
import Image from 'next/image';

export default function UserNav(){
  async function exit(){ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login'; }
  return (
    <div className="nav">
      <div className="brand">
        <Image src="/images/Logo_2.webp" alt="logo" width={36} height={36} />
        <span>LOVE SHOULD BE FREE</span>
      </div>
      <div style={{display:'flex',gap:12}}>
        <a className="btn" href="/chat">Support chat</a>
        <a className="btn" href="/about">About</a>
        <a className="btn" href="/reviews">Reviews</a>
        <button className="exit" onClick={exit}>EXIT</button>
      </div>
    </div>
  );
}
