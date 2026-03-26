const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// -------- 1. Inject ScoreConfirmModal
const scoreModalCode = `function ScoreConfirmModal({sc, queuePos, onConfirm}) {
  return <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:"#111720",borderRadius:24,padding:28,width:"100%",maxWidth:400,border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 24px 80px rgba(0,0,0,0.8)",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>🏁</div>
      <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:8}}>Trận đấu kết thúc!</div>
      <div style={{fontSize:14,color:G.muted,marginBottom:24,lineHeight:1.5}}>Vui lòng xác nhận kết quả được nhập bởi Admin. Nếu điểm số bị sai, hãy bấm Báo sai điểm.</div>
      
      <div style={{background:"#1E2A3A",borderRadius:16,padding:20,marginBottom:24,border:\`1px solid \${G.border}\`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{flex:1,textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:4}}>{sc.team1.map(p=>safe(p.name).split(" ")[0]).join(" & ")}</div>
            <div style={{fontSize:11,color:G.accent,fontWeight:800,letterSpacing:1}}>THẮNG</div>
          </div>
          <div style={{padding:"0 20px",fontSize:26,fontWeight:900,color:G.gold}}>{sc.sw} - {sc.sl}</div>
          <div style={{flex:1,textAlign:"left"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#fff",marginBottom:4}}>{sc.team2.map(p=>safe(p.name).split(" ")[0]).join(" & ")}</div>
            <div style={{fontSize:11,color:G.red,fontWeight:800,letterSpacing:1}}>THUA</div>
          </div>
        </div>
      </div>

      {queuePos > 0 && <div style={{background:"rgba(59,130,246,0.15)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,padding:"14px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:11,color:G.blue,marginBottom:2,fontWeight:700,letterSpacing:0.5}}>BẠN ĐÃ TRỞ LẠI HÀNG CHỜ</div>
          <div style={{fontSize:13,color:"#fff",opacity:0.8}}>Vị trí hiện tại của bạn:</div>
        </div>
        <div style={{fontSize:28,fontWeight:900,color:G.cyan}}>#{queuePos}</div>
      </div>}

      <div style={{display:"flex",gap:12}}>
        <button onClick={()=>onConfirm('agreed')} style={{flex:2,padding:"16px",borderRadius:14,border:"none",background:"linear-gradient(135deg, #10B981, #059669)",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:15,boxShadow:"0 8px 24px rgba(16,185,129,0.3)"}}>✅ ĐỒNG Ý CỦA TÔI</button>
        <button onClick={()=>onConfirm('disputed')} style={{flex:1,padding:"16px",borderRadius:14,border:\`1px solid \${G.red}44\`,background:"rgba(239,68,68,0.1)",color:G.red,fontWeight:800,cursor:"pointer",fontSize:13}}>❌ Sai điểm</button>
      </div>
    </div>
  </div>;
}\n\n`;

if (!code.includes('function ViewerChallengeModal')) {
  console.log('Cannot find ViewerChallengeModal'); process.exit(1);
}
if (!code.includes('ScoreConfirmModal')) {
  code = code.replace('function ViewerChallengeModal', scoreModalCode + 'function ViewerChallengeModal');
}

// -------- 2. Update ViewerMode prop signature and render
const vModeFind = `function ViewerMode({players,courts,history,queue,pendingChallenges,onChallenge,elapsed,events,activeEventId,onLogout,me,onShowProfile,matchNotifs,onReadyChange}){`;
const vModeReplace = `function ViewerMode({players,courts,history,queue,pendingChallenges,scoreConfirmations,onConfirmScore,onChallenge,elapsed,events,activeEventId,onLogout,me,onShowProfile,matchNotifs,onReadyChange}){`;
code = code.replace(vModeFind, vModeReplace);

