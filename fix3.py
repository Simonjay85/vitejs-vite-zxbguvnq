import re
with open('index.html', 'r', encoding='utf-8', errors='surrogateescape') as f:
    text = f.read()

pattern = re.compile(
    r'return players\.filter\(p=>p\?\.checkedIn&&!playingIds\.has\(p\.id\)&&p\.name\)\.sort\(\(a,b\)=>\(a\.gamesPlayed\|\|0\)-\(b\.gamesPlayed\|\|0\)\)\.map\(p=>\{.*?\\{diff\}</span>\s*</div>;\s*\}\)\}\s*</div>\s*</div>\}',
    re.DOTALL
)

replace_block = """return players.filter(p=>p?.checkedIn&&!playingIds.has(p.id)&&p.name).sort((a,b)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map(p=>{
                 const isQ = queuedIds.has(p.id);
                 return <div key={p.id} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${isQ?G.purple:G.border}`,background:isQ?G.purple+"22":G.card,color:G.text,fontSize:10,display:"flex",alignItems:"center",gap:4}}>
                   {p.name}
                 </div>;
               });
            })()}
          </div>
        </div>
      </div>}"""

new_text, count = pattern.subn(replace_block, text)

if count > 0:
    with open('index.html', 'w', encoding='utf-8', errors='surrogateescape') as f:
        f.write(new_text)
    print(f"Fixed {count} matches!")
else:
    print("Block not found!")
