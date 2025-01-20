import csv
import requests

# URL of the JSON data
url = "https://gitlab.com/api/v4/projects/56593819/jobs/artifacts/main/raw/out.json?job=run"

# Fetch the JSON data
def fetch_data(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

# Process the data and write to CSV
def process_and_save_to_csv(data, output_file):
    with open(output_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        # Write the header
        writer.writerow(["Procedure Code", "Procedure Name", "Facility", "Category", "Waiting Days"])

        # Iterate through procedures and write the rows
        for procedure in data.get("procedures", []):
            procedure_code = procedure.get("code", "")
            procedure_name = procedure.get("name", "")
            waiting_periods = procedure.get("waitingPeriods", {})

            for category, facilities in waiting_periods.items():
                for facility_info in facilities:
                    facility_name = facility_info.get("facility", "")
                    waiting_days = facility_info.get("days", "")
                    writer.writerow([procedure_code, procedure_name, facility_name, category, waiting_days])

# Main function
def main():
    try:
        print("Fetching data from URL...")
        data = fetch_data(url)
        print("Data fetched successfully.")

        output_file = "procedures_waiting_times.csv"
        print(f"Processing data and saving to {output_file}...")
        process_and_save_to_csv(data, output_file)
        print(f"Data saved to {output_file} successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()