const vModeRenderFind = `{showChal&&<ViewerChallengeModal me={myPlayer} players={players} courts={courts} onChallenge={onChallenge} onClose={()=>setShowChal(false)}/>}`;
const vModeRenderReplace = `
    {/* Challenge Modal */}
    {showChal&&<ViewerChallengeModal me={myPlayer} players={players} courts={courts} onChallenge={onChallenge} onClose={()=>setShowChal(false)}/>}
    
    {/* Score Confirm Modal */}
    {(()=>{
      const myPendingSC = (scoreConfirmations||[]).find(sc => 
        [...(sc.team1||[]),...(sc.team2||[])].some(p=>p?.id===me?.id) && 
        !(sc.confirmedBy||[]).includes(me?.id) && !(sc.disputedBy||[]).includes(me?.id)
      );
      if(!myPendingSC) return null;
      const myQueueIdx = queue.findIndex(q=>[...(q.team1||[]),...(q.team2||[])].some(p=>p?.id===me?.id));
      return <ScoreConfirmModal sc={myPendingSC} queuePos={myQueueIdx>=0?myQueueIdx+1:0} onConfirm={(act) => onConfirmScore(myPendingSC.id, me?.id, act)} />;
    })()}
`;
code = code.replace(vModeRenderFind, vModeRenderReplace);

// -------- 3. Update DashTab prop signature and render
const dashTabFind = `function DashTab({courts,players,queue,history,elapsed,available,next,onScore,onAssign,genQ,autoAss,onCustom,onQR,activeEvent,matchNotifs,onStartMatch,onEditEvent}){`;
const dashTabReplace = `function DashTab({courts,players,queue,history,elapsed,available,next,onScore,onAssign,genQ,autoAss,onCustom,onQR,activeEvent,matchNotifs,scoreConfirmations,onResolveSC,onStartMatch,onEditEvent}){`;
code = code.replace(dashTabFind, dashTabReplace);

const dashTabEvAlert = `{/* EVENT ALERT nếu chưa có */}`;
const dashTabAlertReplace = `{/* SCORE DISPUTE ALERT */}
    {(()=>{
      const disputedSCs = (scoreConfirmations||[]).filter(sc => sc.disputedBy?.length > 0);
      if(disputedSCs.length === 0) return null;
      return <div style={{background:"rgba(239,68,68,0.15)",borderBottom:\`1px solid \${G.red}44\`,padding:"12px 16px"}}>
        <div style={{fontSize:12,fontWeight:900,color:G.red,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span>🚨 CÓ KHIẾU NẠI ĐIỂM SỐ TỪ NGƯỜI CHƠI!</span>
          <div style={{width:8,height:8,borderRadius:"50%",background:G.red,animation:"ping 1.5s infinite"}} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {disputedSCs.map(sc => <div key={sc.id} style={{background:"#1A1A1A",borderRadius:10,padding:10,border:\`1px solid \${G.red}33\`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:12,color:"#fff"}}>
              <strong style={{color:G.gold}}>{sc.courtName}</strong>: {sc.team1.map(p=>safe(p.name).split(" ")[0]).join("+")} thắng {sc.sw}-{sc.sl}
              <div style={{fontSize:10,color:G.red,marginTop:4}}>❌ Bị cờ khiếu nại bởi {sc.disputedBy.length} người.</div>
            </div>
            <button onClick={()=>onResolveSC(sc.id)} style={{background:G.red,color:"#fff",border:"none",padding:"6px 12px",borderRadius:8,fontWeight:800,cursor:"pointer",fontSize:11}}>Đã xử lý ✔️</button>
          </div>)}
        </div>
      </div>;
    })()}

    {/* EVENT ALERT nếu chưa có */}`;
code = code.replace(dashTabEvAlert, dashTabAlertReplace);

// -------- 4. Update App hook and handleScore
// we already added scoreConfirmations to useState in App before? No, we didn't!
const pendingChalFind = `const [pendingChallenges, setPendingChallenges] = useState([]);`;
if (!code.includes(pendingChalFind)) { console.log('cant find pendingChal'); process.exit(1); }
if (!code.includes('const [scoreConfirmations')) {
  code = code.replace(pendingChalFind, `const [pendingChallenges, setPendingChallenges] = useState([]);\n  const [scoreConfirmations, setScoreConfirmations] = useState([]);`);
}

