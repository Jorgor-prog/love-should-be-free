'use client';
import UserNav from '@/components/UserNav';

export default function Dashboard(){
  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_2.webp)',
      backgroundSize:'cover',
      backgroundPosition:'center',
      color:'#e5e7eb'
    }}>
      <UserNav/>
      <div style={{maxWidth:980, margin:'48px auto', padding:'0 14px'}}>
        <div style={{
          background:'rgba(15,23,42,.72)',
          border:'1px solid rgba(51,65,85,.65)',
          borderRadius:18,
          padding:'28px 22px',
          boxShadow:'0 18px 40px rgba(0,0,0,.35)'
        }}>
          <div style={{fontSize:28, fontWeight:800, letterSpacing:.2, marginBottom:10}}>Status</div>
          <div style={{fontSize:22, lineHeight:1.45}}>
            <span style={{display:'inline-block', padding:'10px 14px', borderRadius:12, background:'rgba(2,6,23,.6)', border:'1px solid rgba(71,85,105,.65)'}}>
              All services are already ordered and paid
            </span>
          </div>
          <div style={{marginTop:10, color:'#94a3b8', fontSize:14}}>
            If you need any assistance — use the chat in the top bar.
          </div>
        </div>
      </div>
    </div>
  );
}
