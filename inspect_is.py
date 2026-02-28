import requests
import json

url = "https://api.askanalyst.com.pk/api/is/1"
try:
    res = requests.get(url, timeout=10)
    data = res.json()
    if isinstance(data, list) and len(data) > 0:
        print("Structure: List of years?")
         # Assuming data is list of objects with 'data' field
        if 'data' in data[0]:
             print("Keys in 'data' of first item:", [x.get('label') for x in data[0]['data']])
        else:
             print("First Item Keys:", data[0].keys())
        print("Sample:", json.dumps(data[0], indent=2)[:500])
    else:
        print("Structure:", type(data))
        print("Sample:", json.dumps(data, indent=2)[:500])

except Exception as e:
    print(e)
