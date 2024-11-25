import json
import csv

json_file = 'GetFacilities.json'
csv_file = 'companies.csv' 

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = ['id', 'name', 'code']

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)

    writer.writeheader()

    for company in data:
        writer.writerow({
            'id': company['id'],
            'name': company['name'],
            'code': company['code']
        })

print(f"Data successfully written to '{csv_file}'.")
