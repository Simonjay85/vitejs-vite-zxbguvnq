import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Restore buttons
buttons = """const iS={background:"rgba(17,24,39,0.7)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",border:`1px solid ${G.border}`,borderRadius:16,padding:"14px 20px",color:G.text,fontSize:15,outline:"none",width:"100%",boxSizing:"border-box",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.5)"};
const bP={padding:"14px 26px",borderRadius:16,border:"none",background:G.grad,color:"#0B1220",fontWeight:800,cursor:"pointer",fontSize:15,letterSpacing:0.5,boxShadow:"0 8px 24px rgba(0,255,163,0.25)"};
const bS={padding:"12px 22px",borderRadius:16,border:`1px solid ${G.border}`,background:"rgba(17,24,39,0.5)",color:G.text,fontWeight:700,cursor:"pointer",fontSize:14,display:"inline-flex",alignItems:"center",justifyContent:"center"};
const bR={padding:"8px 16px",borderRadius:10,"""
content = re.sub(r'const bR=\{padding:"8px 16px",borderRadius:10,', buttons, content)

# 2. Fix DashTab Stats grid
dashtab_old = r'<div style={{display:"grid",gridTemplateColumns:"repeat\(auto-fit, minmax\(130px, 1fr\)\)",gap:12,marginBottom:20}}>\s*\{stats\.map\(s=>\(\s*<div key=\{s\.l\} style=\{\{background:G\.card,borderRadius:12,padding:"16px",border:`1px solid \$\{G\.border\}`([^>]+)>\s*<div style=\{\{display:"flex",flexDirection:"column"\}\}>\s*<div style=\{\{fontSize:11,color:G\.text,fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:6\}\}>\s*<span style=\{\{fontSize:14,color:G\.muted\}\}>\{s\.i\}</span> \{s\.l\}\s*</div>\s*<div style=\{\{fontSize:26,fontWeight:900,color:G\.text,lineHeight:1\}\}>\{s\.v\}</div>\s*</div>\s*<div style=\{\{position:"relative",width:36,height:36([^>]+)>\s*<div style=\{\{position:"absolute"([^>]+)/>\s*<div style=\{\{fontSize:18,position:"relative",zIndex:2\}\}>\{s\.i\}</div>\s*</div>\s*</div>\s*\)\)}\s*</div>'

dashtab_new = """<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:12,marginBottom:20}}>
      {stats.map(s=>(
        <div key={s.l} style={{background:G.card,backdropFilter:"blur(12px)",borderRadius:20,padding:"16px",border:`1px solid ${G.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{fontSize:12,color:G.muted,fontWeight:600,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>{s.i}</span> {s.l}
            </div>
            <div style={{fontSize:28,fontWeight:900,color:"transparent",backgroundImage:G.grad,WebkitBackgroundClip:"text",lineHeight:1}}>{s.v}</div>
          </div>
        </div>
      ))}
    </div>"""

content = re.sub(dashtab_old, dashtab_new, content)

# 3. Fix CourtCard
courtcard_regex = r'function CourtCard.*?return <div style={{background:G\.card([^;]+);?\s*}'

