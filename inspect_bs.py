import requests
import json

url = "https://api.askanalyst.com.pk/api/bs/1"
try:
    res = requests.get(url, timeout=10)
    data = res.json()
    if isinstance(data, list) and len(data) > 0:
        item = data[0]
        print("Keys:", list(item.keys()))
        # Search for interesting keys in 'data' list inside item
        # Wait, structure of BS is usually list of years, and inside each year, there's a list of items?
        # Let's inspect the structure of 'item'
        if 'data' in item:
             print("Inner Data Keys (first item):", list(item['data'][0].keys()) if len(item['data']) > 0 else "Empty")
             # Search for cash/debt in inner data labels
             for d in item['data']:
                 if 'label' in d and any(x in d['label'].lower() for x in ['cash', 'debt', 'loan', 'liabilities']):
                     print(f"Found: {d['label']} = {d.get('value')} (Year: {d.get('year')})")
        else:
            # Maybe flat structure?
             for k, v in item.items():
                 if any(x in k.lower() for x in ['cash', 'debt', 'loan', 'liabilities']):
                     print(f"Found Key: {k} = {v}")

    else:
        print("Data:", data)
except Exception as e:
    print(e)
