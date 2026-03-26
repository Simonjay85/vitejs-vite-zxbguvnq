import React from 'react';
import { G, bP, teamElo, safe } from '../theme';
import { SBadge, GBadge, DBadge, Chip } from './Badge';
import { DTYPE_OPT } from '../theme';

// ─── Team block inside a court card
function TBlock({team,label,color}: {team:any[],label:string,color:string}) {
  if(!team?.length) return null;
  return <div style={{padding:"6px 9px",borderRadius:8,background:color+"12",border:`1px solid ${color}30`}}>
    <div style={{fontSize:8,color,fontWeight:700,letterSpacing:.8,marginBottom:4}}>{label}</div>
    {team.filter(Boolean).map(p=><div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <span style={{fontSize:11,fontWeight:700,color:G.text}}>{safe(p.name)}</span>
        <SBadge skill={p.skill}/>
      </div>
      <GBadge gender={p.gender}/>
    </div>)}
    <div style={{fontSize:9,color,fontWeight:700,borderTop:`1px solid ${color}20`,paddingTop:3,marginTop:3}}>⌀ {teamElo(team)}</div>
  </div>;
}

// ─── Court Card (used in admin + viewer)
export function CourtCard({court,elapsed=0,onScore,onAssign,next=[],readOnly=false}: {
  court:any, elapsed?:number, onScore?:(id:string)=>void, onAssign?:(courtId:string,q:any)=>void, next?:any[], readOnly?:boolean
}) {
  const m = court.match;
  const mm = String(Math.floor((elapsed||0)/60)).padStart(2,"0");
  const ss = String((elapsed||0)%60).padStart(2,"0");
  const dc = DTYPE_OPT.find(d=>d.val===(m?.dtype||"any")) || DTYPE_OPT[3];
  const diff = m ? Math.abs(teamElo(m.team1)-teamElo(m.team2)) : 0;

  return <div style={{background:G.panel,border:`2px solid ${m?dc.color+"77":G.border}`,borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column"}}>
    {/* Header */}
    <div style={{padding:"8px 12px",background:m?dc.color+"14":G.card,display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${G.border}`}}>
      <div>
        <div style={{fontWeight:800,fontSize:13,color:G.text}}>{court.name}</div>
        {m && <DBadge dtype={m.dtype}/>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        {m && <div style={{fontFamily:"monospace",fontSize:15,fontWeight:900,color:dc.color}}>{mm}:{ss}</div>}
        <Chip label={m?"🔴 LIVE":"🟢 FREE"} color={m?G.red:G.accent}/>
      </div>
    </div>

    {/* Body */}
    <div style={{padding:10,flex:1}}>
      {m ? (<>
        <TBlock team={m.team1} label="TEAM A" color={G.accent}/>
        <div style={{textAlign:"center",padding:"4px 0",fontSize:9,color:G.dim}}>Δ{diff}{diff<40?" ✓":" ⚠"}</div>
        <TBlock team={m.team2} label="TEAM B" color={G.gold}/>
        {!readOnly && <button type="button" onClick={()=>onScore?.(court.id)}
          style={{...bP,width:"100%",marginTop:8,padding:"7px 0",fontSize:11}}>📊 Nhập tỉ số</button>}
      </>) : (
        <div style={{textAlign:"center",padding:"9px 0"}}>
          <div style={{fontSize:24,marginBottom:4}}>🏓</div>
          <div style={{fontSize:10,color:G.muted,marginBottom:8}}>Sân trống</div>
          {!readOnly && next?.length ? (
            <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap"}}>
              {next.map((q,i)=>{
                const qc = DTYPE_OPT.find(d=>d.val===q.dtype)?.color||G.accent;
                return <button key={i} type="button" onClick={()=>onAssign?.(court.id,q)}
                  style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${qc}`,background:qc+"14",color:qc,fontWeight:700,cursor:"pointer",fontSize:9}}>
                  ▶ {DTYPE_OPT.find(d=>d.val===q.dtype)?.label}
                </button>;
              })}
            </div>
          ) : <div style={{fontSize:9,color:G.dim}}>Chưa có trận</div>}
        </div>
      )}
    </div>
  </div>;
}

// ─── History card
export function HCard({h}: {h:any}) {
  if(!h?.team1||!h?.team2) return null;
  const dc = DTYPE_OPT.find(d=>d.val===h.dtype)||DTYPE_OPT[3];
  return <div style={{background:G.panel,borderRadius:8,padding:"8px 11px",border:`1px solid ${G.border}`}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
      <Chip label={dc.label} color={dc.color}/>
      <span style={{fontSize:9,color:G.muted}}>{h.time}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:5,alignItems:"center"}}>
      <div>{h.team1.filter(Boolean).map((p:any)=><div key={p.id} style={{fontSize:10,fontWeight:700,color:h.winner===1?G.accent:G.muted}}>{safe(p.name)}{h.winner===1?" 🏆":""}</div>)}</div>
      <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:900,color:G.accent}}>{h.score||"?"}</div></div>
      <div style={{textAlign:"right"}}>{h.team2.filter(Boolean).map((p:any)=><div key={p.id} style={{fontSize:10,fontWeight:700,color:h.winner===2?G.gold:G.muted}}>{h.winner===2?"🏆 ":""}{safe(p.name)}</div>)}</div>
    </div>
    <div style={{fontSize:8,color:G.dim,textAlign:"right",marginTop:3}}>±{h.eloDelta} ELO · {h.courtId}</div>
  </div>;
}
