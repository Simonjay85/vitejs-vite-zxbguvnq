with open('index.html', 'r', encoding='utf-8', errors='surrogateescape') as f:
    text = f.read()

find_block = """                    if (!prev.opp1) return {...prev, opp1:p};
       </div>}
      {vtab==="events"&&<div style={{display:"flex", flexDirection:"column", gap:12}}>"""

replace_block = """                    if (!prev.opp1) return {...prev, opp1:p};
                    if (!prev.opp2) return {...prev, opp2:p};
                    return prev;
                  });
                }} style={{padding:"6px 10px", borderRadius:6, border:`1px solid ${isSelected?G.gold:G.border}`, background:isSelected?G.gold+"22":"transparent", color:isSelected?G.gold:G.text, fontSize:11, fontWeight:700, cursor:"pointer"}}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"flex", gap:10, marginTop:15}}>
            <button onClick={()=>setChallenging(null)} style={{...bS, flex:1}}>Huỷ</button>
            <button onClick={()=>{
              onChallenge({
                id: "c_"+Math.random().toString(36).substr(2,9),
                challenger: me,
                partner: challenging.partner,
                opp1: challenging.opp1,
                opp2: challenging.opp2,
                status: "pending",
                requestedAt: Date.now()
              });
              setChallenging(null);
            }} disabled={!challenging.partner || !challenging.opp1 || !challenging.opp2} style={{...bP, flex:1, opacity:(!challenging.partner || !challenging.opp1 || !challenging.opp2)?0.5:1, background:G.accent, color:"#000"}}>Gửi Lời Thách</button>
          </div>
        </div>
      </div>
    )}

      {vtab==="events"&&<div style={{display:"flex", flexDirection:"column", gap:12}}>"""

if find_block in text:
    new_text = text.replace(find_block, replace_block)
    with open('index.html', 'w', encoding='utf-8', errors='surrogateescape') as f:
        f.write(new_text)
    print("Fixed!")
else:
    print("Block not found!")