// Add stateRef.current update
// Wait! `stateRef.current = {accounts,events,players,history,courts,queue,activeEventId,numCourts,pendingChallenges};`
const refFind = `numCourts,pendingChallenges};`;
const refReplace = `numCourts,pendingChallenges,scoreConfirmations};`;
code = code.replace(refFind, refReplace);

// Add to handleScore
const scoreSaveFind = `    // Tính players mới
    const newPlayers=stateRef.current.players.map(x=>{`;
const scoreSaveReplace = `    const newSc = {
      id: \`sc_\${uid()}\`,
      courtName: court.name || \`Sân \${court.id}\`,
      matchId: court.match.id,
      team1: wT,
      team2: lT,
      sw, sl,
      confirmedBy: [],
      disputedBy: [],
      timestamp: Date.now()
    };
    const newScoreConfirmations = [...stateRef.current.scoreConfirmations, newSc];
    setScoreConfirmations(newScoreConfirmations);

    // Tính players mới
    const newPlayers=stateRef.current.players.map(x=>{`;
code = code.replace(scoreSaveFind, scoreSaveReplace);

const storeSaveFind = `      courts:newCourts.map(c=>({...c,_startedAt:c.startedAt||null})),
      queue:newQueue`;
const storeSaveReplace = `      courts:newCourts.map(c=>({...c,_startedAt:c.startedAt||null})),
      queue:newQueue,
      scoreConfirmations:newScoreConfirmations`;
// replace only the FIRST occurrence in handleScore.
let hsIdx = code.indexOf('const handleScore=');
if(hsIdx !== -1) {
  let sub = code.substring(hsIdx);
  sub = sub.replace(storeSaveFind, storeSaveReplace);
  code = code.substring(0, hsIdx) + sub;
}


// -------- 5. Add handleConfirmScore and handleResolveSC near handleChallenge
const confirmHandlers = `  const handleConfirmScore = (scId, playerId, action) => {
    const scList = stateRef.current.scoreConfirmations;
    const idx = scList.findIndex(x=>x.id===scId);
    if(idx < 0) return;
    const sc = {...scList[idx]};
    if(action === 'agreed') sc.confirmedBy = [...(sc.confirmedBy||[]), playerId];
    if(action === 'disputed') sc.disputedBy = [...(sc.disputedBy||[]), playerId];
    
    const newScList = [...scList];
    newScList[idx] = sc;
    setScoreConfirmations(newScList);
    window._lastSavedAt = Date.now();
    STORE.save({...stateRef.current, scoreConfirmations: newScList});
  };

  const handleResolveSC = (scId) => {
    const newScList = stateRef.current.scoreConfirmations.filter(x=>x.id!==scId);
    setScoreConfirmations(newScList);
    window._lastSavedAt = Date.now();
    STORE.save({...stateRef.current, scoreConfirmations: newScList});
    showT("Đã xóa cảnh báo khiếu nại!");
  };

`;
if(!code.includes('handleConfirmScore')) {
  code = code.replace('const handleChallenge =', confirmHandlers + '  const handleChallenge =');
}

// Update pass-throughs
code = code.replace(
  `onReadyChange={handleReadyChange} onShowProfile={setEditingPlayer}/>`,
  `onReadyChange={handleReadyChange} onShowProfile={setEditingPlayer} onConfirmScore={handleConfirmScore} scoreConfirmations={scoreConfirmations}/>`
);
code = code.replace(
  `activeEvent={activeEvent} matchNotifs={matchNotifs} onStartMatch={handleStartMatch} onEditEvent={()=>setModal("editEvent")}/>}`,
  `activeEvent={activeEvent} matchNotifs={matchNotifs} scoreConfirmations={scoreConfirmations} onResolveSC={handleResolveSC} onStartMatch={handleStartMatch} onEditEvent={()=>setModal("editEvent")}/>}`
);

// sw.js cache bust
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/pickleball-v\d+/, 'pickleball-v26');
fs.writeFileSync('sw.js', sw);

fs.writeFileSync('index.html', code);
console.log("SCORE CONFIRMATION PATCH DONE");
