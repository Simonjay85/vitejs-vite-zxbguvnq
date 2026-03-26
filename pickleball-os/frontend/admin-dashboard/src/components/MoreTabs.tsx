import React, { useState, useEffect, useRef } from 'react';
import { G, iS, bP, bS, DTYPE_OPT, SKILL_LEVELS, SKILL_COLOR, safe, sepc, uid, rng, skillElo, genCode, teamElo } from '../../../shared/theme';
import { SBadge, GBadge, DBadge, CBadge, Chip } from '../../../shared/components/Badge';
import { HCard } from '../../../shared/components/CourtCard';
import { EventModal as EvModal } from './Modals';

// ── History Tab
export function HistoryTab({history,events,players,activeEventId,onEditEvent,readOnly}: any) {
  const [view,setView] = useState('event');
  const [search,setSearch] = useState(''); const [filterDtype,setFilterDtype] = useState('all');
  const [editingEv,setEditingEv] = useState<any>(null); const [collapsed,setCollapsed] = useState<Record<string,boolean>>({});
  const togCollapse = (id:string) => setCollapsed(p=>({...p,[id]:!p[id]}));
  const byEvent: Record<string,any[]> = {};
  history.forEach((h:any)=>{const eid=h.eventId||'legacy';if(!byEvent[eid])byEvent[eid]=[];byEvent[eid].push(h);});
  const sq=safe(search).toLowerCase();
  const filterH=(hs:any[])=>{let arr=[...hs];if(sq)arr=arr.filter(h=>[...(h.team1||[]),...(h.team2||[])].filter(Boolean).some((p:any)=>safe(p.name).toLowerCase().includes(sq)));if(filterDtype!=='all')arr=arr.filter(h=>h.dtype===filterDtype);return arr;};
  const calcStats=(hs:any[])=>{const total=hs.length;const byDtype:Record<string,number>={};const topWinner:Record<string,any>={};hs.forEach(h=>{byDtype[h.dtype]=(byDtype[h.dtype]||0)+1;const wt=(h.winner===1?h.team1:h.team2)||[];wt.filter(Boolean).forEach((p:any)=>{topWinner[p.id]=(topWinner[p.id]||{name:p.name,wins:0});topWinner[p.id].wins++;});});const topP=Object.values(topWinner).sort((a:any,b:any)=>b.wins-a.wins).slice(0,3);const avgEloD=total?Math.round(hs.reduce((s,h)=>s+(h.eloDelta||0),0)/total):0;return{total,byDtype,topP,avgEloD};};

  const renderEventBlock=(ev:any,hs:any[],collapsed:boolean,onToggle:()=>void)=>{
    const st=calcStats(hs);
    return <div key={ev.id} style={{background:G.panel,borderRadius:12,border:`1px solid ${ev.id===activeEventId?G.accent+'66':G.border}`,marginBottom:12,overflow:'hidden'}}>
      <div onClick={onToggle} style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',background:ev.id===activeEventId?G.accent+'10':G.card,borderBottom:collapsed?undefined:`1px solid ${G.border}`}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}><span style={{fontSize:13,fontWeight:800,color:G.text}}>{ev.name}</span>{ev.id===activeEventId&&<Chip label="🔴 ACTIVE" color={G.accent} sm/>}</div>
          <div style={{display:'flex',gap:8,marginTop:3,flexWrap:'wrap'}}><span style={{fontSize:10,color:G.muted}}>{ev.date}</span>{ev.location&&<span style={{fontSize:10,color:G.blue}}>📍 {ev.location}</span>}<span style={{fontSize:10,color:G.gold}}>⚔️ {hs.length} trận</span></div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {!readOnly&&<button type="button" onClick={e=>{e.stopPropagation();setEditingEv(ev);}} style={{...bS,padding:'3px 8px',fontSize:10}}>✏️</button>}
          <span style={{color:G.muted,fontSize:12}}>{collapsed?'▶':'▼'}</span>
        </div>
      </div>
      {!collapsed && <div style={{padding:'10px 14px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:12}}>
          <div style={{textAlign:'center',padding:'7px',borderRadius:8,background:G.card,border:`1px solid ${G.border}`}}><div style={{fontSize:18,fontWeight:900,color:G.accent}}>{st.total}</div><div style={{fontSize:8,color:G.muted}}>Tổng trận</div></div>
          <div style={{textAlign:'center',padding:'7px',borderRadius:8,background:G.card,border:`1px solid ${G.border}`}}><div style={{fontSize:18,fontWeight:900,color:G.gold}}>±{st.avgEloD}</div><div style={{fontSize:8,color:G.muted}}>Avg ELO Δ</div></div>
          <div style={{textAlign:'center',padding:'7px',borderRadius:8,background:G.card,border:`1px solid ${G.border}`,gridColumn:'span 2'}}><div style={{fontSize:8,color:G.muted,marginBottom:4}}>TOP THẮNG</div>{st.topP.map((p:any,i:number)=><span key={i} style={{fontSize:9,color:G.gold,marginRight:6}}>{['🥇','🥈','🥉'][i]}{p.name}×{p.wins}</span>)}{!st.topP.length&&<span style={{fontSize:9,color:G.dim}}>–</span>}</div>
        </div>
        <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Tên..." style={{...iS,maxWidth:140,fontSize:11}}/>
          <select value={filterDtype} onChange={e=>setFilterDtype(e.target.value)} style={{...iS,maxWidth:110,fontSize:11}}><option value="all">Tất cả kiểu</option>{DTYPE_OPT.map(d=><option key={d.val} value={d.val}>{d.label}</option>)}</select>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:7}}>{filterH(hs).map(h=><HCard key={h.id} h={h}/>)}</div>
        {!filterH(hs).length&&<div style={{textAlign:'center',color:G.dim,padding:'16px 0',fontSize:11}}>Không có trận nào</div>}
      </div>}
    </div>;
  };

  return <div>
    {editingEv&&<EvModal event={editingEv} onSave={ev=>{onEditEvent&&onEditEvent(ev);setEditingEv(null);}} onClose={()=>setEditingEv(null)} isNew={false}/>}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <div style={{fontSize:14,fontWeight:800,color:G.text}}>📋 Lịch sử trận đấu</div>
      <div style={{display:'flex',gap:4}}>
        <button type="button" onClick={()=>setView('event')} style={{...bS,color:view==='event'?G.accent:G.muted,borderColor:view==='event'?G.accent:G.border,fontSize:11}}>🗓️ Theo event</button>
        <button type="button" onClick={()=>setView('all')} style={{...bS,color:view==='all'?G.accent:G.muted,borderColor:view==='all'?G.accent:G.border,fontSize:11}}>📊 Tổng hợp</button>
      </div>
    </div>
    {view==='event' ? (events.length===0?<div style={{textAlign:'center',color:G.dim,padding:'32px 0',fontSize:12}}>Chưa có event nào</div>:events.slice().reverse().map((ev:any)=>renderEventBlock(ev,byEvent[ev.id]||[],!!collapsed[ev.id],()=>togCollapse(ev.id)))) :
      <><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:7}}>{filterH(history).map(h=><HCard key={h.id} h={h}/>)}</div>{!filterH(history).length&&<div style={{textAlign:'center',color:G.dim,padding:'24px 0',fontSize:11}}>Không tìm thấy</div>}</>}
  </div>;
}

