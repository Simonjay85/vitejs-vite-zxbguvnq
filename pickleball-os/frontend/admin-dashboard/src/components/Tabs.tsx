import React, { useState } from 'react';
import { G, iS, bP, bS, bR, SKILL_LEVELS, SKILL_COLOR, DTYPE_OPT, safe, sepc, teamElo, getTier } from '../../../shared/theme';
import { SBadge, GBadge, DBadge, CBadge, Chip } from '../../../shared/components/Badge';
import { CourtCard, HCard } from '../../../shared/components/CourtCard';
import { MBox } from '../../../shared/components/Modal';

// ── QRow — inline here for simplicity
function QRow({q,idx,courts,onAssign,onRemove,readOnly}: {q:any,idx:number,courts:any[],onAssign?:(cid:string,q:any)=>void,onRemove?:()=>void,readOnly?:boolean}) {
  const free = courts.filter(c=>!c.match);
  const diff = Math.abs(teamElo(q.team1||[])-teamElo(q.team2||[]));
  return <div style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',borderRadius:8,background:G.card,border:`1px solid ${q.challengeMatch?G.red+'44':q.custom?G.purple+'44':q.coupleMatch?G.pink+'44':G.border}`}}>
    <span style={{fontSize:10,fontWeight:700,color:G.muted,minWidth:14}}>#{idx+1}</span>
    {q.custom&&!q.challengeMatch&&<Chip label="✏️" color={G.purple} sm/>}{q.coupleMatch&&<Chip label="💑" color={G.pink} sm/>}{q.challengeMatch&&<Chip label="⚔️" color={G.red} sm/>}
    <DBadge dtype={q.dtype}/>
    <div style={{flex:1}}><div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
      {(q.team1||[]).filter(Boolean).map((p:any)=><span key={p.id} style={{fontSize:10,color:G.accent,fontWeight:600}}>{safe(p.name)}</span>)}
      <span style={{fontSize:10,color:G.dim}}>vs</span>
      {(q.team2||[]).filter(Boolean).map((p:any)=><span key={p.id} style={{fontSize:10,color:G.gold,fontWeight:600}}>{safe(p.name)}</span>)}
      <Chip label={`Δ${diff}`} color={diff<40?G.accent:G.gold} sm/>
    </div></div>
    {!readOnly && <div style={{display:'flex',gap:3}}>
      {free.slice(0,2).map(c=><button key={c.id} type="button" onClick={()=>onAssign?.(c.id,q)} style={{padding:'3px 7px',borderRadius:5,border:'none',background:G.accent,color:'#fff',cursor:'pointer',fontWeight:700,fontSize:9}}>▶{c.name.replace('Sân ','S')}</button>)}
      {onRemove&&<button type="button" onClick={onRemove} style={{padding:'3px 6px',borderRadius:5,border:`1px solid ${G.red}44`,background:'transparent',color:G.red,cursor:'pointer',fontSize:9}}>✕</button>}
    </div>}
  </div>;
}