new_courtcard = """function CourtCard({court,elapsed,onScore,onAssign,next,readOnly,onSub,courtIdx,gameMode}){
  const m=court.match;
  const mm=String(Math.floor((elapsed||0)/60)).padStart(2,"0"),ss=String((elapsed||0)%60).padStart(2,"0");
  const diff=m?Math.abs(teamElo(m.team1)-teamElo(m.team2)):0;
  const isKing=gameMode==="king"&&courtIdx===0;
  const courtLabel=isKing?"👑 Vua":gameMode==="ladder"?`#${(courtIdx||0)+1}`:court.name;
  
  return <div style={{background:"rgba(17,24,39,0.5)",backdropFilter:"blur(16px)",border:m?`1px solid rgba(0,224,255,0.4)`:`1px solid ${G.border}`,borderRadius:24,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:m?"0 8px 32px rgba(0,255,163,0.15)":"0 4px 16px rgba(0,0,0,0.2)"}}>
    <div style={{padding:"14px 16px",background:m?"rgba(0,255,163,0.05)":"rgba(255,255,255,0.02)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:`1px solid ${G.border}`}}>
      <div>
        <div style={{fontWeight:900,fontSize:15,color:isKing?G.gold:G.text}}>{courtLabel}</div>
        <div style={{fontSize:10,color:G.muted,marginTop:2,letterSpacing:1}}>{m?"IN PLAY":"AVAILABLE"}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {m&&<div style={{fontSize:13,fontFamily:"monospace",fontWeight:900,color:"transparent",backgroundImage:G.grad,WebkitBackgroundClip:"text"}}>{mm}:{ss}</div>}
        <div style={{padding:"4px 10px",borderRadius:12,fontSize:9,fontWeight:800,letterSpacing:.5,
          background:m?"rgba(0,255,163,0.1)":"rgba(255,255,255,0.05)",
          color:m?"#00FFA3":G.muted,
          border:m?"1px solid rgba(0,255,163,0.3)":`1px solid ${G.border}`}}>
          {m?"● LIVE":"TRỐNG"}
        </div>
      </div>
    </div>
    <div style={{padding:"16px",flex:1}}>
      {m?(
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(0,224,255,0.05)",borderRadius:12,border:`1px solid rgba(0,224,255,0.2)`}}>
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:9,color:"#00E0FF",fontWeight:800,letterSpacing:1,marginBottom:4}}>TEAM A</div>
                {(m.team1||[]).filter(Boolean).map(p=><span key={p.id} style={{fontSize:14,fontWeight:900,color:G.text}}>{safe(p.name)}</span>)}
              </div>
              <span style={{fontSize:11,fontWeight:900,color:"#00E0FF"}}>{Math.round(teamElo(m.team1))}</span>
            </div>
            
            <div style={{textAlign:"center",padding:"4px 0"}}>
              <span style={{fontSize:11,fontWeight:900,color:G.dim,background:"rgba(17,24,39,0.8)",padding:"4px 12px",borderRadius:20,border:`1px solid ${G.border}`}}>
                VS <span style={{color:"#00FFA3"}}>Δ{diff}</span>
              </span>
            </div>
            
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"rgba(245,158,11,0.05)",borderRadius:12,border:`1px solid rgba(245,158,11,0.2)`}}>
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{fontSize:9,color:"#F59E0B",fontWeight:800,letterSpacing:1,marginBottom:4}}>TEAM B</div>
                {(m.team2||[]).filter(Boolean).map(p=><span key={p.id} style={{fontSize:14,fontWeight:900,color:G.text}}>{safe(p.name)}</span>)}
              </div>
              <span style={{fontSize:11,fontWeight:900,color:"#F59E0B"}}>{Math.round(teamElo(m.team2))}</span>
             </div>
          </div>
        </div>
      ):(
        <div style={{textAlign:"center",padding:"24px 0 32px"}}>
          <div style={{width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.02)",border:`1px solid rgba(255,255,255,0.05)`,boxShadow:"inset 0 2px 10px rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>{isKing?"👑":"🏓"}</div>
          <div style={{fontSize:12,fontWeight:700,color:G.muted}}>{isKing?"Waiting for King...":"Court Available"}</div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      {!readOnly&&<div style={{display:"flex",gap:8,alignItems:"center",marginTop:m?0:10}}>
        {m ? (
          <>
            <button onClick={()=>onScore(court.id)} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:G.grad,color:"#0B1220",fontWeight:900,cursor:"pointer",fontSize:12,boxShadow:"0 4px 16px rgba(0,255,163,0.3)"}}>Nhập kết quả</button>
            {onSub&&<button onClick={()=>onSub(court)} style={{padding:"12px 16px",borderRadius:12,border:`1px solid rgba(255,255,255,0.1)`,background:"rgba(255,255,255,0.05)",color:G.text,cursor:"pointer",fontSize:13,fontWeight:700}}>🔄</button>}
          </>
        ) : (
          <>
            <button onClick={()=>{if(next?.length) onAssign(court.id,next[0]);}} style={{flex:1,padding:"11px",borderRadius:12,border:"none",background:"rgba(0,255,163,0.1)",color:"#00FFA3",fontWeight:800,cursor:"pointer",fontSize:12,border:"1px solid rgba(0,255,163,0.3)"}}>▶ Auto Gán</button>
            <button onClick={()=>{}} style={{flex:1,padding:"11px",borderRadius:12,border:`1px solid ${G.border}`,background:"transparent",color:G.muted,fontWeight:700,cursor:"pointer",fontSize:12}}>Custom</button>
          </>
        )}
      </div>}
    </div>
  </div>;
}"""

content = re.sub(courtcard_regex, new_courtcard, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied Sports Deep Navy fixes to buttons, dashtab, and courts in index.html")
