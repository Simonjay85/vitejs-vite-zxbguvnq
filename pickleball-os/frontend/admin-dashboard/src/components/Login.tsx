import React, { useState } from 'react';
import { G, iS, bP, bS, ROLES, safe, genCode, uid } from '../../../shared/theme';

const Fld = ({label,children}: {label:string,children:React.ReactNode}) => (
  <div style={{marginBottom:13}}>
    <div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:.8,marginBottom:5}}>{label}</div>
    {children}
  </div>
);

export default function Login({accounts,players,onLogin,loading}: {accounts:any,players:any[],onLogin:(u:any)=>void,loading:boolean}) {
  const [mode,setMode] = useState<'choose'|'admin'|'viewer'>('choose');
  const [user,setUser] = useState(''); const [pass,setPass] = useState('');
  const [code,setCode] = useState(''); const [err,setErr] = useState('');

  const tryAdmin = () => {
    const all = [...(accounts?.admins||[]),...(accounts?.hosts||[])];
    const u = all.find((u:any) => safe(u.name).toLowerCase()===safe(user).toLowerCase().trim() && u.password===pass);
    u ? onLogin(u) : setErr('Tên hoặc mật khẩu không đúng');
  };
  const tryViewer = () => {
    const upper = safe(code).trim().toUpperCase();
    if(upper===(accounts?.viewerCode||'').toUpperCase()) return onLogin({id:'v_'+uid(),name:'Khán giả',role:ROLES.VIEWER,password:''});
    const p = players?.find((x:any) => x.viewerCode===upper);
    if(p) return onLogin({...p,role:ROLES.VIEWER,password:''});
    setErr('Mã truy cập không đúng');
  };

  if(loading) return <div style={{minHeight:'100vh',background:G.bg,display:'flex',alignItems:'center',justifyContent:'center',color:G.muted,fontSize:14}}>Đang tải... ⏳</div>;

  return (
    <div style={{minHeight:'100vh',background:G.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:420,maxWidth:'100%'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:64,height:64,borderRadius:18,background:`linear-gradient(135deg,${G.accent},${G.blue})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 12px'}}>🏓</div>
          <div style={{fontSize:22,fontWeight:900,color:'#fff',letterSpacing:2}}>PICKLEBALL OS</div>
          <div style={{fontSize:11,color:G.muted,marginTop:4,letterSpacing:1.5}}>SEPC RATING SYSTEM</div>
        </div>

        {mode==='choose' && <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={()=>{setMode('admin');setErr('');}} style={{...bP,padding:'16px',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <span>🎮</span> Đăng nhập Admin / Host
          </button>
          <button onClick={()=>{setMode('viewer');setErr('');}} style={{...bS,padding:'16px',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10,border:`1px solid ${G.gold}55`,color:G.gold}}>
            <span>👁</span> Xem điểm & Bảng xếp hạng
          </button>
          <div style={{textAlign:'center',padding:'10px',borderRadius:8,background:G.panel,border:`1px solid ${G.border}`,fontSize:10,color:G.dim}}>
            💡 Khán giả dùng mã truy cập do Host cung cấp
          </div>
        </div>}

        {mode==='admin' && <div style={{background:G.panel,borderRadius:16,padding:24,border:`1px solid ${G.border}`}}>
          <div style={{fontSize:14,fontWeight:800,color:G.text,marginBottom:16}}>🎮 Đăng nhập quản trị</div>
          <Fld label="TÊN ĐĂNG NHẬP"><input value={user} onChange={e=>{setUser(e.target.value);setErr('');}} placeholder="Super Admin..." style={iS} onKeyDown={e=>e.key==='Enter'&&tryAdmin()}/></Fld>
          <Fld label="MẬT KHẨU"><input type="password" value={pass} onChange={e=>{setPass(e.target.value);setErr('');}} placeholder="Mật khẩu..." style={iS} onKeyDown={e=>e.key==='Enter'&&tryAdmin()}/></Fld>
          {err && <div style={{color:G.red,fontSize:11,marginBottom:12,padding:'6px 10px',borderRadius:6,background:G.red+'12'}}>{err}</div>}
          <div style={{display:'flex',gap:8}}>
            <button onClick={tryAdmin} style={{...bP,flex:1,padding:'11px 0'}}>Đăng nhập ▶</button>
            <button onClick={()=>{setMode('choose');setErr('');}} style={bS}>← Quay lại</button>
          </div>
          <div style={{marginTop:12,padding:'8px 12px',borderRadius:8,background:G.card,fontSize:10,color:G.dim}}>
            Mặc định: <span style={{color:G.accent}}>Super Admin</span> / <span style={{color:G.accent}}>admin2024</span>
          </div>
        </div>}

        {mode==='viewer' && <div style={{background:G.panel,borderRadius:16,padding:24,border:`1px solid ${G.gold}33`}}>
          <div style={{fontSize:14,fontWeight:800,color:G.gold,marginBottom:16}}>👁 Xem trực tiếp</div>
          <Fld label="MÃ TRUY CẬP">
            <input value={code} onChange={e=>{setCode(e.target.value.toUpperCase());setErr('');}} placeholder="VD: AB12CD" maxLength={8}
              style={{...iS,textAlign:'center',fontSize:24,fontWeight:900,letterSpacing:8,color:G.gold}} onKeyDown={e=>e.key==='Enter'&&tryViewer()}/>
          </Fld>
          {err && <div style={{color:G.red,fontSize:11,marginBottom:12,padding:'6px 10px',borderRadius:6,background:G.red+'12'}}>{err}</div>}
          <div style={{display:'flex',gap:8}}>
            <button onClick={tryViewer} style={{...bP,flex:1,padding:'11px 0',background:`linear-gradient(135deg,${G.gold},${G.red})`}}>Vào xem 👁</button>
            <button onClick={()=>{setMode('choose');setErr('');}} style={bS}>← Quay lại</button>
          </div>
        </div>}
      </div>
    </div>
  );
}
