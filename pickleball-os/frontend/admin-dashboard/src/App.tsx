import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  G, iS, bP, bS, bR, ROLES, DTYPE_OPT, safe, sepc, uid, rng,
  skillElo, genCode, teamElo
} from '../../shared/theme';
import { Chip, RBadge } from '../../shared/components/Badge';
import { Toast } from '../../shared/components/Modal';
import { CourtCard } from '../../shared/components/CourtCard';
import { ScoreModal } from '../../shared/components/Modal';
import Login from './components/Login';
import { EventModal, QRModal, CustomModal, CoupleModal, AdminModal, ViewerChallengeModal } from './components/Modals';
import { DashTab, PlayersTab, QueueTab, LeaderView, AnalyticsView, PlayerProfileModal } from './components/Tabs';
import { HistoryTab, KioskTab, TVMode } from './components/MoreTabs';

// ─ Seed data
const MN=["Minh Tuấn","Quốc Huy","Bảo Long","Đức Thịnh","Hoàng Nam","Văn Khoa","Trọng Nghĩa","Anh Kiệt","Đình Phước","Thanh Bình","Hải Đăng","Duy Khang","Tiến Đạt","Mạnh Hùng","Phúc An"];
const FN=["Linh Chi","Thu Hà","Lan Anh","Mai Linh","Thảo Vy","Ngọc Bích","Phương Anh","Mỹ Hạnh","Thanh Vân","Kim Ngân","Yến Nhi","Hồng Nhung","Bảo Châu"];
function buildSeed(dbPlayers: any[]|null): any[] {
  if(dbPlayers && dbPlayers.length>0) return dbPlayers.map((p:any)=>({...p,checkedIn:false}));
  let mi=0,fi=0;
  const mk=(g:string,sk:string,ci:boolean,dt:string)=>({id:uid(),name:g==='M'?MN[mi++]:FN[fi++],gender:g,skill:sk,elo:skillElo(sk),checkedIn:ci,dtype:dt,gamesPlayed:rng(0,14),wins:0,lastPartners:[],coupleId:null,coupleType:null,createdAt:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}),viewerCode:genCode()});
  return [mk('M','3.5+',true,'any'),mk('M','3.5+',true,'mixed'),mk('M','3.5',true,'any'),mk('F','3.5',true,'mixed'),mk('M','3.5',true,'male'),mk('F','3.5',true,'female'),mk('M','3.5',true,'mixed'),mk('F','3.5',false,'any'),mk('M','3.5',true,'any'),mk('F','3.0',true,'mixed'),mk('M','3.0',true,'any'),mk('F','3.0',true,'any'),mk('M','3.0',true,'male'),mk('F','3.0',false,'mixed'),mk('M','3.0',true,'any'),mk('F','3.0',true,'female'),mk('M','3.0',false,'any'),mk('F','3.0',true,'any'),mk('M','3.0',true,'mixed'),mk('M','2.5',true,'mixed'),mk('F','2.5',true,'any'),mk('M','2.5',true,'any'),mk('F','2.5',true,'mixed'),mk('M','2.5',false,'male'),mk('F','2.5',true,'any')].map(p=>({...p,wins:Math.round((p.gamesPlayed as number)*rng(35,65)/100)}));
}
const defaultAccounts = () => ({admins:[{id:'sa_root',name:'Super Admin',role:ROLES.SA,password:'admin2024'}],hosts:[],viewerCode:genCode()});
const NCOURTS=5;

