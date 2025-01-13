// Initialize the map
var map = L.map('map').setView([46.1512, 14.9955], 9); // Center the map to Slovenia

// Add the tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Add a popup instance
var popup = L.popup();

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
    L.marker([parseFloat(lat), parseFloat(lng)])
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
}

// Load and parse the CSV file
Papa.parse("facilitiesInfo.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        console.log(results.data); // Log the parsed data
        results.data.forEach(facility => {
            // Ensure all necessary fields are present before adding the marker
            if (facility.Latitude && facility.Longitude && facility["Facility Name"]) {
                addMarker(facility);
            } else {
                console.warn("Incomplete data for facility:", facility);
            }
        });
    }
});

map.on('click', onMapClick);