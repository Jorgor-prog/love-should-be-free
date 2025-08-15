import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import UserNav from '@/components/UserNav';

export default async function Dashboard(){
  const me = await getSessionUser();
  if(!me) redirect('/login');
  if(me.role === 'ADMIN') redirect('/admin');

  return (
    <div style={{
      minHeight:'100vh',
      backgroundImage:'url(/images/Background_1.webp)',
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
          <div style={{fontSize:28, fontWeight:800, letterSpacing:.2, marginBottom:14}}>Status</div>

          <div style={{fontSize:22, lineHeight:1.45, marginBottom:16}}>
            <span style={{display:'inline-block', padding:'10px 14px', borderRadius:12, background:'rgba(2,6,23,.6)', border:'1px solid rgba(71,85,105,.65)'}}>
              All services are already ordered and paid
            </span>
          </div>

          <a href="/confirm" className="btn btn-primary" style={{display:'inline-block', borderColor:'#38bdf8', color:'#38bdf8'}}>
            Clarify and confirm details
          </a>

          <div style={{marginTop:12, color:'#94a3b8', fontSize:14}}>
            If you need any assistance — use the chat in the top bar.
          </div>
        </div>
      </div>
    </div>
  );
}
