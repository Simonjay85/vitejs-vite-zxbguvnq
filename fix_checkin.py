import re

with open('checkin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CSS
old_css = r"""    body\{background:#F4F3ED;color:#1C1C1E;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;\}
    @import url\('https://fonts\.googleapis\.com/css2\?family=Inter:wght@400;500;600;700;800;900&display=swap'\);
    input,select,textarea\{font-family:inherit;transition:all 0\.25s cubic-bezier\(0\.4,0,0\.2,1\);-webkit-appearance:none;appearance:none;background:#FFF;color:#1C1C1E;border:1px solid #E8E8E8;\}
    input:focus,select:focus,textarea:focus\{border-color:#4E6E58!important;box-shadow:0 0 0 3px rgba\(78,110,88,0\.15\)!important;outline:none;\}
    button\{font-family:inherit;transition:all 0\.25s cubic-bezier\(0\.4,0,0\.2,1\);position:relative;overflow:hidden;-webkit-appearance:none;appearance:none;\}
    button:hover:not\(:disabled\)\{transform:translateY\(-1px\);filter:brightness\(0\.95\);box-shadow:0 6px 16px -4px rgba\(0,0,0,0\.05\);\}"""

new_css = """    body{background:#0B1220;color:#F8FAFC;font-family:'Inter',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;}
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    input,select,textarea{font-family:inherit;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);-webkit-appearance:none;appearance:none;background:rgba(17,24,39,0.7);color:#FFFFFF;border:1px solid rgba(148,163,184,0.2);border-radius:12px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2);}
    input:focus,select:focus,textarea:focus{border-color:#00FFA3!important;box-shadow:0 0 16px rgba(0,255,163,0.2)!important;outline:none;}
    button{font-family:inherit;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;-webkit-appearance:none;appearance:none;border-radius:12px;}
    button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.1);box-shadow:0 8px 20px -4px rgba(0,224,255,0.3);}"""

content = re.sub(old_css, new_css, content, count=1, flags=re.MULTILINE|re.DOTALL)

# Replace Tokens
old_g = r'const G=\{bg:"#F4F3ED",panel:"#FFFFFF",card:"#FFFFFF",border:"#E8E8E8",accent:"#4E6E58",lightAccent:"#E8ECE9",blue:"#3B82F6",gold:"#D97706",red:"#EF4444",lightRed:"#FEE2E2",purple:"#8B5CF6",pink:"#F472B6",text:"#1C1C1E",muted:"#8E8E93",dim:"#D1D5DB",mint:"#4E6E58",lightMint:"#E8ECE9",coral:"#D97706",win:"#4E6E58",lose:"#EF4444"\};'
new_g = r'const G={bg:"#0B1220",panel:"rgba(17,24,39,0.7)",card:"rgba(17,24,39,0.5)",border:"rgba(148,163,184,0.15)",accent:"#00FFA3",cyan:"#00E0FF",grad:"linear-gradient(135deg, #00E0FF, #00FFA3)",lightAccent:"rgba(0,255,163,0.1)",blue:"#3B82F6",gold:"#F59E0B",red:"#EF4444",lightRed:"rgba(239,68,68,0.15)",purple:"#8B5CF6",pink:"#F472B6",text:"#FFFFFF",muted:"#94A3B8",dim:"#64748B",mint:"#00FFA3",lightMint:"rgba(0,255,163,0.1)",win:"#22C55E",lose:"#EF4444"};'

content = content.replace(old_g, new_g)

# Replace loading screen text colors
content = content.replace('color:#4a6480', 'color:#94A3B8')

# Replace buttons styling
old_iS = r'const iS=\(ex=\{\}\)=>(\{background:G\.card,border:`1px solid \$\{G\.border\}`,borderRadius:8,padding:"14px 20px",color:G\.text,fontSize:15,width:"100%",boxSizing:"border-box",\.\.\.ex\});'
new_iS = 'const iS=(ex={})=>({background:"rgba(11,18,32,0.8)",backdropFilter:"blur(12px)",border:`1px solid ${G.border}`,borderRadius:12,padding:"14px 20px",color:G.text,fontSize:15,outline:"none",width:"100%",boxSizing:"border-box",boxShadow:"inset 0 4px 12px rgba(0,0,0,0.5)",...ex});'
content = re.sub(old_iS, new_iS, content)

old_bP = r'const bP=\(ex=\{\}\)=>(\{padding:"14px 26px",borderRadius:8,border:"none",background:G\.accent,color:"#FFF",fontWeight:800,fontSize:15,width:"100%",\.\.\.ex\});'
new_bP = 'const bP=(ex={})=>({padding:"14px 26px",borderRadius:16,border:"none",background:G.grad,color:"#0B1220",fontWeight:800,fontSize:15,cursor:"pointer",display:"inline-block",boxShadow:"0 8px 32px rgba(0,255,163,0.15)",width:"100%",...ex});'
content = re.sub(old_bP, new_bP, content)

old_bO = r'const bO=\{padding:"12px 22px",borderRadius:8,border:`1px solid \$\{G\.border\}`,background:"#F9FAFB",color:G\.text,fontWeight:700,fontSize:14,flexShrink:0\};'
new_bO = 'const bO={padding:"12px 22px",borderRadius:16,border:`1px solid ${G.border}`,background:"rgba(11,18,32,0.6)",color:G.text,fontWeight:700,fontSize:14,flexShrink:0};'
content = re.sub(old_bO, new_bO, content)

with open('checkin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Checkin theme updated")
