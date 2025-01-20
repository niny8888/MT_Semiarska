import json
import csv

json_file = 'GetProcedures.json'  
csv_file = 'procedures.csv' 

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

headers = ['id', 'name', 'idProcedure', 'fullName']

with open(csv_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)

    writer.writeheader()

    for facility in data:
        # Split the fullName into idProcedure and fullName
        full_name = facility['fullName']
        if '-' in full_name:
            id_procedure, full_name_split = full_name.split(' - ', 1)
        else:
            id_procedure = full_name  # If no dash, assume the whole name is the id
            full_name_split = ''  # Leave fullName empty

        writer.writerow({
            'id': facility['id'],
            'name': facility['name'],
            'idProcedure': id_procedure,
            'fullName': full_name_split
        })

print(f"Data successfully written to '{csv_file}'.")