// ─ Match generator
function genMatch(pool:any[],history:any[],dtype:string) {
  let cands=[...pool].filter(p=>p?.id&&p?.name);
  if(dtype==='male') cands=cands.filter(p=>p.gender==='M');
  else if(dtype==='female') cands=cands.filter(p=>p.gender==='F');
  if(cands.length<4) return null;
  const pri=(p:any)=>history.filter(h=>h?.team1&&h?.team2&&[...h.team1,...h.team2].some((x:any)=>x?.id===p.id)).length+(p.gamesPlayed||0)*0.5;
  const top=[...cands].sort((a,b)=>pri(a)-pri(b)).slice(0,Math.min(cands.length,20));
  let best:any=null,bs=Infinity;
  for(let i=0;i<800;i++){
    const sh=[...top].sort(()=>Math.random()-.5);const [a,b,c,d]=sh;
    if(!a||!b||!c||!d)continue;
    if(dtype==='male'&&[a,b,c,d].some((x:any)=>x.gender!=='M'))continue;
    if(dtype==='female'&&[a,b,c,d].some((x:any)=>x.gender!=='F'))continue;
    if(dtype==='mixed'&&!(a.gender!==b.gender&&c.gender!==d.gender))continue;
    const rep=(a.lastPartners?.includes(b.id)?280:0)+(c.lastPartners?.includes(d.id)?280:0);
    const diff=Math.abs(teamElo([a,b])-teamElo([c,d]));
    const sc=rep+(diff<40?diff*.4:diff*2.5)+(pri(a)+pri(b)+pri(c)+pri(d))*1.2;
    if(sc<bs){bs=sc;best={team1:[a,b],team2:[c,d],diff:Math.round(diff),dtype};}
  }
  return best;
}

const TABS=[
  {id:'dashboard',l:'📊 Dashboard'},{id:'courts',l:'🏟️ 5 Sân'},{id:'players',l:'👥 Người chơi'},
  {id:'queue',l:'⚔️ Queue'},{id:'leaderboard',l:'🏆 Xếp hạng'},{id:'history',l:'📋 Lịch sử'},
  {id:'analytics',l:'📈 Analytics'},{id:'matchmaker',l:'🧠 AI Đề xuất'},{id:'kiosk',l:'📲 Kiosk'},
];

