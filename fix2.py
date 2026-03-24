with open('index.html', 'r', encoding='utf-8', errors='surrogateescape') as f:
    text = f.read()

find_block = """               return players.filter(p=>p?.checkedIn&&!playingIds.has(p.id)&&p.name).sort((a,b)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map(p=>{
                 </div>
               });
            })()}
          </div>
        </div>
      </div>}{diff}</span>
              </div>;
            })}
          </div>
        </div>}"""

replace_block = """               return players.filter(p=>p?.checkedIn&&!playingIds.has(p.id)&&p.name).sort((a,b)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map(p=>{
                 const isQ = queuedIds.has(p.id);
                 return <div key={p.id} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${isQ?G.purple:G.border}`,background:isQ?G.purple+"22":G.card,color:G.text,fontSize:10,display:"flex",alignItems:"center",gap:4}}>
                   {safe(p.name)} {p.coupleId&&<CBadge type={p.coupleType}/>}
                 </div>;
               });
            })()}
          </div>
        </div>
      </div>}"""

if find_block in text:
    new_text = text.replace(find_block, replace_block)
    with open('index.html', 'w', encoding='utf-8', errors='surrogateescape') as f:
        f.write(new_text)
    print("Fixed corruption!")
else:
    print("Block not found!")
