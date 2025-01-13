import requests
import os
import csv

# Set your API key and input/output file paths
api_key = os.environ["GOOGLE_MAPS_KEY"]
input_csv = 'facilities.csv'
output_csv = 'facilitiesInfo.csv'

# Set up the request URL and headers
url = f"https://places.googleapis.com/v1/places:searchText?key={api_key}&fields=*"
headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
}

# Read input data and write output data
with open(input_csv, 'r', encoding='utf-8') as infile, open(output_csv, 'w', encoding='utf-8', newline='') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    
    # Write the header to the output file
    writer.writerow([
        "Facility Name", "Opening Days and Hours", "Phone", 
        "Latitude", "Longitude", "Formatted Address", 
        "Primary Type", "Accessibility Options", 
        "Maps URI", "Website URI"
    ])
    
    # Iterate through rows in the input CSV
    for row in reader:
        facility_name = row[0]  # Assuming facility name is in the first column
        print(f"Processing: {facility_name}")
        
        # Define the payload for the request
        query = {"textQuery": facility_name}
        
        try:
            # Send the POST request
            response = requests.post(url, headers=headers, json=query, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "places" in data and len(data["places"]) > 0:
                    # Get the first place
                    first_place = data["places"][0]
                    
                    # Extract the required fields
                    weekday_descriptions = first_place.get("regularOpeningHours", {}).get("weekdayDescriptions", [])
                    phone = first_place.get("internationalPhoneNumber", "")
                    location = first_place.get("location", {})
                    formatted_address = first_place.get("formattedAddress", "")
                    primary_type = first_place.get("primaryType", "")
                    accessibility_options = first_place.get("accessibilityOptions", [])
                    maps_uri = first_place.get("googleMapsUri", "")
                    website_uri = first_place.get("websiteUri", "")
                    
                    # Write data to the output CSV
                    writer.writerow([
                        facility_name, 
                        "; ".join(weekday_descriptions), 
                        phone, 
                        location.get("latitude", ""), 
                        location.get("longitude", ""), 
                        formatted_address, 
                        primary_type, 
                        "; ".join(accessibility_options), 
                        maps_uri, 
                        website_uri
                    ])
                else:
                    print(f"No places found for: {facility_name}")
                    writer.writerow([facility_name, "No data found"] + [""] * 8)
            else:
                print(f"Error: {response.status_code} for {facility_name}")
                writer.writerow([facility_name, f"Error: {response.status_code}"] + [""] * 8)
        except Exception as e:
            print(f"Exception for {facility_name}: {e}")
            writer.writerow([facility_name, f"Exception: {e}"] + [""] * 8)
