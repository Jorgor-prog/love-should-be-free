'use client';
import UserNav from '@/components/UserNav';

export default function Reviews(){
  const items = [
    "Я не понимаю, как можно так испортить солёные огурцы!...",
    "Эти солёные огурчики — просто восторг!...",
    "Огурцы как огурцы: солёные, слегка кисловатые..."
    "Огурцы как огурцы: солёные, слегка кисловатые..."
    "Огурцы как огурцы: солёные, слегка кисловатые... бла бал бал текст поменяем позже"
    "бла бал бал текст поменяем позже"
  ];

  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      color:'#e5e7eb'
    }}>
      <UserNav/>

      <div style={{maxWidth:920, margin:'40px auto', padding:'0 12px'}}>
        <div style={{display:'grid', gap:16}}>
          {items.map((re,idx)=> (
            <div key={idx} className="panel" style={{background:'rgba(17,24,39,.85)', border:'1px solid rgba(51,65,85,.6)', borderRadius:12}}>
              <p style={{margin:0,lineHeight:1.7}}>{re}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <a className="btn" href="/dashboard">Back</a>
        </div>
      </div>
    </div>
  );
}