// ── Dashboard Tab
export function DashTab({courts,players,queue,setQueue,pendingChallenges,onApproveChallenge,onRejectChallenge,history,elapsed,available,onScore,onAssign,genQ,autoAss,onCustom,onQR,activeEvent}: any) {
  const ci = players.filter((p:any)=>p?.checkedIn).length;
  return <div>
    {activeEvent && <div style={{padding:'8px 14px',borderRadius:10,background:G.accent+'12',border:`1px solid ${G.accent}44`,marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:G.red,boxShadow:`0 0 8px ${G.red}`}}/>
      <div><span style={{fontSize:12,fontWeight:800,color:G.accent}}>🗓️ {activeEvent.name}</span>{activeEvent.location&&<span style={{fontSize:10,color:G.muted,marginLeft:8}}>📍 {activeEvent.location}</span>}</div>
      <div style={{marginLeft:'auto',fontSize:10,color:G.muted}}>{activeEvent.date}</div>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:11}}>
      {[{i:'👥',l:'Tổng',v:players.length,c:G.blue},{i:'✅',l:'Check-in',v:ci,c:G.accent},{i:'⏳',l:'Chờ',v:available.length,c:G.purple},{i:'🔴',l:'Live',v:courts.filter((c:any)=>c.match).length,c:G.gold},{i:'📋',l:'Queue',v:queue.length,c:G.purple},{i:'🏆',l:'Kết thúc',v:history.filter((h:any)=>h.eventId===activeEvent?.id).length,c:'#34d399'}].map(s=>(
        <div key={s.l} style={{background:G.panel,border:`1px solid ${G.border}`,borderRadius:10,padding:'10px 7px',textAlign:'center'}}>
          <div style={{fontSize:16,marginBottom:2}}>{s.i}</div><div style={{fontSize:24,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:8,color:G.muted,marginTop:2}}>{s.l}</div>
        </div>
      ))}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,marginBottom:11,background:G.panel,border:`1px solid ${G.border}`,borderRadius:11,padding:11}}>
      <div>
        <div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:3,marginBottom:8}}>⚡ QUEUE ({queue.length})</div>
        {!queue.length ? <div style={{color:G.dim,fontSize:11}}>Queue trống</div> :
          <div style={{display:'flex',flexDirection:'column',gap:4}}>{queue.slice(0,5).map((q:any,i:number)=><QRow key={i} q={q} idx={i} courts={courts} onAssign={onAssign} onRemove={()=>setQueue((p:any[])=>p.filter((_:any,j:number)=>j!==i))}/>)}</div>}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5,minWidth:130}}>
        <button onClick={onQR} style={{...bP,background:`linear-gradient(135deg,${G.gold},${G.red})`,fontSize:11,padding:'9px 12px'}}>📷 QR Check-in</button>
        <button onClick={onCustom} style={{...bS,color:G.purple,border:`1px solid ${G.purple}44`,fontSize:11}}>✏️ Custom</button>
        <button onClick={genQ} style={{...bS,fontSize:11}}>🎲 Tạo trận</button>
        <button onClick={autoAss} style={{...bP,fontSize:11,padding:'9px 12px'}}>▶ Auto gán</button>
      </div>
    </div>
    {pendingChallenges?.length > 0 && <div style={{marginBottom:12,padding:'10px 14px',borderRadius:11,background:G.gold+'15',border:`1px solid ${G.gold}44`}}>
      <div style={{fontSize:11,color:G.gold,fontWeight:800,marginBottom:8}}>🔔 Lời Thách Đấu ({pendingChallenges.length})</div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>{pendingChallenges.map((c:any)=>(
        <div key={c.id} style={{padding:'8px 12px',borderRadius:8,background:G.panel,border:`1px solid ${G.border}`,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <div style={{flex:1,fontSize:12,fontWeight:700,color:G.text}}>
            <span style={{color:G.accent}}>{safe(c.challenger.name)}</span> + {safe(c.partner.name)} <span style={{color:G.dim,margin:'0 6px'}}>vs</span> <span style={{color:G.gold}}>{safe(c.opp1.name)}</span> + {safe(c.opp2.name)}
          </div>
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>onApproveChallenge(c.id)} style={{...bP,padding:'5px 10px',fontSize:11}}>✓ Duyệt</button>
            <button onClick={()=>onRejectChallenge(c.id)} style={{...bS,padding:'5px 10px',fontSize:11}}>✕ Từ chối</button>
          </div>
        </div>
      ))}</div>
    </div>}
    <div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:2,marginBottom:7}}>🏟️ 5 SÂN</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
      {courts.map((c:any)=><CourtCard key={c.id} court={c} elapsed={elapsed[c.id]||0} next={queue.slice(0,3)} onScore={onScore} onAssign={onAssign}/>)}
    </div>
    {history.filter((h:any)=>h.eventId===activeEvent?.id).length > 0 && <>
      <div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:2,margin:'14px 0 7px'}}>📋 KẾT QUẢ GẦN ĐÂY</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:8}}>
        {history.filter((h:any)=>h.eventId===activeEvent?.id).slice(0,4).map((h:any)=><HCard key={h.id} h={h}/>)}
      </div>
    </>}
  </div>;
}