// ── Kiosk Tab (self-service check-in)
export function KioskTab({players,onRegister,queue,courts,history}: any) {
  const [step,setStep] = useState<'welcome'|'form'|'success'>('welcome');
  const [form,setForm] = useState({name:'',gender:'M',skill:'3.0',dtype:'any',cwith:'',ctype:'couple'});
  const [err,setErr]=useState(''); const [submitted,setSubmitted]=useState<any>(null);
  const [nameSearch,setNameSearch]=useState(''); const [autoReset,setAutoReset]=useState<number|null>(null);
  const timerRef=useRef<any>();
  const sf=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  const checkedIn=players.filter((p:any)=>p&&p.checkedIn&&p.name);
  const nsSafe=safe(nameSearch).toLowerCase();
  const suggestions=nsSafe.length>=1?players.filter((p:any)=>p&&p.name&&safe(p.name).toLowerCase().includes(nsSafe)).slice(0,5):[];
  const selectExisting=(p:any)=>{setForm({name:p.name,gender:p.gender,skill:p.skill,dtype:p.dtype||'any',cwith:'',ctype:'couple'});setNameSearch('');setStep('form');};
  const resetKiosk=()=>{setStep('welcome');setForm({name:'',gender:'M',skill:'3.0',dtype:'any',cwith:'',ctype:'couple'});setErr('');setSubmitted(null);setAutoReset(null);};
  useEffect(()=>{if(step==='success'){let t=20;setAutoReset(t);timerRef.current=setInterval(()=>{t--;setAutoReset(t);if(t<=0){clearInterval(timerRef.current);resetKiosk();}},1000);}return()=>clearInterval(timerRef.current);},[step]);

  const submit=()=>{
    const nm=safe(form.name).trim();if(!nm){setErr('Vui lòng nhập tên');return;}setErr('');
    const existing=players.find((p:any)=>p&&safe(p.name).toLowerCase()===nm.toLowerCase());
    let playerData:any;
    if(existing){if(existing.checkedIn){setErr(`${nm} đã check in rồi!`);return;}const cid=form.cwith?(existing.coupleId||`couple-${uid()}`):existing.coupleId;playerData={...existing,gender:form.gender,skill:form.skill,dtype:form.dtype,checkedIn:true,coupleId:form.cwith?cid:existing.coupleId,coupleType:form.cwith?form.ctype:existing.coupleType,coupleWithId:form.cwith||null,isNew:false};}
    else{playerData={id:uid(),name:nm,gender:form.gender,skill:form.skill,elo:skillElo(form.skill),dtype:form.dtype,checkedIn:true,gamesPlayed:0,wins:0,lastPartners:[],coupleId:form.cwith?`couple-${uid()}`:null,coupleType:form.cwith?form.ctype:null,coupleWithId:form.cwith||null,createdAt:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}),isNew:true,viewerCode:genCode()};}
    onRegister(playerData);setSubmitted(playerData);setStep('success');
  };

  if(step==='welcome') return <div style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
    <div style={{width:'100%',maxWidth:500,textAlign:'center'}}>
      <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:32}}>
        {[{v:courts.filter((c:any)=>c.match).length,l:'Sân live',c:G.red},{v:players.filter((p:any)=>p?.checkedIn).length,l:'Check-in',c:G.accent},{v:queue.length,l:'Queue',c:G.purple}].map(s=>(
          <div key={s.l} style={{padding:'10px 20px',borderRadius:12,background:s.c+'18',border:`1px solid ${s.c}44`,textAlign:'center'}}><div style={{fontSize:28,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:G.muted}}>{s.l}</div></div>
        ))}
      </div>
      <div style={{fontSize:56,marginBottom:12}}>🏓</div>
      <div style={{fontSize:26,fontWeight:900,color:'#fff',marginBottom:8}}>Chào mừng!</div>
      <div style={{fontSize:14,color:G.muted,marginBottom:32}}>Tự đăng ký để vào hàng chờ</div>
      <div style={{marginBottom:20}}>
        <input value={nameSearch} onChange={e=>setNameSearch(e.target.value)} placeholder="Tìm tên nhanh..." style={{...iS,fontSize:16,padding:'12px 16px',borderRadius:12,textAlign:'center'}} autoComplete="off"/>
        {suggestions.length>0&&<div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
          {suggestions.map((p:any)=><button key={p.id} type="button" onClick={()=>selectExisting(p)} disabled={p.checkedIn} style={{padding:'10px 16px',borderRadius:10,border:`1px solid ${p.checkedIn?G.accent+'66':G.border}`,background:p.checkedIn?G.accent+'10':G.card,cursor:p.checkedIn?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10,width:'100%'}}>
            <div style={{flex:1,textAlign:'left'}}><div style={{fontSize:13,fontWeight:700,color:p.checkedIn?G.muted:G.text}}>{safe(p.name)}</div><div style={{display:'flex',gap:4,marginTop:2}}><GBadge gender={p.gender}/><SBadge skill={p.skill}/></div></div>
            {p.checkedIn?<span style={{fontSize:10,color:G.accent}}>✅ Đã vào</span>:<span style={{fontSize:10,color:G.accent}}>Chọn →</span>}
          </button>)}
        </div>}
      </div>
      <button onClick={()=>{setNameSearch('');setStep('form');}} style={{...bP,width:'100%',padding:'18px',fontSize:16,borderRadius:14}}>✏️ Đăng ký mới</button>
      {history.length>0&&<div style={{marginTop:28,padding:'14px 16px',borderRadius:12,background:G.panel,border:`1px solid ${G.border}`}}>
        <div style={{fontSize:11,color:G.gold,fontWeight:700,marginBottom:10}}>🏆 TOP SEPC</div>
        {[...players].filter((p:any)=>p?.name).map((p:any)=>({...p,k:sepc(p,history)})).sort((a:any,b:any)=>b.k-a.k).slice(0,3).map((p:any,i:number)=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:i<2?6:0}}>
            <span style={{fontSize:14}}>{['🥇','🥈','🥉'][i]}</span>
            <span style={{fontSize:13,fontWeight:700,color:G.text,flex:1}}>{safe(p.name)}</span>
            <span style={{fontSize:13,fontWeight:800,color:G.gold}}>{p.k>0?'+':''}{p.k}</span>
          </div>
        ))}
      </div>}
    </div>
  </div>;

  if(step==='form') return <div style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 16px'}}>
    <div style={{width:'100%',maxWidth:480}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}><button onClick={resetKiosk} style={{...bS,padding:'6px 12px'}}>← Quay lại</button><div style={{fontSize:18,fontWeight:900,color:'#fff'}}>📝 Thông tin</div></div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:G.muted,fontWeight:700,marginBottom:6}}>👤 TÊN *</div>
        <input value={form.name} onChange={e=>{sf('name',e.target.value);setErr('');}} placeholder="Tên đầy đủ..." style={{...iS,fontSize:18,padding:'14px 16px',borderRadius:12,border:`2px solid ${form.name?G.accent:G.border}`}} autoFocus autoComplete="off"/>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:G.muted,fontWeight:700,marginBottom:6}}>⚥ GIỚI TÍNH</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[{v:'M',l:'♂ Nam',c:'#60a5fa',e:'👨'},{v:'F',l:'♀ Nữ',c:'#f472b6',e:'👩'}].map(g=>(
            <button key={g.v} type="button" onClick={()=>sf('gender',g.v)} style={{padding:'16px',borderRadius:12,cursor:'pointer',fontWeight:700,fontSize:16,textAlign:'center',border:`3px solid ${form.gender===g.v?g.c:G.border}`,background:form.gender===g.v?g.c+'25':'transparent',color:form.gender===g.v?g.c:G.muted,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontSize:28}}>{g.e}</span>{g.l}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:G.muted,fontWeight:700,marginBottom:6}}>🎯 TRÌNH ĐỘ</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
          {SKILL_LEVELS.map(s=>{const c=SKILL_COLOR[s];const sel=form.skill===s;return(
            <button key={s} type="button" onClick={()=>sf('skill',s)} style={{padding:'12px 4px',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:13,textAlign:'center',border:`3px solid ${sel?c:G.border}`,background:sel?c+'28':'transparent',color:sel?c:G.muted,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span style={{fontSize:15,fontWeight:900}}>{s}</span>
            </button>
          );})}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:G.muted,fontWeight:700,marginBottom:6}}>⤴ KIỂU ĐÔI</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {DTYPE_OPT.map(d=>{const sel=form.dtype===d.val;return(
            <button key={d.val} type="button" onClick={()=>sf('dtype',d.val)} style={{padding:'12px 10px',borderRadius:10,cursor:'pointer',fontSize:12,fontWeight:700,textAlign:'center',border:`3px solid ${sel?d.color:G.border}`,background:sel?d.color+'22':'transparent',color:sel?d.color:G.muted,display:'flex',flexDirection:'column',gap:2,alignItems:'center'}}>
              <span style={{fontSize:18}}>{d.label.split(' ')[0]}</span><span>{d.label.split(' ').slice(1).join(' ')}</span>
            </button>
          );})}
        </div>
      </div>
      {checkedIn.length>0&&<div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:G.muted,fontWeight:700,marginBottom:6}}>💑 KẾT ĐÔI (tuỳ chọn)</div>
        <select value={form.cwith} onChange={e=>sf('cwith',e.target.value)} style={{...iS,fontSize:13,padding:'10px 14px',borderRadius:10}}>
          <option value="">-- Không kết đôi --</option>
          {checkedIn.filter((p:any)=>safe(p.name).toLowerCase()!==safe(form.name).toLowerCase().trim()).map((p:any)=>(<option key={p.id} value={p.id}>{safe(p.name)} ({p.gender==='M'?'Nam':'Nữ'}, {p.skill})</option>))}
        </select>
      </div>}
      {err&&<div style={{padding:'12px 16px',borderRadius:10,background:G.red+'15',border:`1px solid ${G.red}44`,color:G.red,fontSize:13,fontWeight:600,marginBottom:14}}>⚠️ {err}</div>}
      <button onClick={submit} style={{...bP,width:'100%',padding:'18px',fontSize:16,borderRadius:14}}>✅ Xác nhận & Vào hàng chờ</button>
    </div>
  </div>;

  if(step==='success'&&submitted) return <div style={{minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
    <div style={{width:'100%',maxWidth:440,textAlign:'center'}}>
      <div style={{fontSize:64,marginBottom:8}}>🎉</div>
      <div style={{fontSize:22,fontWeight:900,color:G.accent,marginBottom:4}}>Check in thành công!</div>
      <div style={{fontSize:26,fontWeight:900,color:'#fff',marginBottom:16}}>{safe(submitted.name)}</div>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:20,flexWrap:'wrap'}}><GBadge gender={submitted.gender}/><SBadge skill={submitted.skill}/><DBadge dtype={submitted.dtype}/>{submitted.isNew&&<Chip label="🆕 Mới" color={G.gold}/>}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
        <div style={{padding:'16px',borderRadius:12,background:G.accent+'15',border:`1px solid ${G.accent}44`,textAlign:'center'}}><div style={{fontSize:9,color:G.muted,marginBottom:4}}>TRẠNG THÁI</div><div style={{fontSize:16,fontWeight:900,color:G.accent}}>⏳ Chờ đấu</div></div>
        <div style={{padding:'16px',borderRadius:12,background:G.purple+'15',border:`1px solid ${G.purple}44`,textAlign:'center'}}><div style={{fontSize:9,color:G.muted,marginBottom:4}}>ĐANG CHỜ</div><div style={{fontSize:16,fontWeight:900,color:G.purple}}>{players.filter((p:any)=>p?.checkedIn).length} người</div></div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        {courts.map((c:any)=><div key={c.id} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:7,background:c.match?G.red+'15':G.accent+'15',border:`1px solid ${c.match?G.red+'44':G.accent+'44'}`}}><div style={{width:6,height:6,borderRadius:'50%',background:c.match?G.red:G.accent}}/><span style={{fontSize:10,color:G.text}}>{c.name.replace('Sân ','S')}</span></div>)}
      </div>
      <div style={{marginBottom:16,fontSize:12,color:G.dim}}>Reset sau <span style={{color:G.accent,fontWeight:700}}>{autoReset}s</span></div>
      <button onClick={resetKiosk} style={{...bP,width:'100%',padding:'14px',fontSize:14,borderRadius:12}}>🔄 Người tiếp theo</button>
    </div>
  </div>;
  return null;
}

