with open('index.html', 'r', encoding='utf-8', errors='surrogateescape') as f:
    lines = f.readlines()

# The incorrect section is 1520 to 1532.
# 1520:              {(()=>{
# ...
# 1530:        </div>}
# 1531:  
# 1532:        </div>}
# 1533:        {vtab==="queue"&&<div>

# Let's insert the correct block:
correct_block = """            {(()=>{
               const playingIds=new Set(courts.flatMap(c=>c.match?[...(c.match.team1||[]),...(c.match.team2||[])].filter(Boolean).map(p=>p.id):[]));
               const queuedIds=new Set(queue.flatMap(q=>[...(q.team1||[]),...(q.team2||[])].filter(Boolean).map(p=>p.id)));
               return players.filter(p=>p?.checkedIn&&!playingIds.has(p.id)&&p.name).sort((a,b)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map(p=>{
                 const isQ = queuedIds.has(p.id);
                 return <div key={p.id} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${isQ?"#a855f7":"#111b2b"}`,background:isQ?"#a855f722":"#080f1e",color:"#dde6f5",fontSize:10,display:"flex",alignItems:"center",gap:4}}>{p.name}</div>;
               });
            })()}
          </div>
        </div>
      </div>}

        {history.slice(0,4).length>0&&<><div style={{fontSize:9,color:G.muted,fontWeight:700,letterSpacing:2,marginBottom:7}}>KẾT QUẢ GẦN ĐÂY</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:7}}>{history.slice(0,4).map(h=><HCard key={h.id} h={h}/>)}</div></>}
      </div>}
"""

lines[1519:1532] = [correct_block]

with open('index.html', 'w', encoding='utf-8', errors='surrogateescape') as f:
    f.writelines(lines)
print("Restored history.slice and fixed div closures!")
