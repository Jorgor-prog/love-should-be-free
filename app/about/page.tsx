'use client';
import UserNav from '@/components/UserNav';

export default function About() {
  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      color:'#e5e7eb'
    }}>
      <UserNav/>
      <div style={{maxWidth:920, margin:'40px auto', background:'rgba(17,24,39,.85)', padding:24, borderRadius:16}}>
        <h1 style={{fontSize:28, marginBottom:12}}>О проекте</h1>
        <p style={{lineHeight:1.7}}>
          Наш проект посвящён возрождению и популяризации традиционного искусства засолки огурцов...
        </p>
        <div style={{marginTop:16}}>
          <a className="btn" href="/dashboard">Back</a>
        </div>
      </div>
    </div>
  );
}
