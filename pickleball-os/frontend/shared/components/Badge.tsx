import React from 'react';
import { G, SKILL_COLOR, DTYPE_OPT, ROLES, safe } from '../theme';

export const SBadge = ({skill}: {skill:string}) => {
  const c = SKILL_COLOR[skill] || G.muted;
  return <span style={{fontSize:10,padding:"1px 5px",borderRadius:3,background:c+"25",color:c,border:`1px solid ${c}44`,fontWeight:700}}>{skill||"?"}</span>;
};

export const GBadge = ({gender}: {gender:string}) => {
  const c = gender==="M" ? "#60a5fa" : "#f472b6";
  return <span style={{fontSize:10,padding:"1px 5px",borderRadius:3,background:c+"20",color:c,fontWeight:700}}>{gender==="M"?"♂":"♀"}</span>;
};

export const DBadge = ({dtype}: {dtype:string}) => {
  const o = DTYPE_OPT.find(d=>d.val===dtype) || DTYPE_OPT[3];
  return <span style={{fontSize:10,padding:"1px 5px",borderRadius:3,background:o.color+"20",color:o.color,fontWeight:600}}>{o.label}</span>;
};

export const CBadge = ({type}: {type:string}) => (
  <span style={{fontSize:10,padding:"1px 5px",borderRadius:3,background:G.pink+"25",color:G.pink,fontWeight:700}}>{type==="spouse"?"💍":"💑"}</span>
);

export const Chip = ({label,color,sm}: {label:string,color?:string,sm?:boolean}) => {
  const c = color || G.muted;
  return <span style={{fontSize:sm?9:10,padding:sm?"1px 5px":"2px 8px",borderRadius:3,background:c+"20",color:c,border:`1px solid ${c}30`,fontWeight:700}}>{label}</span>;
};

export const RBadge = ({role}: {role:string}) => {
  const m: Record<string,{l:string,c:string}> = {
    [ROLES.SA]:     {l:"👑 Super Admin", c:"#f59e0b"},
    [ROLES.HOST]:   {l:"🎮 Host",        c:"#a78bfa"},
    [ROLES.VIEWER]: {l:"👁 Viewer",      c:"#4a6480"},
  };
  const r = m[role] || m[ROLES.VIEWER];
  return <span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:r.c+"20",color:r.c,fontWeight:700,border:`1px solid ${r.c}40`}}>{r.l}</span>;
};

export const SaveDot = ({saving}: {saving:boolean}) => (
  <span title={saving?"Đang lưu...":"Đã lưu"} style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:saving?"#f59e0b":"#00c9a7",boxShadow:saving?"0 0 6px #f59e0b88":"0 0 6px #00c9a744",transition:"background .4s"}}/>
);

export const SkillSelector = ({value,onChange}: {value:string,onChange: (s:string)=>void}) => {
  const levels = ["2.0","2.5","3.0","3.5","3.5+"];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
      {levels.map(s=>{
        const c = SKILL_COLOR[s];
        const sel = value===s;
        return <button key={s} type="button" onClick={()=>onChange(s)} style={{padding:"8px 3px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:11,textAlign:"center",border:`2px solid ${sel?c:G.border}`,background:sel?c+"28":"transparent",color:sel?c:G.muted}}>
          <div>{s}</div>
        </button>;
      })}
    </div>
  );
};
