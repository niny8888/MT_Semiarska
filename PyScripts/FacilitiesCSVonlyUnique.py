import json
import csv

json_file = 'GetFacilities.json'
csv_file = 'companies_unique.csv'

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

unique_codes = {}

processed_data = []
for company in data:
    code = company['code']
    if code not in unique_codes:
        unique_codes[code] = 1
        processed_data.append({
            'id': company['id'],
            'name': company['name'],
            'code': code,
            'count': 1
        })
    else:
        unique_codes[code] += 1
        for entry in processed_data:
            if entry['code'] == code:
                entry['count'] = unique_codes[code]
                break

headers = ['id', 'name', 'code', 'count']

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)

    writer.writeheader()

    for company in processed_data:
        writer.writerow(company)

print(f"Unique data successfully written to '{csv_file}'.")
