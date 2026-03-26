const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

// 1. applyDb patch
const applyDbTarget1 = "setQueue(q);";
const applyDbTarget2 = "if(Array.isArray(db.courts)";
if (!code.includes(applyDbTarget1) || !code.includes(applyDbTarget2)) {
  console.log("Failed to find applyDb target");
  process.exit(1);
}
// Inject setPendingChallenges
code = code.replace(
  "setQueue(q);\n    if(Array.isArray(db.courts)",
  "setQueue(q);\n    setPendingChallenges(Array.isArray(db.pendingChallenges) ? db.pendingChallenges : []);\n    if(Array.isArray(db.courts)"
);

// 2. saveAll patch
const saveAllTarget1 = "courts: st.courts.map(c=>({";
const saveAllTarget2 = "queue: st.queue,";
if (!code.includes(saveAllTarget2)) {
  console.log("Failed to find saveAll target");
  process.exit(1);
}
code = code.replace(
  "queue: st.queue,",
  "queue: st.queue,\n      pendingChallenges: st.pendingChallenges || [],"
);

// 3. Handlers patch
const handlersTargetStr = `  const handleChallenge = (meId, partnerId, opp1Id, opp2Id) => {
    const allP = stateRef.current.players;
    const me = allP.find(p=>p.id===meId);
    const partner = allP.find(p=>p.id===partnerId);
    const opp1 = allP.find(p=>p.id===opp1Id);
    const opp2 = allP.find(p=>p.id===opp2Id);
    if(!me||!partner||!opp1||!opp2) return;
    const challenge = {
      id: \`ch_\${uid()}\`,
      team1: [me, partner],
      team2: [opp1, opp2],
      dtype: 'any',
      custom: true,
      isChallenge: true,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    setPendingChallenges(p=>[...p, challenge]);
    showT(\`⚔️ Lời thách đấu gửi đến Host — đang chờ duyệt!\`);
  };

  const approveChallenge = (id) => {
    const ch = stateRef.current.pendingChallenges.find(c=>c.id===id);
    if(!ch) return;
    setPendingChallenges(p=>p.filter(c=>c.id!==id));
    const match = {...ch, status: 'approved'};
    setQueue(q=>[match,...q]);
    showT(\`✅ Đã duyệt trận thách đấu!\`);
  };

  const rejectChallenge = (id) => {
    setPendingChallenges(p=>p.filter(c=>c.id!==id));
    showT(\`❌ Đã từ chối thách đấu.\`, 'warn');
  };`;

const HandlersNewStr = `  const handleChallenge = ({challenger, partner, opp1, opp2}) => {
    if(!challenger||!partner||!opp1||!opp2) return;
    const challenge = {
      id: \`ch_\${uid()}\`,
      team1: [challenger, partner],
      team2: [opp1, opp2],
      dtype: 'any',
      custom: true,
      isChallenge: true,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    const newPending = [...stateRef.current.pendingChallenges, challenge];
    setPendingChallenges(newPending);
    window._lastSavedAt = Date.now();
    STORE.save({...stateRef.current, pendingChallenges: newPending});
    showT(\`⚔️ Kèo đã gửi đến Admin — Vui lòng chờ duyệt!\`);
  };

  const approveChallenge = (id) => {
    const ch = stateRef.current.pendingChallenges.find(c=>c.id===id);
    if(!ch) return;
    const newPending = stateRef.current.pendingChallenges.filter(c=>c.id!==id);
    setPendingChallenges(newPending);
    const match = {...ch, status: 'approved'};
    const newQueue = [...stateRef.current.queue, match];
    setQueue(newQueue);
    window._lastSavedAt = Date.now();
    STORE.save({...stateRef.current, pendingChallenges: newPending, queue: newQueue});
    showT(\`✅ Đã đưa trận thách đấu vào Hàng chờ (Queue)!\`);
  };

  const rejectChallenge = (id) => {
    const newPending = stateRef.current.pendingChallenges.filter(c=>c.id!==id);
    setPendingChallenges(newPending);
    window._lastSavedAt = Date.now();
    STORE.save({...stateRef.current, pendingChallenges: newPending});
    showT(\`❌ Đã gửi thông báo từ chối thách đấu.\`, 'warn');
  };`;

if (!code.includes("const handleChallenge = (meId, partnerId, opp1Id, opp2Id) => {")) {
  console.log("Failed to find handlers target");
  process.exit(1);
}

// Just replace the whole block by finding bounds
let startH = code.indexOf('const handleChallenge = (meId, partnerId, opp1Id, opp2Id) => {');
let endH = code.indexOf('const genQueue=()=>{');
if(startH === -1 || endH === -1) {
  console.log('Cant find bounds'); process.exit(1);
}
// wait, EndH points to 'const genQueue=()=>{' which is after rejectChallenge.
// My target string might be slightly differently formatted 
// So let's just slice it.
code = code.substring(0, startH) + HandlersNewStr + '\n\n  ' + code.substring(endH);

// 4. Update translation
code = code.replace("CÓ {pendingChallenges.length} YÊU CẦU THÁCH ĐẤU MỚI", "CÓ {pendingChallenges.length} YÊU CẦU LẬP TRẬN MỚI");
// Update sw.js cache again
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/pickleball-v\d+/, 'pickleball-v25');
fs.writeFileSync('sw.js', sw);

fs.writeFileSync('index.html', code);
console.log("PATCH LOCALIZATION & SYNC DONE");
