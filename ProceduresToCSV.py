import json
import csv

json_file = 'GetProcedures.json'  
csv_file = 'procedures.csv' 

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = ['id', 'name', 'fullName']

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)

    writer.writeheader()

    for facility in data:
        writer.writerow({
            'id': facility['id'],
            'name': facility['name'],
            'fullName': facility['fullName']
        })

print(f"Data successfully written to '{csv_file}'.")
