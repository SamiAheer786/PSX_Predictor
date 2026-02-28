import requests
import json

url = "https://api.askanalyst.com.pk/api/is/1"
try:
    res = requests.get(url, timeout=10)
    data = res.json()
    if 'annual' in data:
        labels = [item.get('label') for item in data['annual']]
        print("Labels found:", labels)
    else:
        print("No 'annual' key found.")
except Exception as e:
    print(e)
