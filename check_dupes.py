import re, collections
with open('index.html','r',errors='surrogateescape') as f: c=f.read()
m=re.search(r'<script type="text/babel"[^>]*>(.*?)</script>', c, re.DOTALL)
script = m.group(1)
lines = script.split('\n')
consts = []
for i, line in enumerate(lines):
    cm = re.match(r'^const\s+(\w+)', line)
    if cm: consts.append((cm.group(1), i+1))
    fm = re.match(r'^function\s+(\w+)', line)
    if fm: consts.append((fm.group(1), i+1))
counts = collections.Counter(c[0] for c in consts)
dupes = {k:v for k,v in counts.items() if v > 1}
if dupes:
    for name, count in dupes.items():
        locs = [str(l) for n, l in consts if n == name]
        print("DUPLICATE:", name, "x" + str(count), "at lines", ", ".join(locs))
else:
    print("No top-level duplicates!")