// ── Players Tab
export function PlayersTab({players,playIds,history,onToggle,onAdd,onCouple,onQR,onShowProfile}: any) {
  const [search,setSearch]=useState(''); const [fG,setFG]=useState('all'); const [fS,setFS]=useState('all');
  const [fSt,setFSt]=useState('all'); const [sort,setSort]=useState('sepc');
  let list=[...players].filter((p:any)=>p?.name);
  const sq=safe(search).toLowerCase();
  if(sq)list=list.filter((p:any)=>safe(p.name).toLowerCase().includes(sq));
  if(fG!=='all')list=list.filter((p:any)=>p.gender===fG); if(fS!=='all')list=list.filter((p:any)=>p.skill===fS);
  if(fSt==='in')list=list.filter((p:any)=>p.checkedIn); else if(fSt==='out')list=list.filter((p:any)=>!p.checkedIn);
  else if(fSt==='playing')list=list.filter((p:any)=>playIds.has(p.id)); else if(fSt==='couple')list=list.filter((p:any)=>p.coupleId);
  list.sort((a:any,b:any)=>{if(sort==='sepc')return sepc(b,history)-sepc(a,history);if(sort==='elo')return(b.elo||0)-(a.elo||0);if(sort==='name')return safe(a.name).localeCompare(safe(b.name));return(b.gamesPlayed||0)-(a.gamesPlayed||0);});
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
      <div style={{fontSize:14,fontWeight:800,color:G.text}}>👥 Người chơi ({players.length})</div>
      <div style={{display:'flex',gap:5}}>
        <button onClick={onQR} style={{...bP,background:`linear-gradient(135deg,${G.gold},${G.red})`,fontSize:11}}>📷 QR</button>
        <button onClick={onCouple} style={{...bS,color:G.pink,border:`1px solid ${G.pink}44`}}>💑</button>
        <button onClick={onAdd} style={bP}>+ Thêm</button>
      </div>
    </div>
    <div style={{display:'flex',gap:5,marginBottom:9,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Tên..." style={{...iS,maxWidth:150}}/>
      <select value={fG} onChange={e=>setFG(e.target.value)} style={{...iS,maxWidth:85}}><option value="all">Tất cả</option><option value="M">♂ Nam</option><option value="F">♀ Nữ</option></select>
      <select value={fS} onChange={e=>setFS(e.target.value)} style={{...iS,maxWidth:100}}><option value="all">Mọi trình</option>{SKILL_LEVELS.map(s=><option key={s} value={s}>{s}</option>)}</select>
      <select value={fSt} onChange={e=>setFSt(e.target.value)} style={{...iS,maxWidth:115}}><option value="all">Tất cả</option><option value="in">✅ Check-in</option><option value="out">❌ Chưa vào</option><option value="playing">🔴 Đang đấu</option><option value="couple">💑 Couple</option></select>
      <select value={sort} onChange={e=>setSort(e.target.value)} style={{...iS,maxWidth:110}}><option value="sepc">↓ Sepc</option><option value="elo">↓ ELO</option><option value="name">↓ Tên</option><option value="games">↓ Trận</option></select>
    </div>
    <div style={{background:G.panel,borderRadius:11,border:`1px solid ${G.border}`,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'150px 40px 50px 80px 45px 40px 42px 64px 60px 76px',padding:'7px 12px',borderBottom:`1px solid ${G.border}`,fontSize:9,color:G.muted,fontWeight:700}}>
        <div>TÊN</div><div>G</div><div>TRÌNH</div><div>TRẠNG THÁI</div><div>ELO</div><div>TRẬN</div><div>WIN%</div><div>SEPC</div><div>MÃ</div><div>ACTION</div>
      </div>
      {list.map((p:any,i:number)=>{
        const playing=playIds.has(p.id),wr=(p.gamesPlayed||0)?Math.round((p.wins||0)/(p.gamesPlayed||1)*100):0,k=Math.round(sepc(p,history)*10)/10;
        return <div key={p.id} style={{display:'grid',gridTemplateColumns:'150px 40px 50px 80px 45px 40px 42px 64px 60px 76px',padding:'7px 12px',borderBottom:i<list.length-1?`1px solid ${G.border}22`:undefined,background:i%2?'transparent':G.card+'44',alignItems:'center'}}>
          <div onClick={()=>onShowProfile(p.id)} style={{fontSize:11,fontWeight:700,color:G.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:3,cursor:'pointer'}}>
            {safe(p.name)}{p.membership&&new Date(p.membership.expiresAt)>new Date()&&<span style={{fontSize:10}}>💎</span>}{p.coupleId&&<CBadge type={p.coupleType}/>}
          </div>
          <div><GBadge gender={p.gender}/></div><div><SBadge skill={p.skill}/></div>
          <div>{playing?<Chip label="🔴 Đấu" color={G.red}/>:p.checkedIn?<Chip label="⏳ Chờ" color={G.purple}/>:<Chip label="❌ Out" color={G.muted}/>}</div>
          <div style={{fontSize:12,fontWeight:900,color:SKILL_COLOR[p.skill]||G.muted}}>{p.elo||'?'}</div>
          <div style={{fontSize:10,color:G.muted}}>{p.gamesPlayed||0}</div>
          <div style={{fontSize:10,color:wr>=50?G.accent:G.red,fontWeight:700}}>{wr}%</div>
          <div style={{fontSize:11,fontWeight:800,color:k>0?G.gold:k<0?G.red:G.muted}}>{k>0?'+':''}{k}</div>
          <div style={{fontSize:10,fontFamily:'monospace',color:G.gold,letterSpacing:1,fontWeight:700}}>{p.viewerCode||'---'}</div>
          <div><button onClick={()=>onToggle(p.id)} style={{padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',fontWeight:700,fontSize:9,background:p.checkedIn?G.accent+'22':`linear-gradient(135deg,${G.accent},${G.blue})`,color:p.checkedIn?G.accent:'#fff'}}>{p.checkedIn?'✅ IN':'Check In'}</button></div>
        </div>;
      })}
    </div>
  </div>;
}

// ── Queue Tab
export function QueueTab({queue,setQueue,courts,available,history,elapsed,onScore,onAssign,genQ,autoAss,onCustom}: any) {
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11}}>
      <div style={{fontSize:14,fontWeight:800,color:G.text}}>⚔️ Queue & Live</div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={onCustom} style={{...bS,color:G.purple,border:`1px solid ${G.purple}44`}}>✏️ Custom</button>
        <button onClick={genQ} style={bS}>🎲 Tạo trận</button>
        <button onClick={autoAss} style={bP}>▶ Auto gán</button>
      </div>
    </div>
    <div style={{background:G.panel,border:`1px solid ${G.border}`,borderRadius:11,padding:11,marginBottom:11}}>
      <div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:7}}>⏳ CHỜ ({available.length})</div>
      {!available.length ? <div style={{color:G.dim,fontSize:11}}>Tất cả đang đấu</div> :
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {[...available].sort((a:any,b:any)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map((p:any)=>(
            <div key={p.id} style={{padding:'4px 9px',borderRadius:7,background:G.card,border:`1px solid ${(p.gamesPlayed||0)===0?G.gold+'66':G.border}`,display:'flex',alignItems:'center',gap:5}}>
              {(p.gamesPlayed||0)===0&&<span style={{fontSize:9,color:G.gold}}>🆕</span>}
              <span style={{fontSize:11,fontWeight:700,color:G.text}}>{safe(p.name)}</span><SBadge skill={p.skill}/><GBadge gender={p.gender}/>
            </div>
          ))}
        </div>}
    </div>
    {queue.length > 0 && <div style={{marginBottom:11}}>
      <div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:6}}>📋 QUEUE ({queue.length})</div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>{queue.map((q:any,i:number)=><QRow key={i} q={q} idx={i} courts={courts} onAssign={onAssign} onRemove={()=>setQueue((p:any[])=>p.filter((_:any,j:number)=>j!==i))}/>)}</div>
    </div>}
    <div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:6}}>🔴 ĐANG ĐẤU</div>
    {!courts.filter((c:any)=>c.match).length ? <div style={{color:G.dim,fontSize:11}}>Chưa có</div> :
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:9}}>
        {courts.filter((c:any)=>c.match).map((c:any)=><CourtCard key={c.id} court={c} elapsed={elapsed[c.id]||0} next={[]} onScore={onScore} onAssign={onAssign}/>)}
      </div>}
  </div>;
}

