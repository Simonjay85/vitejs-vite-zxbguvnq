const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. Remove ScoreConfirmModal and its old ViewerMode injection
code = code.replace(/function ScoreConfirmModal\(\{.*?\}\n\n/s, '');
code = code.replace(/\{\/\* Score Confirm Modal \*\/\[\s\S]*?\}\)\(\)\}/, ''); // wait, this might fail or be tricky with regex

// Better: just do string replacement
if(code.includes('{/* Score Confirm Modal */}')) {
  const start = code.indexOf('{/* Score Confirm Modal */}');
  const end = code.indexOf('})()}', start) + 5;
  code = code.slice(0, start) + code.slice(end);
}

// 2. Add handleDispute
const disputeHandler = `  const handleDispute = (match) => {
    let sc = stateRef.current.scoreConfirmations.find(sc => sc.matchId === match.id);
    if (!sc) {
      sc = {
        id: \`sc_\${uid()}\`,
        matchId: match.id,
        courtName: match.courtId ? \`Sân \${match.courtId}\` : "Lịch sử",
        team1: match.team1,
        team2: match.team2,
        sw: match.scoreWinner,
        sl: match.scoreLoser,
        confirmedBy: [],
        disputedBy: [me.id],
        timestamp: Date.now()
      };
      const newScList = [...stateRef.current.scoreConfirmations, sc];
      setScoreConfirmations(newScList);
      window._lastSavedAt = Date.now();
      STORE.save({...stateRef.current, scoreConfirmations: newScList});
    } else {
      if(!Math.abs) return; // dummy
      if(!sc.disputedBy) sc.disputedBy = [];
      if(!sc.disputedBy.includes(me.id)) {
        sc.disputedBy.push(me.id);
        const newScList = stateRef.current.scoreConfirmations.map(x=>x.id===sc.id?sc:x);
        setScoreConfirmations(newScList);
        window._lastSavedAt = Date.now();
        STORE.save({...stateRef.current, scoreConfirmations: newScList});
      }
    }
    showT("🚩 Đã gửi khiếu nại về BQL.");
  };
`;
if(!code.includes('const handleDispute = (match) => {')) {
  code = code.replace('const handleResolveSC = (scId) => {', disputeHandler + '\n  const handleResolveSC = (scId) => {');
}

// 3. Inject DisputeModal into ViewerMode and the Dispute button into History
const vmPropsFind = `function ViewerMode({players,courts,history,queue,pendingChallenges,scoreConfirmations,onConfirmScore,onChallenge,elapsed,events,activeEventId,onLogout,me,onShowProfile,matchNotifs,onReadyChange}){`;
const vmPropsReplace = `function ViewerMode({players,courts,history,queue,pendingChallenges,scoreConfirmations,onDispute,onChallenge,elapsed,events,activeEventId,onLogout,me,onShowProfile,matchNotifs,onReadyChange}){
  const [disputeTarget, setDisputeTarget] = useState(null);`;
code = code.replace(vmPropsFind, vmPropsReplace);

// Inject into App render
code = code.replace(`onConfirmScore={handleConfirmScore}`, `onDispute={handleDispute}`);

// Inject button into history
const historyRowFind = `<div style={{fontSize:10,color:G.muted,fontWeight:600}}>vs {opp}</div>`;
const historyRowReplace = `<div style={{fontSize:10,color:G.muted,fontWeight:600}}>vs {opp}</div>
            <button onClick={()=>setDisputeTarget(h)} style={{marginTop:8,width:"100%",fontSize:10,padding:"4px 0",background:"rgba(239,68,68,0.1)",color:G.red,border:\`1px solid \${G.red}44\`,borderRadius:6,cursor:"pointer",fontWeight:700}}>🚩 Cắm Cờ (Khiếu Nại)</button>`;
code = code.replace(historyRowFind, historyRowReplace);
// wait, myHistory.map is at line 1881... replace may only hit the first?
// We only want it in recent history in ViewerMode! There is another history loop in Dashboard, but let's see where KẾT QUẢ GẦN ĐÂY CỦA BẠN is.
// Actually replace all is fine because other history rows don't have exactly this structure.

// Inject DisputeModal at the end of ViewerMode return
const vmEndFind = `{showChal&&<ViewerChallengeModal me={myPlayer} players={players} courts={courts} onChallenge={onChallenge} onClose={()=>setShowChal(false)}/>}`;
const vmEndReplace = `{showChal&&<ViewerChallengeModal me={myPlayer} players={players} courts={courts} onChallenge={onChallenge} onClose={()=>setShowChal(false)}/>}
    {disputeTarget&&<div style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
       <div style={{background:G.card,borderRadius:20,padding:24,width:"100%",maxWidth:360,textAlign:"center"}}>
         <div style={{fontSize:36,marginBottom:12}}>🚩</div>
         <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:8}}>Báo Cáo Sai Kết Quả</div>
         <div style={{fontSize:13,color:G.muted,marginBottom:24,lineHeight:1.5}}>Bạn chắc chắn muốn cắm cờ khiếu nại trận đấu với <strong style={{color:"#fff"}}>{disputeTarget.team2.map(p=>safe(p.name).split(" ")[0]).join(" & ")}</strong>?</div>
         <div style={{display:"flex",gap:10}}>
           <button onClick={()=>{onDispute(disputeTarget);setDisputeTarget(null);}} style={{flex:1,background:G.red,color:"#fff",border:"none",padding:"14px",borderRadius:12,fontWeight:800,cursor:"pointer"}}>🚩 Gửi Khiếu Nại</button>
           <button onClick={()=>setDisputeTarget(null)} style={{flex:1,background:"transparent",color:G.muted,border:\`1px solid \${G.border}\`,padding:"14px",borderRadius:12,fontWeight:700,cursor:"pointer"}}>Hủy</button>
         </div>
       </div>
    </div>}`;
code = code.replace(vmEndFind, vmEndReplace);


// 4. Fix MatchReadyOverlay auto-dismiss / persistence
// Find: <button onClick={()=>setDismissed(true)} style={{position:"absolute",...
const mroInitFind = `const [dismissed,setDismissed]=useState(false);`;
const mroInitReplace = `const [dismissed,setDismissed]=useState(()=>localStorage.getItem("dismissed_"+notif.id)==="1");
  useEffect(()=>{
    if(dismissed) localStorage.setItem("dismissed_"+notif.id,"1");
  },[dismissed, notif.id]);
  useEffect(()=>{
    if(alreadyReady){ setTimeout(()=>setDismissed(true), 3000); }
  },[alreadyReady]);
`;
code = code.replace(mroInitFind, mroInitReplace);

// 5. Remove QR Buttons
// In DashTab
code = code.replace(/<button onClick=\{onQR\}.*?>📷 QR Check-in<\/button>/g, '');
// In Quick Action strip
code = code.replace(/<button onClick=\{\(\)=>setModal\("qr"\)\}.*?>📷 QR<\/button>/g, '');
// In PlayersTab
code = code.replace(/<button onClick=\{onQR\}.*?>📷 QR<\/button>/g, '');
// ViewerMode QR (if any left) is gone.

fs.writeFileSync('index.html', code);

// sw.js cache bust
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/pickleball-v\d+/, 'pickleball-v28');
fs.writeFileSync('sw.js', sw);

console.log("PATCH PHASE 8 DONE");
