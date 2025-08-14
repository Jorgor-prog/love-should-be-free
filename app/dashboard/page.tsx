
'use client';
import Image from 'next/image';
import UserNav from '@/components/UserNav';

export default function Dashboard(){
  return (
    <div style={{minHeight:'100vh',
  backgroundImage:'url(/images/Background_1.webp)',
  backgroundSize:'cover', backgroundPosition:'center'}}>
      <UserNav/>
      <div className="centered" style={{alignItems:'flex-start', paddingTop:80}}>
        <div className="card" style={{maxWidth:720}}>
          <div className="title">All services are already ordered and paid</div>
          <div className="subtitle">You only need to clarify the order details.</div>
          <a className="btn btn-primary" href="/confirm">Clarify and confirm details</a>
        </div>
      </div>
    </div>
  );
}
