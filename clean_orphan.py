with open('index.html', 'r', errors='surrogateescape') as f:
    lines = f.readlines()

# Find the second MatchReadyOverlay body — orphaned code after "}\n\n  const [sec,setSec]=useState(300);"
# It starts at the stray "  const [sec,setSec]=useState(300);" that's not inside a function
# Find the new clean function end
new_fn_end = None
for i, line in enumerate(lines):
    if '}\n' == line and i > 2190 and i < 2210:
        # Check if previous lines end the component
        if 'div>;\n' in lines[i-1] or '  </div>;\n' in lines[i-1]:
            new_fn_end = i
            break

print(f"New fn ends at line {new_fn_end+1 if new_fn_end else 'not found'}: {lines[new_fn_end].rstrip() if new_fn_end else ''}")

# Find orphan start — stray "  const [sec,setSec]=useState(300);" after the "}"
orphan_start = None
orphan_end = None
for i in range(2191, min(2300, len(lines))):
    if '  const [sec,setSec]=useState(300);' in lines[i]:
        orphan_start = i
        print(f"Orphan starts at line {i+1}")
    if orphan_start and lines[i].rstrip() == '}':
        orphan_end = i + 1
        print(f"Orphan ends at line {i+1}")
        break

if orphan_start and orphan_end:
    del lines[orphan_start:orphan_end]
    print(f"Removed {orphan_end - orphan_start} orphan lines")
    with open('index.html', 'w', errors='surrogateescape') as f:
        f.writelines(lines)
    print(f"✅ Done! File now {len(lines)} lines")
else:
    print("Cannot find orphan boundaries precisely")
