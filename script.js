// Initialize the map
var map = L.map('map').setView([46.1512, 14.9955], 9); // Center the map to Slovenia

// Add the tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Add a popup instance
var popup = L.popup();
var markers = [];

// Populate dropdown dynamically
function populateDropdown(types) {
    const allowedTypes = [
        'dental_clinic', 
        'dentist', 
        'hospital', 
        'doctor', 
        'physiotherapist', 
        'pharmacy', 
        'spa', 
        'health'
    ]; // List of allowed types

    const dropdown = document.getElementById('typeDropdown');
    dropdown.innerHTML = ''; // Clear existing options

    allowedTypes.forEach(type => {
        const option = document.createElement('a');
        option.textContent = type;
        option.href = "#";
        option.addEventListener('click', () => filterMarkers(type)); // Call filterMarkers on click
        dropdown.appendChild(option);
    });
}



// Function to add a marker to the map
function addMarker(facility) {
    const {
        "Facility Name": name,
        Latitude: lat,
        Longitude: lng,
        "Formatted Address": address,
        "Opening Days and Hours": hours,
        Phone: phone,
        "Primary Type": type,
        "Accessibility Options": accessibility,
        "Maps URI": mapUri,
        "Website URI": website
    } = facility;

    // Bind the popup with the facility details
    const marker = L.marker([parseFloat(lat), parseFloat(lng)])
        .addTo(map)
        .bindPopup(
            `<b>${name}</b><br>` +
            `<i>${type}</i><br>` +
            `${address}<br>` +
            `<b>Opening Hours:</b> ${hours || "Not specified"}<br>` +
            `<b>Phone:</b> ${phone || "Not specified"}<br>` +
            `<b>Accessibility:</b> ${accessibility || "Not specified"}<br>` +
            `<a href='${mapUri}' target='_blank'>View on Maps</a><br>` +
            `<a href='${website}' target='_blank'>Visit Website</a>`
        );

    marker.type = type; // Store type for filtering
    markers.push(marker);
}

// Function to filter markers by type
function filterMarkers(selectedType) {
    markers.forEach(marker => {
        if (marker.type === selectedType) {
            marker.setIcon(L.icon({
                iconUrl: `assets/img/${selectedType}.png`, // Use the image based on the type
                iconSize: [30, 40], // Adjust icon size as needed
                iconAnchor: [15, 40], // Anchor point for the icon
                popupAnchor: [0, -35] // Position the popup above the marker
            }));
            marker.addTo(map); // Ensure the marker is visible
        } else {
            marker.setIcon(L.icon({
                iconUrl: 'assets/img/location_grey.png', // Default grey icon for unselected markers
                iconSize: [30, 40],
                iconAnchor: [15, 40],
                popupAnchor: [0, -35]
            }));
            marker.addTo(map); // Ensure it is still visible
        }
    });
}




// Load and parse the CSV file
Papa.parse("facilitiesInfo.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        console.log(results.data); // Log the parsed data

        const types = new Set(); // Store unique facility types
        results.data.forEach(facility => {
            // Ensure all necessary fields are present before adding the marker
            if (facility.Latitude && facility.Longitude && facility["Facility Name"]) {
                addMarker(facility);
                if (facility["Primary Type"]) types.add(facility["Primary Type"]); // Collect unique types
            } else {
                console.warn("Incomplete data for facility:", facility);
            }
        });

        // Populate dropdown with unique types
        populateDropdown(Array.from(types));
    }
});

// Handle map clicks (preserving your event listener)
map.on('click', onMapClick);
