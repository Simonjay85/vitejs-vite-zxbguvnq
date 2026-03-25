import re

with open('index.html', 'r', errors='surrogateescape') as f:
    content = f.read()

# Extract the babel script
m = re.search(r'(<script type="text/babel"[^>]*>)(.*?)(</script>)', content, re.DOTALL)
if not m:
    print("No babel script found!")
    exit(1)

before = content[:m.start(2)]
script = m.group(2)
after = content[m.end(2):]

lines = script.split('\n')
total = len(lines)

# Find ALL top-level declarations (const X, function X at column 0)
# and remove duplicates (keep first occurrence)
seen_funcs = {}  # name -> first line index
seen_consts = {}  # name -> first line index
remove_ranges = []

i = 0
while i < total:
    line = lines[i]
    
    # Top-level function declaration
    fm = re.match(r'^function\s+(\w+)\s*\(', line)
    if fm:
        name = fm.group(1)
        if name in seen_funcs:
            # Find end of this function
            end = i + 1
            depth = line.count('{') - line.count('}')
            while end < total and depth > 0:
                depth += lines[end].count('{') - lines[end].count('}')
                end += 1
            # Also skip blank lines/comments after
            while end < total and (lines[end].strip() == '' or lines[end].strip().startswith('//')):
                end += 1
            remove_ranges.append((i, end, f"function {name}"))
            i = end
            continue
        else:
            seen_funcs[name] = i
    
    # Top-level const/let declaration (not inside a function)
    cm = re.match(r'^const\s+(\w+)\s*[=\[]', line)
    if cm:
        name = cm.group(1)
        if name in seen_consts:
            # Find end of this const (handle multiline arrays/objects)
            end = i + 1
            depth = line.count('{') - line.count('}') + line.count('[') - line.count(']') + line.count('(') - line.count(')')
            while end < total and depth > 0:
                depth += lines[end].count('{') - lines[end].count('}') + lines[end].count('[') - lines[end].count(']') + lines[end].count('(') - lines[end].count(')')
                end += 1
            # Skip trailing blank/comment lines
            while end < total and lines[end].strip() == '':
                end += 1
            remove_ranges.append((i, end, f"const {name}"))
            i = end
            continue
        else:
            seen_consts[name] = i
    
    i += 1

# Remove in reverse order
print(f"Found {len(remove_ranges)} duplicate blocks to remove:")
for start, end, name in remove_ranges:
    print(f"  {name}: lines {start+1}-{end} ({end-start} lines)")

for start, end, name in sorted(remove_ranges, reverse=True):
    del lines[start:end]

new_script = '\n'.join(lines)
new_content = before + new_script + after

with open('index.html', 'w', errors='surrogateescape') as f:
    f.write(new_content)

print(f"✅ Done! Removed {sum(e-s for s,e,_ in remove_ranges)} lines. Script now {len(lines)} lines.")