// ── Leaderboard
export function LeaderView({ranked,onShowProfile}: {ranked:any[],onShowProfile:(id:string)=>void}) {
  return <div>
    <div style={{fontSize:14,fontWeight:800,color:G.text,marginBottom:14}}>🏆 Bảng xếp hạng Sepc</div>
    {ranked.slice(0,3).length > 0 && <div style={{display:'flex',gap:10,marginBottom:16,justifyContent:'center',alignItems:'flex-end'}}>
      {[ranked[1],ranked[0],ranked[2]].filter(Boolean).map((p:any,pi:number)=>{
        const rank=pi===0?2:pi===1?1:3;const h=rank===1?120:rank===2?90:75;const c=rank===1?G.gold:rank===2?'#9ca3af':'#b87333';
        return <div key={p.id} style={{textAlign:'center',width:120}}>
          <div style={{fontSize:11,fontWeight:800,color:G.text,marginBottom:3}}>{safe(p.name)}</div>
          <div style={{display:'flex',gap:3,justifyContent:'center',marginBottom:3}}><SBadge skill={p.skill}/><GBadge gender={p.gender}/></div>
          <div style={{fontSize:rank===1?22:18,fontWeight:900,color:c,marginBottom:4}}>{p.k>0?'+':''}{p.k}</div>
          <div style={{height:h,background:`${c}22`,border:`2px solid ${c}55`,borderRadius:'7px 7px 0 0',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:6}}>
            <span style={{fontSize:rank===1?28:22}}>{rank===1?'🥇':rank===2?'🥈':'🥉'}</span>
          </div>
        </div>;
      })}
    </div>}
    <div style={{background:G.panel,borderRadius:11,border:`1px solid ${G.border}`,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'38px 1fr 48px 55px 60px 48px 46px 76px',padding:'7px 12px',borderBottom:`1px solid ${G.border}`,fontSize:9,color:G.muted,fontWeight:700}}>
        <div>#</div><div>TÊN</div><div>G</div><div>TRÌNH</div><div>ELO</div><div>TRẬN</div><div>WIN%</div><div>SEPC</div>
      </div>
      {ranked.map((p:any,i:number)=>{
        const wr=(p.gamesPlayed||0)?Math.round((p.wins||0)/(p.gamesPlayed||1)*100):0;
        return <div key={p.id} onClick={()=>onShowProfile(p.id)} style={{display:'grid',gridTemplateColumns:'38px 1fr 48px 55px 60px 48px 46px 76px',padding:'7px 12px',borderBottom:i<ranked.length-1?`1px solid ${G.border}22`:undefined,background:i%2?'transparent':G.card+'44',alignItems:'center',cursor:'pointer'}}>
          <div style={{fontSize:12,fontWeight:800,color:i<3?[G.gold,'#9ca3af','#b87333'][i]:G.muted}}>{i<3?['🥇','🥈','🥉'][i]:`#${i+1}`}</div>
          <div style={{fontSize:11,fontWeight:700,color:G.text,display:'flex',alignItems:'center',gap:3}}>{safe(p.name)}{p.membership&&new Date(p.membership.expiresAt)>new Date()&&<span style={{fontSize:10}}>💎</span>}{p.coupleId&&<CBadge type={p.coupleType}/>}{p.checkedIn&&<span style={{fontSize:8,color:G.accent}}>●</span>}</div>
          <div><GBadge gender={p.gender}/></div><div><SBadge skill={p.skill}/></div>
          <div style={{fontSize:12,fontWeight:900,color:SKILL_COLOR[p.skill]||G.muted}}>{p.elo||'?'}</div>
          <div style={{fontSize:10,color:G.muted}}>{p.gamesPlayed||0}</div>
          <div style={{fontSize:10,color:wr>=50?G.accent:G.red,fontWeight:700}}>{wr}%</div>
          <div style={{fontSize:13,fontWeight:800,color:p.k>0?G.gold:p.k<0?G.red:G.muted}}>{p.k>0?'+':''}{p.k}</div>
        </div>;
      })}
    </div>
  </div>;
}

