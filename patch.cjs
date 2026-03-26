const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. ViewerChallengeModal Fix
let a = code.indexOf('function ViewerChallengeModal({me,players,courts,onChallenge,onClose}){');
if(a === -1) { console.error('A no match'); process.exit(1); }
let b = code.indexOf('}\n\n\nfunction ViewerMode', a);
if(b === -1) { console.error('B no match'); process.exit(1); }

const newModal = `function ViewerChallengeModal({me,players,courts,onChallenge,onClose}){
  const playingIds = new Set();
  (courts||[]).forEach(c => {
    if(c.match) {
      (c.match.team1||[]).forEach(p=>p&&playingIds.add(p.id));
      (c.match.team2||[]).forEach(p=>p&&playingIds.add(p.id));
    }
  });
  const av = players.filter(p=>p&&p.checkedIn&&p.name&&p.id!==me.id&&!playingIds.has(p.id));
  const [partner,setPartner]=React.useState("");
  const [opp1,setOpp1]=React.useState("");
  const [opp2,setOpp2]=React.useState("");
  const [search,setSearch]=React.useState("");
  const [err,setErr]=React.useState("");

  const submit=()=>{
    if(!partner||!opp1||!opp2){setErr("⚠️ Vui lòng chọn đủ 3 người!");return;}
    if(new Set([me.id,partner,opp1,opp2]).size!==4){setErr("⚠️ Không được chọn trùng lặp người chơi!");return;}
    const p=av.find(x=>x.id===partner),o1=av.find(x=>x.id===opp1),o2=av.find(x=>x.id===opp2);
    if(p&&o1&&o2){onChallenge({challenger:me,partner:p,opp1:o1,opp2:o2});onClose();}
  };

  return <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto",overscrollBehavior:"none"}}>
    <div style={{background:"#111720",borderRadius:24,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 24px 80px rgba(0,0,0,0.8)",maxHeight:"90vh",overflowY:"auto",margin:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>⚔️ Lập Kèo 2v2</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:G.muted,cursor:"pointer",fontSize:22,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",backgroundColor:"rgba(255,255,255,0.05)"}}>✕</button>
      </div>

      <input 
        type="text" 
        placeholder="🔍 Tìm nhanh tên người chơi..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        style={{width:"100%",boxSizing:"border-box",padding:"14px 16px",borderRadius:12,border:\`1px solid \${G.border}\`,background:"#1E2A3A",color:"#fff",fontSize:15,marginBottom:20,outline:"none"}}
      />

      {[
        {label:"🤝 ĐỒNG ĐỘI",val:partner,set:setPartner,color:G.cyan},
        {label:"⚔️ ĐỐI THỦ 1",val:opp1,set:setOpp1,color:G.warning||G.gold},
        {label:"⚔️ ĐỐI THỦ 2",val:opp2,set:setOpp2,color:G.warning||G.gold},
      ].map((f,i)=><div key={i} style={{marginBottom:16}}>
        <div style={{fontSize:11,color:f.color,fontWeight:800,letterSpacing:1,marginBottom:6}}>{f.label}</div>
        <div style={{position:"relative"}}>
          <select value={f.val} onChange={e=>{f.set(e.target.value);setErr("");}} style={{width:"100%",boxSizing:"border-box",padding:"14px 16px",borderRadius:12,border:\`1px solid \${f.val?f.color:"rgba(255,255,255,0.1)"}\`,background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:16,fontWeight:f.val?800:500,appearance:"none",WebkitAppearance:"none",outline:"none",cursor:"pointer"}}>
            <option value="" style={{color:"#000"}}>-- Chạm để Chọn --</option>
            {av.filter(p => [partner, opp1, opp2].includes(p.id) || !search || safe(p.name).toLowerCase().includes(search.toLowerCase())).map(p=><option key={p.id} value={p.id} style={{color:"#000"}}>{safe(p.name)} ({p.skill})</option>)}
          </select>
          <div style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:G.muted,fontSize:12}}>▼</div>
        </div>
      </div>)}

      {err&&<div style={{color:G.red,fontSize:13,fontWeight:700,marginBottom:16,padding:"12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,textAlign:"center"}}>{err}</div>}
      
      <div style={{marginTop:24}}>
        <button onClick={submit} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:partner&&opp1&&opp2?"linear-gradient(135deg, #10B981, #3B82F6)":"rgba(255,255,255,0.05)",color:partner&&opp1&&opp2?"#fff":G.muted,fontWeight:900,cursor:partner&&opp1&&opp2?"pointer":"not-allowed",fontSize:16,boxShadow:partner&&opp1&&opp2?"0 8px 24px rgba(16,185,129,0.3)":"none",transition:"all 0.2s"}}>
          🔥 CHỐT KÈO & GỬI TỚI ADMIN
        </button>
      </div>
    </div>
  </div>;
}`;

code = code.substring(0, a) + newModal + code.substring(b+1);

// 2. maxWidth fix
code = code.replace(
  '<main className="main-pad" style={{padding:"10px 12px",maxWidth:1800,margin:"0 auto"}}>',
  '<main className="main-pad" style={{padding:"10px 12px",maxWidth:900,margin:"0 auto"}}>'
);

// 3. Edit Player Modal in ViewerMode Return 
const searchStr = `  if(me.role===ROLES.VIEWER) return <><style>{CSS}</style>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <ViewerMode me={me} players={players} courts={courts} history={history} queue={queue} elapsed={elapsed} events={events} activeEventId={activeEventId} numCourts={numCourts} onLogout={logout} onChallenge={handleChallenge} pendingChallenges={pendingChallenges} matchNotifs={matchNotifs} onReadyChange={handleReadyChange} onShowProfile={setEditingPlayer}/>
  </>;`;

const replacementStr = `  if(me.role===ROLES.VIEWER) return <><style>{CSS}</style>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    <ViewerMode me={me} players={players} courts={courts} history={history} queue={queue} elapsed={elapsed} events={events} activeEventId={activeEventId} numCourts={numCourts} onLogout={logout} onChallenge={handleChallenge} pendingChallenges={pendingChallenges} matchNotifs={matchNotifs} onReadyChange={handleReadyChange} onShowProfile={setEditingPlayer}/>
    {editingPlayer&&<PlayerSelfEditModal player={editingPlayer} onSave={savePlayer} onClose={()=>setEditingPlayer(null)} toast={showT}/>}
  </>;`;

if (!code.includes(searchStr)) {
  console.error("Return block not found!");
  process.exit(1);
}

code = code.replace(searchStr, replacementStr);

fs.writeFileSync('index.html', code);
console.log("PATCH APPLIED SUCCESSFULLY");
