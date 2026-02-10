import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('ALl_DATA.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells = nb['cells']
# Print full source of cell 1 (the main code cell)
src = ''.join(cells[1].get('source', []))
print(src)