// ── Analytics View
export function AnalyticsView({players,history,courts}: {players:any[],history:any[],courts:any[]}) {
  const ci=players.filter((p:any)=>p?.checkedIn&&p.name);
  const males=ci.filter((p:any)=>p.gender==='M').length,females=ci.filter((p:any)=>p.gender==='F').length;
  const bySkill=SKILL_LEVELS.map(s=>({skill:s,total:players.filter((p:any)=>p?.skill===s).length,in:ci.filter((p:any)=>p.skill===s).length}));
  const maxSk=Math.max(...bySkill.map(s=>s.total),1);
  return <div>
    <div style={{fontSize:14,fontWeight:800,color:G.text,marginBottom:12}}>📈 Thống kê</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:11,marginBottom:11}}>
      <div style={{background:G.panel,borderRadius:11,border:`1px solid ${G.border}`,padding:13}}>
        <div style={{fontSize:8,fontWeight:700,color:G.muted,letterSpacing:1,marginBottom:10}}>⚥ GIỚI TÍNH</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:12,justifyContent:'center',height:70}}>
          {[{l:'♂',v:males,c:'#60a5fa'},{l:'♀',v:females,c:'#f472b6'}].map(g=>(
            <div key={g.l} style={{textAlign:'center'}}><div style={{height:`${ci.length?(g.v/ci.length)*60:0}px`,minHeight:2,width:36,background:g.c,borderRadius:'4px 4px 0 0'}}/><div style={{fontSize:16,fontWeight:900,color:g.c,marginTop:4}}>{g.v}</div><div style={{fontSize:8,color:G.muted}}>{g.l}</div></div>
          ))}
        </div>
      </div>
      <div style={{background:G.panel,borderRadius:11,border:`1px solid ${G.border}`,padding:13}}>
        <div style={{fontSize:8,fontWeight:700,color:G.muted,letterSpacing:1,marginBottom:10}}>🎯 TRÌNH ĐỘ</div>
        {bySkill.map(s=><div key={s.skill} style={{marginBottom:7}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><SBadge skill={s.skill}/><span style={{fontSize:9,color:G.muted}}>{s.in}/{s.total}</span></div>
          <div style={{background:G.dim,borderRadius:3,height:5,overflow:'hidden'}}><div style={{height:'100%',width:`${(s.total/maxSk)*100}%`,background:SKILL_COLOR[s.skill],borderRadius:3}}/></div>
        </div>)}
      </div>
      <div style={{background:G.panel,borderRadius:11,border:`1px solid ${G.border}`,padding:13}}>
        <div style={{fontSize:8,fontWeight:700,color:G.muted,letterSpacing:1,marginBottom:10}}>📊 OVERVIEW</div>
        {[{l:'Check-in',v:ci.length,c:G.accent},{l:'Đang đấu',v:courts.filter((c:any)=>c.match).length,c:G.red},{l:'Trận xong',v:history.length,c:'#34d399'},{l:'Couples',v:Math.round(players.filter((p:any)=>p?.coupleId).length/2),c:G.pink}].map(s=>(
          <div key={s.l} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:10,color:G.muted}}>{s.l}</span><span style={{fontSize:11,fontWeight:800,color:s.c}}>{s.v}</span></div>
        ))}
      </div>
    </div>
  </div>;
}