// ── TV Mode
export function TVMode({courts,elapsed,queue,players,history,onClose}: any) {
  const top6=[...players].filter((p:any)=>p?.name).map((p:any)=>({...p,k:sepc(p,history)})).sort((a:any,b:any)=>b.k-a.k).slice(0,6);
  return <div style={{position:'fixed',inset:0,zIndex:800,background:'#000',display:'flex',flexDirection:'column'}}>
    <div style={{padding:'7px 16px',background:'#050d18',borderBottom:'2px solid #0c2040',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{fontSize:16,fontWeight:900,letterSpacing:2,color:G.accent}}>🏓 PICKLEBALL OS — LIVE</span>
      <button onClick={onClose} style={bS}>✕ Đóng TV</button>
    </div>
    <div style={{flex:1,display:'flex',gap:9,padding:9,overflow:'hidden'}}>
      <div style={{flex:3,display:'flex',flexDirection:'column',gap:7}}>
        <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7}}>
          {courts.map((ct:any)=>{const m=ct.match;const el=elapsed[ct.id]||0;const mm=String(Math.floor(el/60)).padStart(2,'0'),ss=String(el%60).padStart(2,'0');const dc=DTYPE_OPT.find(d=>d.val===(m?.dtype||'any'))||DTYPE_OPT[3];
            return <div key={ct.id} style={{background:m?'#081810':'#060e18',borderRadius:11,border:`2px solid ${m?dc.color+'66':G.border}`,display:'flex',flexDirection:'column',padding:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}><span style={{fontSize:13,fontWeight:900,color:G.text}}>{ct.name}</span>{m&&<span style={{fontFamily:'monospace',fontSize:13,color:dc.color}}>{mm}:{ss}</span>}</div>
              {m?<>
                <div style={{padding:'4px 6px',borderRadius:7,background:G.accent+'10',border:`1px solid ${G.accent}30`,marginBottom:4}}>{(m.team1||[]).filter(Boolean).map((p:any)=><div key={p.id} style={{fontSize:10,color:G.text}}>{safe(p.name)}</div>)}</div>
                <div style={{textAlign:'center',fontSize:10,color:G.dim,margin:'2px 0'}}>VS</div>
                <div style={{padding:'4px 6px',borderRadius:7,background:G.gold+'10',border:`1px solid ${G.gold}30`}}>{(m.team2||[]).filter(Boolean).map((p:any)=><div key={p.id} style={{fontSize:10,color:G.text}}>{safe(p.name)}</div>)}</div>
              </>:<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}><div style={{fontSize:20,color:G.accent}}>🟢</div><div style={{fontSize:10,color:G.muted,marginTop:3}}>READY</div></div>}
            </div>;
          })}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
          <div style={{background:'#080f1e',borderRadius:8,padding:'7px 11px',border:`1px solid ${G.blue}44`}}>
            <div style={{fontSize:9,letterSpacing:3,color:G.blue,marginBottom:5}}>⚡ QUEUE ({queue.length})</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {queue.slice(0,3).map((q:any,i:number)=><div key={i} style={{fontSize:10,color:G.text}}>{(q.team1||[]).filter(Boolean).map((p:any)=>safe(p.name).split(' ').pop()).join('+')} vs {(q.team2||[]).filter(Boolean).map((p:any)=>safe(p.name).split(' ').pop()).join('+')}</div>)}
              {!queue.length&&<div style={{color:G.dim,fontSize:10}}>Queue trống</div>}
            </div>
          </div>
          <div style={{background:'#080f1e',borderRadius:8,padding:'7px 11px',border:`1px solid ${G.gold}44`}}>
            <div style={{fontSize:9,letterSpacing:3,color:G.gold,marginBottom:5}}>🏆 TOP SEPC</div>
            <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
              {top6.map((p:any,i:number)=><div key={p.id} style={{display:'flex',gap:3,alignItems:'center'}}><span style={{color:i===0?G.gold:G.dim,fontSize:10}}>#{i+1}</span><span style={{fontSize:11,color:G.text}}>{safe(p.name)}</span><span style={{fontSize:11,color:G.accent,fontWeight:800}}>{p.k>0?'+':''}{p.k}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
