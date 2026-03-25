import subprocess, re

# Get old version from git
r = subprocess.run(['git', 'show', 'HEAD~5:index.html'], capture_output=True, text=True, errors='surrogateescape')
old_html = r.stdout

# Extract PayQRBox + CostTab
# PayQRBox starts at "function PayQRBox" and CostTab follows until the next top-level function after CostTab
pay_start = old_html.find('\nfunction PayQRBox(')
cost_start = old_html.find('\nfunction CostTab(', pay_start)

# Find end of CostTab — look for next top-level function
after_cost = cost_start + 100
while True:
    next_fn = old_html.find('\nfunction ', after_cost)
    if next_fn == -1:
        break
    # Check if this is actually at top level (no leading spaces)
    line_start = old_html.rfind('\n', 0, next_fn) + 1
    line = old_html[line_start:next_fn+20]
    if old_html[next_fn+1:next_fn+9] == 'function':
        break
    after_cost = next_fn + 10

extracted = old_html[pay_start:next_fn]
print(f"Extracted PayQRBox+CostTab: {len(extracted)} chars")

# Insert into current index.html before "// Match Ready Overlay" or "function MatchReadyOverlay"
with open('index.html', 'r', errors='surrogateescape') as f:
    html = f.read()

marker = '\nfunction MatchReadyOverlay('
pos = html.find(marker)
# Back up a few lines to find comment
comment_pos = html.rfind('\n// ', 0, pos)
if comment_pos > pos - 200:
    pos = comment_pos

new_html = html[:pos] + '\n' + extracted + '\n' + html[pos:]
with open('index.html', 'w', errors='surrogateescape') as f:
    f.write(new_html)
print(f"✅ Done! Inserted at position {pos}")
