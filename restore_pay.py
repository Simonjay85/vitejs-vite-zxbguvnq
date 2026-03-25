import subprocess

r = subprocess.run(['git', 'show', 'HEAD~5:index.html'], capture_output=True, text=True, errors='surrogateescape')
old_html = r.stdout

# Extract PlayerPayRow (2017) and EventFeeEditor (2059) from old file
lines = old_html.split('\n')

# Find PlayerPayRow function - line 2017 (0-indexed 2016)
ppr_start = None
efe_start = None
efe_end = None

for i, line in enumerate(lines):
    if line.startswith('function PlayerPayRow('):
        ppr_start = i
    if line.startswith('function EventFeeEditor('):
        efe_start = i
    # Next function after EventFeeEditor
    if efe_start and i > efe_start + 5 and line.startswith('function '):
        efe_end = i
        break

if ppr_start is None or efe_start is None:
    print("Could not find PlayerPayRow or EventFeeEditor!")
    exit(1)

extracted = '\n'.join(lines[ppr_start:efe_end])
print(f"Extracted PlayerPayRow+EventFeeEditor: {len(extracted)} chars ({efe_end-ppr_start} lines)")

# Insert into current index.html before MatchReadyOverlay
with open('index.html', 'r', errors='surrogateescape') as f:
    html = f.read()

marker = '\nfunction MatchReadyOverlay('
pos = html.find(marker)
# Back up to comment
comment_pos = html.rfind('\n// ', 0, pos)
if comment_pos > pos - 200:
    pos = comment_pos

new_html = html[:pos] + '\n' + extracted + '\n' + html[pos:]
with open('index.html', 'w', errors='surrogateescape') as f:
    f.write(new_html)
print(f"✅ Done!")