// ── Player Profile Modal
export function PlayerProfileModal({p,history,onClose,isSA,onUpdatePlayer,toast}: any) {
  if(!p) return null;
  const k = Math.round(sepc(p,history)*10)/10;
  const tier = getTier(k);
  const wr = (p.gamesPlayed||0)?Math.round((p.wins||0)/(p.gamesPlayed)*100):0;
  let pct=100;
  if(tier.next!==null){const range=tier.next-tier.prev;const cur=k-tier.prev;pct=Math.max(0,Math.min(100,(cur/range)*100));}
  const v=p.membership; const isVip=v&&new Date(v.expiresAt)>new Date();
  const grantVip=(days:number)=>{const d=new Date();d.setDate(d.getDate()+days);onUpdatePlayer({...p,membership:{type:days===7?'weekly':'monthly',expiresAt:d.toISOString()}});toast(`Đã gia hạn VIP ${days===7?'Weekly':'Monthly'} cho ${p.name} 💎`);};
  return <MBox title="Hồ Sơ Cầu Thủ" onClose={onClose} w={400}>
    <div style={{textAlign:'center',marginBottom:16}}>
      <div style={{width:80,height:80,borderRadius:24,background:`linear-gradient(135deg,${tier.color},${G.panel})`,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,border:`2px solid ${tier.color}66`}}>{p.gender==='M'?'👦':'👧'}</div>
      <div style={{fontSize:20,fontWeight:900,color:G.text,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>{safe(p.name)}{isVip&&<span title="Thành viên VIP" style={{fontSize:14}}>💎</span>}</div>
      <div style={{fontSize:12,color:tier.color,fontWeight:800,marginTop:4}}>{tier.icon} {tier.name}</div>
    </div>
    <div style={{background:G.card,borderRadius:12,padding:14,border:`1px solid ${G.border}`,marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:G.dim,fontWeight:700,marginBottom:6}}><span>SEPC RATING</span><span>{tier.next?`${k} / ${tier.next}`:`${k} (MAX)`}</span></div>
      <div style={{height:8,background:G.bg,borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:tier.color,borderRadius:4}}/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
      {[{l:'TỈ LỆ THẮNG',v:`${wr}%`,c:G.accent},{l:'SỐ TRẬN',v:p.gamesPlayed||0,c:G.text},{l:'ELO',v:p.elo||'?',c:G.gold}].map(s=>(
        <div key={s.l} style={{background:G.panel,borderRadius:10,padding:10,textAlign:'center',border:`1px solid ${G.border}`}}>
          <div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:4}}>{s.l}</div>
          <div style={{fontSize:16,color:s.c,fontWeight:800}}>{s.v}</div>
        </div>
      ))}
    </div>
    {isSA && <div style={{borderTop:`1px solid ${G.border}`,paddingTop:14}}>
      <div style={{fontSize:10,fontWeight:800,color:G.gold,marginBottom:8}}>GIA HẠN MEMBERSHIP (ADMIN)</div>
      {isVip&&<div style={{fontSize:11,color:G.muted,marginBottom:8}}>Hết hạn: {new Date(v.expiresAt).toLocaleDateString('vi-VN')}</div>}
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>grantVip(7)} style={{...bP,flex:1,background:`linear-gradient(135deg,${G.purple},${G.pink})`,fontSize:11,padding:'7px 0'}}>+7 Ngày (Weekly)</button>
        <button onClick={()=>grantVip(30)} style={{...bP,flex:1,background:`linear-gradient(135deg,${G.gold},${G.red})`,fontSize:11,padding:'7px 0'}}>+30 Ngày (Monthly)</button>
      </div>
    </div>}
  </MBox>;
}