export default function AdminDashboard() {
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [me,setMe]=useState<any>(null);
  const [accounts,setAccounts]=useState(defaultAccounts);
  const [players,setPlayers]=useState(()=>buildSeed(null));
  const [history,setHistory]=useState<any[]>([]);
  const [courts,setCourts]=useState<any[]>(()=>Array.from({length:NCOURTS},(_,i)=>({id:`c${i+1}`,name:`Sân ${i+1}`,match:null,startedAt:null})));
  const [queue,setQueue]=useState<any[]>([]);
  const [pendingChallenges,setPendingChallenges]=useState<any[]>([]);
  const [events,setEvents]=useState<any[]>([]);
  const [activeEventId,setActiveEventId]=useState<string|null>(null);
  const [tab,setTab]=useState('dashboard');
  const [modal,setModal]=useState<string|null>(null);
  const [scoreTarget,setScoreTarget]=useState<string|null>(null);
  const [tvMode,setTvMode]=useState(false);
  const [toast,setToast]=useState<any>(null);
  const [elapsed,setElapsed]=useState<Record<string,number>>({});
  const [profileTarget,setProfileTarget]=useState<string|null>(null);
  // AI Matchmaker state
  const [socket,setSocket]=useState<any>(null);
  const [proposal,setProposal]=useState<any>(null);
  const tickRef=useRef<any>();

  // ─ Load from localStorage on mount
  useEffect(()=>{
    try{
      const saved=localStorage.getItem('pb_os_state');
      if(saved){const s=JSON.parse(saved);if(s.players?.length)setPlayers(buildSeed(s.players));if(s.history)setHistory(s.history);if(s.accounts)setAccounts(s.accounts);if(s.events)setEvents(s.events);if(s.activeEventId)setActiveEventId(s.activeEventId);if(s.queue)setQueue(s.queue);}
    }catch{}
    setLoading(false);
  },[]);

  // ─ Auto-save
  const saveState=useCallback(()=>{
    if(!me||me.role===ROLES.VIEWER)return;
    setSaving(true);
    try{localStorage.setItem('pb_os_state',JSON.stringify({players:players.map(p=>({...p,checkedIn:false})),history,accounts,events,activeEventId,queue}));}catch{}
    setTimeout(()=>setSaving(false),400);
  },[me,players,history,accounts,events,activeEventId,queue]);

  useEffect(()=>{const t=setTimeout(saveState,800);return()=>clearTimeout(t);},[players,history,accounts,events,activeEventId,queue,pendingChallenges]);

  // ─ Court timers
  useEffect(()=>{
    tickRef.current=setInterval(()=>{setElapsed(prev=>{const n={...prev};courts.forEach(c=>{if(c.match&&c.startedAt)n[c.id]=Math.floor((Date.now()-c.startedAt)/1000);});return n;});},1000);
    return()=>clearInterval(tickRef.current);
  },[courts]);

  // ─ WebSocket for AI features
  useEffect(()=>{
    try{const s=io('http://localhost:5000',{timeout:2000});setSocket(s);s.on('queue:update',(d:any)=>{/* merge real-time queue */});s.on('court:assign',(d:any)=>{/* merge court updates */});return()=>{s.disconnect();};}catch{}
  },[]);

  const playIds=new Set(courts.flatMap(c=>c.match?[...(c.match.team1||[]),...(c.match.team2||[])].filter(Boolean).map((p:any)=>p.id):[]));
  const available=players.filter(p=>p&&p.checkedIn&&!playIds.has(p.id));
  const activeEvent=events.find(e=>e.id===activeEventId)||null;
  const showT=(msg:string,type='ok')=>setToast({msg,type});
  const isSA=me?.role===ROLES.SA;
  const SESSION_ID='SESSION_123';

  // ─ Event management
  const createEvent=(ev:any)=>{const ne=[...events,ev];setEvents(ne);setActiveEventId(ev.id);setHistory([]);setQueue([]);setPendingChallenges([]);setPlayers(p=>p.map((x:any)=>({...x,checkedIn:false})));showT(`🗓️ Event "${ev.name}" đã tạo!`);};
  const editEvent=(ev:any)=>{setEvents(events.map(e=>e.id===ev.id?ev:e));showT('Event đã cập nhật ✏️');};
  const endEvent=()=>{if(!activeEvent)return;showT(`Event "${activeEvent.name}" kết thúc 💾`);setActiveEventId(null);setHistory([]);setQueue([]);setPendingChallenges([]);setPlayers(p=>p.map((x:any)=>({...x,checkedIn:false})));};

  const handleRegister=(data:any)=>{
    setPlayers(prev=>{
      const ex=prev.find((p:any)=>p.id===data.id);
      let upd=ex?prev.map((p:any)=>p.id===data.id?{...p,...data,checkedIn:true,viewerCode:p.viewerCode||genCode()}:p):[...prev,{...data,checkedIn:true,viewerCode:data.viewerCode||genCode()}];
      if(data.coupleWithId&&data.coupleId)upd=upd.map((p:any)=>p.id===data.coupleWithId?{...p,coupleId:data.coupleId,coupleType:data.coupleType||'couple'}:p);
      return upd;
    });
    showT(`${safe(data.name)} đã check in! 🎉`);
  };

  const genQueue=()=>{
    if(available.length<4){showT('Cần ít nhất 4 người!','warn');return;}
    const newM:any[]=[],used=new Set<string>();
    const cm:Record<string,any[]>={};available.forEach(p=>{if(p?.coupleId){if(!cm[p.coupleId])cm[p.coupleId]=[];cm[p.coupleId].push(p);}});
    Object.values(cm).forEach(pair=>{
      if(pair.length===2&&!used.has(pair[0].id)&&!used.has(pair[1].id)){
        const others=available.filter(p=>!used.has(p.id)&&p.id!==pair[0].id&&p.id!==pair[1].id);
        if(others.length>=2){const o1=others[rng(0,Math.min(2,others.length-1))],o2=others.filter(p=>p.id!==o1.id)[rng(0,Math.max(0,Math.min(2,others.length-2)))];
          if(o1&&o2){const dt=pair[0].gender!==pair[1].gender&&o1.gender!==o2.gender?'mixed':'any';newM.push({team1:[pair[0],pair[1]],team2:[o1,o2],dtype:dt,coupleMatch:true});[pair[0].id,pair[1].id,o1.id,o2.id].forEach(id=>used.add(id));}}
      }
    });
    for(const dt of['mixed','male','female','any']){const pool=available.filter(p=>!used.has(p.id));if(pool.length<4)break;const m=genMatch(pool,history,dt);if(m){newM.push(m);[...m.team1,...m.team2].forEach((p:any)=>used.add(p.id));}}
    if(!newM.length){showT('Không tạo được trận!','warn');return;}
    setQueue(p=>[...p,...newM]);showT(`Đã thêm ${newM.length} trận ⚡`);
  };

  const assign=(cid:string,mdata:any)=>{
    setCourts(p=>p.map(c=>c.id===cid?{...c,match:{...mdata},startedAt:Date.now()}:c));
    setQueue(p=>p.filter(q=>q!==mdata));
    showT(`Trận bắt đầu tại ${courts.find(c=>c.id===cid)?.name}! 🏓`);
  };
  const autoAssign=()=>{
    const free=courts.filter(c=>!c.match);
    if(!free.length){showT('Không có sân trống!','warn');return;}
    if(!queue.length){showT('Queue trống!','warn');return;}
    let q=[...queue];free.forEach(c=>{if(!q.length)return;const m=q.shift();setCourts(p=>p.map(x=>x.id===c.id?{...x,match:m,startedAt:Date.now()}:x));});
    setQueue(q);showT('Đã gán ▶');
  };

  const handleChallenge=(cData:any)=>{setPendingChallenges(prev=>[...prev,{id:uid(),...cData,requestedAt:Date.now()}]);showT('Đã gửi thách đấu đến Host! ⏳');};
  const handleApproveChallenge=(id:string)=>{const c=pendingChallenges.find(x=>x.id===id);if(!c)return;setQueue(prev=>[...prev,{team1:[c.challenger,c.partner],team2:[c.opp1,c.opp2],dtype:'any',custom:true,challengeMatch:true}]);setPendingChallenges(prev=>prev.filter(x=>x.id!==id));showT('Đã duyệt thách đấu! ⚔️');};
  const handleRejectChallenge=(id:string)=>{setPendingChallenges(prev=>prev.filter(x=>x.id!==id));showT('Đã từ chối thách đấu.');};

  const handleScore=(w:number,sw:number,sl:number)=>{
    if(!activeEvent){showT('Tạo Event trước khi nhập điểm!','warn');return;}
    const court=courts.find(c=>c.id===scoreTarget);if(!court?.match)return;
    const m=court.match;
    const wT=(w===1?m.team1:m.team2).filter(Boolean),lT=(w===1?m.team2:m.team1).filter(Boolean);
    if(!wT.length||!lT.length)return;
    const delta=Math.round(28*(1-(1/(1+Math.pow(10,(teamElo(lT)-teamElo(wT))/400)))));
    const t10=m.team1?.[0],t11=m.team1?.[1],t20=m.team2?.[0],t21=m.team2?.[1];
    const np:Record<string,string>={};if(t10&&t11){np[t10.id]=t11.id;np[t11.id]=t10.id;}if(t20&&t21){np[t20.id]=t21.id;np[t21.id]=t20.id;}
    setPlayers(p=>p.map((x:any)=>{
      const isW=wT.some((v:any)=>v.id===x.id),isL=lT.some((v:any)=>v.id===x.id);
      if(!isW&&!isL)return x;
      const lp=np[x.id]?[np[x.id],...(x.lastPartners||[])].slice(0,4):x.lastPartners||[];
      return{...x,elo:x.elo+(isW?delta:-delta),gamesPlayed:(x.gamesPlayed||0)+1,wins:(x.wins||0)+(isW?1:0),lastPartners:lp};
    }));
    setHistory(p=>[{id:uid(),eventId:activeEventId,courtId:scoreTarget,dtype:m.dtype,team1:m.team1.filter(Boolean),team2:m.team2.filter(Boolean),winner:w,scoreWinner:sw,scoreLoser:sl,score:`${w===1?sw:sl}-${w===1?sl:sw}`,eloDelta:delta,time:new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})},...p]);
    setCourts(p=>p.map(c=>c.id===scoreTarget?{...c,match:null,startedAt:null}:c));
    setScoreTarget(null);
    showT(`${wT.filter(Boolean).map((p:any)=>safe(p.name).split(' ').pop()).join(' & ')} thắng ${sw}-${sl}! ±${delta} ELO`);
  };

  // ─ AI Matchmaker (calls backend API)
  const fetchSuggestion=async()=>{
    try{const res=await fetch(`http://localhost:5000/api/admin/matches/suggest/${SESSION_ID}`);const data=await res.json();if(data.proposal)setProposal(data.proposal);else showT('Không đủ người để xếp trận!','warn');}
    catch{showT('Không kết nối được backend AI','error');}
  };
  const approveSuggestion=async()=>{
    if(!proposal)return;
    try{await fetch('http://localhost:5000/api/admin/matches/approve-suggestion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:SESSION_ID,team1PlayerIds:proposal.team1.map((p:any)=>p.id),team2PlayerIds:proposal.team2.map((p:any)=>p.id)})});setProposal(null);showT('Đã tạo trận đấu từ AI! 🧠');}
    catch{showT('Lỗi khi tạo trận','error');}
  };

  const scoreMatch=scoreTarget?courts.find(c=>c.id===scoreTarget)?.match:null;

  if(!me) return <Login accounts={accounts} players={players} onLogin={setMe} loading={loading}/>;

  // ─ Viewer mode
  if(me.role===ROLES.VIEWER) {
    const myPlayer=players.find((p:any)=>p.id===me?.id)||me;
    const ranked=[...players].filter(p=>p?.name).map(p=>({...p,k:sepc(p,history)})).sort((a:any,b:any)=>b.k-a.k);
    const [vtab,setVtab]=React.useState('courts');
    const [showChal,setShowChal]=React.useState(false);
    const VTABS=[{id:'courts',l:'🏟️ Sân Live'},{id:'leaderboard',l:'🏆 Xếp hạng'},{id:'queue',l:'⚔️ Queue'},{id:'events',l:'📅 Sự kiện'},{id:'history',l:'📋 Lịch sử'},{id:'analytics',l:'📈 Thống kê'}];
    return <div style={{minHeight:'100vh',background:G.bg,color:G.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      <header style={{height:50,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',background:G.panel,borderBottom:`1px solid ${G.border}`,position:'sticky',top:0,zIndex:200}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${G.purple},${G.pink})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>👤</div>
          <div><div style={{fontWeight:900,fontSize:14,color:'#fff'}}>{safe(myPlayer?.name)||'Khán giả'}</div><div style={{fontSize:9,color:G.gold,fontWeight:800}}>ELO: {myPlayer?.elo||0}</div></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <Chip label={`✅ ${players.filter(p=>p?.checkedIn).length}`} color={G.accent}/>
          <Chip label={`🔴 ${courts.filter(c=>c.match).length}`} color={G.red}/>
          <button onClick={()=>setMe(null)} style={bS}>← Thoát</button>
        </div>
      </header>
      <nav style={{display:'flex',gap:2,padding:'4px 12px',background:G.panel,borderBottom:`1px solid ${G.border}`,overflowX:'auto'}}>
        {VTABS.map(t=><button key={t.id} type="button" onClick={()=>setVtab(t.id)} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:600,whiteSpace:'nowrap',background:vtab===t.id?G.gold+'22':'transparent',color:vtab===t.id?G.gold:G.muted,borderBottom:vtab===t.id?`2px solid ${G.gold}`:'2px solid transparent'}}>{t.l}</button>)}
      </nav>
      <main style={{padding:'12px 14px',maxWidth:1400,margin:'0 auto'}}>
        {vtab==='courts'&&<div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:10,marginBottom:16}}>{courts.map(c=><CourtCard key={c.id} court={c} elapsed={elapsed[c.id]||0} next={[]} readOnly/>)}</div></div>}
        {vtab==='leaderboard'&&<LeaderView ranked={ranked} onShowProfile={setProfileTarget}/>}
        {vtab==='queue'&&<div>
          {showChal&&<ViewerChallengeModal me={myPlayer} players={players} onChallenge={handleChallenge} onClose={()=>setShowChal(false)}/>}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:800,color:G.text}}>⚔️ Queue</div>
            {!me.id?.startsWith('v_')&&me.checkedIn&&<button onClick={()=>setShowChal(true)} style={{...bP,background:`linear-gradient(135deg,${G.purple},${G.pink})`,fontSize:11,padding:'6px 12px'}}>⚔️ Thách đấu</button>}
          </div>
          {!queue.length?<div style={{color:G.dim,fontSize:12,textAlign:'center',padding:'40px 0'}}>Chưa có trận</div>:
            <div style={{display:'flex',flexDirection:'column',gap:6}}>{queue.map((q:any,i:number)=><div key={i} style={{padding:'6px 10px',borderRadius:8,background:G.card,border:`1px solid ${G.border}`,display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:10,color:G.muted}}>#{i+1}</span><span style={{fontSize:10,color:G.accent}}>{(q.team1||[]).filter(Boolean).map((p:any)=>safe(p.name)).join(' & ')}</span><span style={{fontSize:10,color:G.dim}}>vs</span><span style={{fontSize:10,color:G.gold}}>{(q.team2||[]).filter(Boolean).map((p:any)=>safe(p.name)).join(' & ')}</span></div>)}</div>}
        </div>}
        {vtab==='events'&&<div><div style={{fontSize:14,fontWeight:800,color:G.text,marginBottom:12}}>📅 Sự kiện</div>{events.length===0?<div style={{color:G.dim,fontSize:12,textAlign:'center',padding:'40px 0'}}>Chưa có sự kiện nào</div>:<div style={{display:'flex',flexDirection:'column',gap:10}}>{events.map(ev=><div key={ev.id} style={{background:G.panel,border:`1px solid ${ev.id===activeEventId?G.accent+'aa':G.border}`,borderRadius:12,padding:14}}><div style={{fontSize:14,fontWeight:800,color:G.text}}>{ev.name}</div><div style={{fontSize:11,color:G.muted,marginTop:4}}>📍 {ev.location||'Chưa có địa điểm'} · 🗓️ {ev.date}</div>{ev.id===activeEventId&&<Chip label="🔴 ĐANG DIỄN RA" color={G.red}/>}</div>)}</div>}</div>}
        {vtab==='history'&&<HistoryTab history={history} events={events} players={players} activeEventId={activeEventId} readOnly/>}
        {vtab==='analytics'&&<AnalyticsView players={players} history={history} courts={courts}/>}
        {profileTarget&&<PlayerProfileModal p={players.find((x:any)=>x.id===profileTarget)} history={history} onClose={()=>setProfileTarget(null)} isSA={false} onUpdatePlayer={()=>{}} toast={showT}/>}
      </main>
    </div>;
  }

  return (
    <div style={{minHeight:'100vh',background:G.bg,color:G.text,fontFamily:'Inter,system-ui,sans-serif'}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* MODALS */}
      {modal==='qr'       &&<QRModal players={players} onRegister={handleRegister} onClose={()=>setModal(null)}/>}
      {modal==='custom'   &&<CustomModal players={players} onAdd={m=>{setQueue(p=>[...p,{...m,custom:true}]);setModal(null);showT('Custom ✏️');}} onClose={()=>setModal(null)}/>}
      {modal==='couple'   &&<CoupleModal players={players} setPlayers={setPlayers} onClose={()=>setModal(null)}/>}
      {modal==='admin'    &&<AdminModal accounts={accounts} setAccounts={setAccounts} me={me} onClose={()=>setModal(null)} toast={showT}/>}
      {modal==='newEvent' &&<EventModal isNew onSave={createEvent} onClose={()=>setModal(null)}/>}
      {scoreTarget&&scoreMatch&&<ScoreModal match={scoreMatch} onConfirm={handleScore} onClose={()=>setScoreTarget(null)}/>}
      {tvMode&&<TVMode courts={courts} elapsed={elapsed} queue={queue} players={players} history={history} onClose={()=>setTvMode(false)}/>}
      {profileTarget&&<PlayerProfileModal p={players.find((x:any)=>x.id===profileTarget)} history={history} onClose={()=>setProfileTarget(null)} isSA={isSA} onUpdatePlayer={(px:any)=>setPlayers(prev=>prev.map((x:any)=>x.id===px.id?px:x))} toast={showT}/>}

      {/* HEADER */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo__icon">🏓</div>
          <div>
            <div className="app-logo__name">
              PICKLEBALL HUB
              <span title={saving?'Đang lưu...':'Đã lưu'} style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:saving?'#ffc107':'#00e676',boxShadow:saving?'0 0 6px #ffc10788':'0 0 6px #00e67644',marginLeft:8,verticalAlign:'middle'}}/>
            </div>
            <div className="app-logo__sub">{safe(me.name).toUpperCase()} · {activeEvent?activeEvent.name:'Chưa có event'}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
          <span className="chip chip-cyan">✅ {players.filter((p:any)=>p?.checkedIn).length} check-in</span>
          <span className="chip chip-live">🔴 {courts.filter((c:any)=>c.match).length} live</span>
          <RBadge role={me.role}/>
          <span onClick={()=>setModal('admin')} style={{fontSize:11,padding:'3px 9px',borderRadius:5,background:'rgba(255,193,7,0.12)',color:G.gold,border:'1px solid rgba(255,193,7,0.25)',fontWeight:700,cursor:'pointer',letterSpacing:1}}>
            👁 {accounts?.viewerCode||'???'}
          </span>
          {activeEvent
            ?<div style={{display:'flex',gap:4,alignItems:'center',padding:'4px 10px',borderRadius:8,background:'rgba(0,229,255,0.08)',border:'1px solid rgba(0,229,255,0.25)'}}>
               <div className="ready-dot"/>
               <span style={{fontSize:11,color:G.accent,fontWeight:700}}>{activeEvent.name}</span>
               <button type="button" onClick={endEvent} style={{...bR,padding:'1px 5px',fontSize:9,marginLeft:2}}>✕</button>
             </div>
            :<button type="button" onClick={()=>setModal('newEvent')} style={{...bP,fontSize:11}}>🗓️ Tạo Event</button>}
          <button type="button" onClick={()=>setTvMode(true)} style={bS} title="TV Mode">📺</button>
          <button type="button" onClick={()=>setModal('couple')} style={{...bS,color:G.pink,borderColor:'rgba(244,143,177,0.3)'}} title="Kết đôi">💑</button>
          <button type="button" onClick={()=>setModal('qr')} style={bP}>📷 QR</button>
          {isSA&&<button type="button" onClick={()=>setModal('admin')} style={{...bS,color:G.gold,borderColor:'rgba(255,193,7,0.25)'}} title="Admin">⚙️</button>}
          <button type="button" onClick={()=>setMe(null)} style={bS}>← Đăng xuất</button>
        </div>
      </header>

      {/* Event alert */}
      {!activeEvent&&<div className="event-alert">
        <span style={{color:G.gold}}>⚠️</span>
        <span style={{color:G.gold,fontWeight:700}}>Chưa có event nào đang chạy.</span>
        <button type="button" onClick={()=>setModal('newEvent')} style={{...bP,fontSize:11}}>🗓️ Tạo Event ngay</button>
        <span style={{color:G.muted,fontSize:11}}>Tạo event để lưu lịch sử trận đấu theo ngày.</span>
      </div>}

      {/* NAV */}
      <nav className="app-nav">
        {TABS.map(t=>(
          <button key={t.id} type="button" onClick={()=>setTab(t.id)}
            className={`nav-tab${tab===t.id?' active':''}`}
            style={tab===t.id&&t.id==='kiosk'?{color:G.purple,borderBottomColor:G.purple,background:`rgba(124,77,255,0.08)`}:
                   tab===t.id&&t.id==='matchmaker'?{color:'#4fc3f7',borderBottomColor:'#4fc3f7',background:'rgba(79,195,247,0.08)'}:{}}>
            {t.l}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main style={{padding:'12px 14px',maxWidth:1800,margin:'0 auto'}}>
        {tab==='dashboard'  &&<DashTab courts={courts} players={players} queue={queue} setQueue={setQueue} pendingChallenges={pendingChallenges} onApproveChallenge={handleApproveChallenge} onRejectChallenge={handleRejectChallenge} history={history} elapsed={elapsed} available={available} onScore={(id:string)=>setScoreTarget(id)} onAssign={assign} genQ={genQueue} autoAss={autoAssign} onCustom={()=>setModal('custom')} onQR={()=>setModal('qr')} activeEvent={activeEvent}/>}
        {tab==='courts'     &&<div><div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:14}}>{courts.map(c=><CourtCard key={c.id} court={c} elapsed={elapsed[c.id]||0} next={queue.slice(0,3)} onScore={(id:string)=>setScoreTarget(id)} onAssign={assign}/>)}</div>{queue.length>0&&<><div style={{fontSize:9,color:G.muted,fontWeight:700,marginBottom:6}}>📋 QUEUE</div><div style={{display:'flex',flexDirection:'column',gap:5}}>{queue.slice(0,8).map((q:any,i:number)=><div key={i} style={{padding:'6px 10px',borderRadius:8,background:G.card,border:`1px solid ${G.border}`,fontSize:11,color:G.text}}>#{i+1} · {(q.team1||[]).filter(Boolean).map((p:any)=>safe(p.name)).join(' & ')} vs {(q.team2||[]).filter(Boolean).map((p:any)=>safe(p.name)).join(' & ')}</div>)}</div></>}</div>}
        {tab==='players'    &&<PlayersTab players={players} playIds={playIds} history={history} onToggle={(id:string)=>{const p=players.find((p:any)=>p.id===id);if(!p)return;setPlayers((pp:any[])=>pp.map((x:any)=>x.id===id?{...x,checkedIn:!x.checkedIn,viewerCode:x.viewerCode||genCode()}:x));showT(`${safe(p.name)} ${p.checkedIn?'rời session':'check in ✅'}`);}} onAdd={()=>setModal('qr')} onCouple={()=>setModal('couple')} onQR={()=>setModal('qr')} onShowProfile={setProfileTarget}/>}
        {tab==='queue'      &&<QueueTab queue={queue} setQueue={setQueue} courts={courts} available={available} history={history} elapsed={elapsed} onScore={(id:string)=>setScoreTarget(id)} onAssign={assign} genQ={genQueue} autoAss={autoAssign} onCustom={()=>setModal('custom')}/>}
        {tab==='leaderboard'&&<LeaderView ranked={[...players].filter(p=>p?.name).map(p=>({...p,k:sepc(p,history)})).sort((a:any,b:any)=>b.k-a.k)} onShowProfile={setProfileTarget}/>}
        {tab==='history'    &&<HistoryTab history={history} events={events} players={players} activeEventId={activeEventId} onEditEvent={editEvent}/>}
        {tab==='analytics'  &&<AnalyticsView players={players} history={history} courts={courts}/>}
        {tab==='kiosk'      &&<KioskTab players={players} onRegister={handleRegister} queue={queue} courts={courts} history={history}/>}
        {tab==='matchmaker' &&(
          <div style={{background:G.card,padding:40,borderRadius:24,border:`1px solid ${G.border}`,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:20}}>🧠</div>
            <h3 style={{fontSize:24,marginBottom:10}}>Hệ thống AI Đề Xuất Trận</h3>
            {!proposal?(<>
              <p style={{color:G.muted,maxWidth:500,margin:'0 auto 30px',fontSize:14}}>Trí thông minh nhân tạo giám sát hàng chờ, đề xuất trận đấu cân bằng khi có đủ 4 người.</p>
              <button onClick={fetchSuggestion} style={{...bP,padding:'12px 24px',fontSize:14}}>🤖 Chạy Thuật Toán AI</button>
            </>):(
              <div style={{textAlign:'left',maxWidth:600,margin:'0 auto',background:G.panel,padding:24,borderRadius:16}}>
                <div style={{fontWeight:800,fontSize:18,marginBottom:16}}>Đề Xuất Mới (Tin cậy: {(proposal.confidenceScore*100).toFixed(0)}%)</div>
                <div style={{display:'flex',gap:16,marginBottom:24}}>
                  <div style={{flex:1,background:G.accent+'10',padding:16,borderRadius:12,border:`1px solid ${G.accent}30`}}><div style={{fontWeight:800,color:G.accent,marginBottom:8}}>TEAM 1</div>{proposal.team1.map((p:any)=><div key={p.id}>{p.name}</div>)}</div>
                  <div style={{flex:1,background:G.gold+'10',padding:16,borderRadius:12,border:`1px solid ${G.gold}30`}}><div style={{fontWeight:800,color:G.gold,marginBottom:8}}>TEAM 2</div>{proposal.team2.map((p:any)=><div key={p.id}>{p.name}</div>)}</div>
                </div>
                <div style={{marginBottom:24}}><div style={{fontSize:13,fontWeight:700,color:G.muted,marginBottom:8}}>LÝ DO:</div><ul style={{margin:0,paddingLeft:20,fontSize:14}}>{proposal.reasons?.map((r:string,i:number)=><li key={i} style={{marginBottom:4}}>{r}</li>)}</ul></div>
                <div style={{display:'flex',gap:12}}>
                  <button onClick={approveSuggestion} style={{...bP,flex:1,padding:'12px',fontSize:14}}>✅ Phê duyệt & Gán Sân</button>
                  <button onClick={()=>setProposal(null)} style={{...bS,flex:1,padding:'12px',fontSize:14}}>❌ Từ chối</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
