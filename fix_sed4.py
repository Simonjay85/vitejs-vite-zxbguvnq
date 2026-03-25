with open('index.html', 'r', encoding='utf-8', errors='surrogateescape') as f:
    lines = f.readlines()

# We need to find the `challenging` closing:
# 1471:     )}
# 1472: 
# 1473:       {vtab==="events"&&<div style={{display:"flex", flexDirection:"column", gap:12}}>

insert_code = """    <nav style={{display:"flex",gap:2,padding:"4px 12px",background:G.panel,borderBottom:`1px solid ${G.border}`,overflowX:"auto"}}>
      {VTABS.map(t=><button key={t.id} onClick={()=>setVtab(t.id)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap",background:vtab===t.id?G.gold+"22":"transparent",color:vtab===t.id?G.gold:G.muted,borderBottom:vtab===t.id?`2px solid ${G.gold}`:"2px solid transparent"}}>{t.l}</button>)}
    </nav>
    <main style={{padding:"12px 14px",maxWidth:1400,margin:"0 auto"}}>
      {vtab==="courts"&&<div>
        <div style={{fontSize:14,fontWeight:800,color:G.text,marginBottom:12}}>🏟️ Sân đấu — Live</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10,marginBottom:16}}>
          {courts.map((ct,i)=><CourtCardViewer key={ct.id} court={ct} elapsed={elapsed[ct.id]||0} courtIdx={i} gameMode={gameMode}/>)}
        </div>
      </div>}
"""

index_to_insert = -1
for i, line in enumerate(lines):
    if '{vtab==="events"&&<div style={{display:"flex", flexDirection:"column", gap:12}}>' in line:
        index_to_insert = i
        break

if index_to_insert != -1:
    lines.insert(index_to_insert, insert_code)
    with open('index.html', 'w', encoding='utf-8', errors='surrogateescape') as f:
        f.writelines(lines)
    print("Successfully restored NAV and MAIN and COURTS tab!")
else:
    print("Could not find insertion point!")
