import re

files = ['index.html', 'checkin.html']
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        (r'"#111720"', 'G.card'),
        (r'"#161D2B"', 'G.panel'),
        (r'"#1E2A3A"', 'G.border'),
        (r'"#0D1117"', 'G.card'),
        (r'"#0A0F18"', 'G.panel'),
        (r'"#0B0F14"', '"#FFFFFF"'),
        (r'rgba\(255,255,255,0\.02\)', '"#F9FAFB"'),
        (r'rgba\(255,255,255,0\.03\)', '"#F9FAFB"'),
        (r'rgba\(255,255,255,0\.04\)', '"#F3F4F6"'),
        (r'rgba\(255,255,255,0\.05\)', '"#F3F4F6"'),
        (r'color:"#ffffff"', 'color:G.text'),
        (r'color:"#fff"', 'color:G.text'),
        (r'color:"#00FFB2"', 'color:G.accent'),
        (r'border:"1px solid rgba\(0,255,178,0\.1\)"', 'border:`1px solid ${G.accent}`'),
        (r'background:"rgba\(0,255,178,0\.05\)"', 'background:G.lightAccent'),
        (r'background:"#00FFB2"', 'background:G.accent'),
        (r'boxShadow:"0 20px 60px rgba\(0,0,0,0\.5\)"', 'boxShadow:"0 12px 32px rgba(0,0,0,0.06)"'),
        (r'boxShadow:"0 20px 60px rgba\(0,0,0,0\.6\)"', 'boxShadow:"0 12px 32px rgba(0,0,0,0.06)"'),
        (r'boxShadow:"0 2px 12px rgba\(0,0,0,0\.3\)"', 'boxShadow:"0 4px 12px rgba(0,0,0,0.04)"'),
    ]

    for (old, new) in replacements:
        content = re.sub(old, new, content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Replaced colors in {file}")
