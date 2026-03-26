import React, { useEffect } from 'react';
import { G, bS } from '../theme';

// ── Toast notification
export function Toast({msg,type,onClose}: {msg:string, type?:string, onClose:()=>void}) {
  useEffect(()=>{const t=setTimeout(onClose,3400);return()=>clearTimeout(t);},[]);
  const c = type==="error"?G.red : type==="warn"?G.gold : G.accent;
  return <div style={{position:"fixed",top:12,right:12,zIndex:9999,background:G.panel,border:`1px solid ${c}`,borderRadius:10,padding:"9px 14px",color:c,fontSize:12,fontWeight:600,maxWidth:360,boxShadow:"0 8px 32px #000d",animation:"tIn .22s ease",display:"flex",alignItems:"center",gap:8}}>
    <span>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",color:c,cursor:"pointer",fontSize:13}}>✕</button>
  </div>;
}

// ── Overlay backdrop
export const Overlay = ({children,onClose}: {children:React.ReactNode,onClose?:()=>void}) => (
  <div onClick={e=>{if(e.target===e.currentTarget) onClose?.();}}
    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    {children}
  </div>
);

// ── Modal box
export const MBox = ({title,sub,onClose,children,w=440}: {title:string,sub?:string,onClose:()=>void,children:React.ReactNode,w?:number}) => (
  <Overlay onClose={onClose}>
    <div style={{background:G.panel,border:`1px solid ${G.border}`,borderRadius:16,padding:24,width:w,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div>
          <div style={{fontSize:16,fontWeight:800,color:G.text}}>{title}</div>
          {sub && <div style={{fontSize:10,color:G.muted,marginTop:2}}>{sub}</div>}
        </div>
        <button onClick={onClose} style={{...bS,padding:"3px 8px",fontSize:14}}>✕</button>
      </div>
      {children}
    </div>
  </Overlay>
);

// ── Field wrapper with label
export const Fld = ({label,children,hint}: {label:string,children:React.ReactNode,hint?:string}) => (
  <div style={{marginBottom:13}}>
    <div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:.8,marginBottom:5}}>{label}</div>
    {children}
    {hint && <div style={{fontSize:9,color:G.dim,marginTop:4}}>{hint}</div>}
  </div>
);

// ── Score input modal
export function ScoreModal({match,onConfirm,onClose}: {match:any,onConfirm:(w:number,sw:number,sl:number)=>void,onClose:()=>void}) {
  const [s1,setS1] = React.useState("");
  const [s2,setS2] = React.useState("");
  const n1=parseInt(s1)||0, n2=parseInt(s2)||0;
  const validScore = (a:number,b:number)=>{
    if(isNaN(a)||isNaN(b)||a<0||b<0||a===b) return false;
    const w=Math.max(a,b),l=Math.min(a,b);
    return l<10?w===11:w-l===2;
  };
  const ok = s1!==""&&s2!==""&&validScore(n1,n2);
  const wi = ok ? (n1>n2?1:2) : null;
  const deuced = n1>=10&&n2>=10;
  const t1n = (match?.team1||[]).filter(Boolean).map((p:any)=>p.name?.split(" ").pop()).join(" & ")||"A";
  const t2n = (match?.team2||[]).filter(Boolean).map((p:any)=>p.name?.split(" ").pop()).join(" & ")||"B";

  const hint = ()=>{
    if(!s1||!s2) return "Nhập tỉ số";
    if(n1===n2) return "Không thể bằng điểm";
    if(!deuced){const w=Math.max(n1,n2);if(w<11)return"Cần đến 11 điểm";if(w>11)return"Không quá 11 khi chưa deuce";}
    else{const d=Math.abs(n1-n2);if(d<2)return"Deuce: dẫn 2 điểm";if(d>2)return"Dẫn đúng 2 là thắng";}
    return ok?`✅ Đội ${wi===1?"A":"B"} thắng!`:"Không hợp lệ";
  };

  return <MBox title="📊 Nhập tỉ số" sub="11 điểm thắng · Deuce 10-10: dẫn 2" onClose={onClose} w={380}>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:10,alignItems:"center",marginBottom:14}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:11,color:G.accent,fontWeight:700,marginBottom:5}}>{t1n}</div>
        <input type="number" min="0" max="99" value={s1} onChange={e=>setS1(e.target.value)} placeholder="0"
          style={{background:G.card,border:`2px solid ${ok&&wi===1?G.accent:G.border}`,borderRadius:8,padding:"10px 6px",color:ok&&wi===1?G.accent:G.text,fontSize:30,fontWeight:900,textAlign:"center",width:"100%",outline:"none"}}/>
      </div>
      <div style={{fontSize:16,fontWeight:800,color:G.dim,marginTop:14,textAlign:"center"}}>:</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:11,color:G.gold,fontWeight:700,marginBottom:5}}>{t2n}</div>
        <input type="number" min="0" max="99" value={s2} onChange={e=>setS2(e.target.value)} placeholder="0"
          style={{background:G.card,border:`2px solid ${ok&&wi===2?G.gold:G.border}`,borderRadius:8,padding:"10px 6px",color:ok&&wi===2?G.gold:G.text,fontSize:30,fontWeight:900,textAlign:"center",width:"100%",outline:"none"}}/>
      </div>
    </div>
    {deuced && <div style={{textAlign:"center",padding:"5px",borderRadius:7,background:G.purple+"18",color:G.purple,fontSize:11,fontWeight:700,marginBottom:10}}>🔥 DEUCE</div>}
    <div style={{textAlign:"center",padding:"7px",borderRadius:7,background:ok?G.accent+"12":G.card,border:`1px solid ${ok?G.accent+"44":G.border}`,color:ok?G.accent:G.muted,fontSize:11,marginBottom:12}}>{hint()}</div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
      {[[11,0],[11,5],[11,7],[11,9],[12,10],[13,11]].map(([w,l])=>(
        <button key={`${w}-${l}`} type="button" onClick={()=>{setS1(String(w));setS2(String(l));}}
          style={{padding:"3px 9px",borderRadius:5,border:`1px solid ${s1===String(w)&&s2===String(l)?G.accent:G.border}`,background:s1===String(w)&&s2===String(l)?G.accent+"22":"transparent",color:s1===String(w)&&s2===String(l)?G.accent:G.muted,cursor:"pointer",fontSize:10,fontWeight:600}}>
          {w}-{l}
        </button>
      ))}
    </div>
    <div style={{display:"flex",gap:7}}>
      <button type="button" onClick={()=>{if(!ok)return;const sw=wi===1?n1:n2,sl=wi===1?n2:n1;onConfirm(wi!,sw,sl);}}
        disabled={!ok} style={{padding:"10px 0",borderRadius:8,border:"none",background:`linear-gradient(135deg,${G.accent},${G.blue})`,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:12,flex:1,opacity:ok?1:.4}}>✅ Xác nhận</button>
      <button type="button" onClick={onClose} style={{...bS,padding:"10px 12px"}}>Huỷ</button>
    </div>
  </MBox>;
}
