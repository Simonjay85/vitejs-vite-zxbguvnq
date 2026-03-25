sed -i.bak3 -e '1523,1533c\
               return players.filter(p=>p?.checkedIn&&!playingIds.has(p.id)&&p.name).sort((a,b)=>(a.gamesPlayed||0)-(b.gamesPlayed||0)).map(p=>{\
                 const isQ = queuedIds.has(p.id);\
                 return <div key={p.id} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${isQ?"#a855f7":"#111b2b"}`,background:isQ?"#a855f722":"#080f1e",color:"#dde6f5",fontSize:10,display:"flex",alignItems:"center",gap:4}}>{p.name}</div>;\
               });\
            })()}\
          </div>\
        </div>\
      </div>}\
' index.html
