import re

with open('index.html', 'r', errors='surrogateescape') as f:
    content = f.read()

m = re.search(r'<script type="text/babel"[^>]*>(.*?)</script>', content, re.DOTALL)
script = m.group(2) if m and len(m.groups()) >= 2 else m.group(1)
lines = script.split('\n')

# Find App() function start
app_start = None
for i, line in enumerate(lines):
    if line.startswith('function App(){'):
        app_start = i
        print(f"App() starts at script line {i+1}")
        break

if app_start is None:
    print("App() not found!")
    exit(1)

# Track brace depth from App() start
depth = 0
for i in range(app_start, len(lines)):
    line = lines[i]
    # Skip string literals and JSX props naively (count { and })
    in_str = False
    str_char = None
    for j, ch in enumerate(line):
        if in_str:
            if ch == str_char and (j == 0 or line[j-1] != '\\'):
                in_str = False
            continue
        if ch in ('"', "'", '`'):
            in_str = True
            str_char = ch
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and i > app_start + 5:
                print(f"App() closes at script line {i+1} (index.html ~{i+script.count(chr(10), 0, m.start(1)) + 1})")
                # Show 3 lines around close
                for k in range(max(0,i-3), min(len(lines), i+5)):
                    print(f"  {k+1}: {lines[k][:120]}")
                exit(0)
