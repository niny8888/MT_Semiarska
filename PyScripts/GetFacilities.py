import csv
import requests

url = "https://gitlab.com/api/v4/projects/56593819/jobs/artifacts/main/raw/out.json?job=run"
csv_file = 'facilities.csv'
facilities = set()

# Fetching the JSON data
response = requests.get(url, timeout=10)
if response.status_code == 200:
    data = response.json()
else:
    print(f"Failed to fetch data. HTTP status code: {response.status_code}")
    exit()

# Extracting facility names
def extract_facilities(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "facility":
                facilities.add(value.replace(",", ""))  # Remove commas
            else:
                extract_facilities(value)
    elif isinstance(data, list):
        for item in data:
            extract_facilities(item)

extract_facilities(data)

# Writing facilities to a CSV file
with open(csv_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Facility Name"])
    for facility in sorted(facilities):  # Sorting for consistent output
        writer.writerow([facility])

print(f"Extracted {len(facilities)} facilities and saved to {csv_file}")
