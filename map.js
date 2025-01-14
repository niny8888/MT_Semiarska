// Initialize the map
const map = L.map("map").setView([46.1512, 14.9955], 9); // Center the map to Slovenia

// Add the tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
}).addTo(map);

let popup = L.popup(); // Popup instance
let markers = []; // Array to hold all markers
let tempMarker = null; // Temporary marker for user-selected locations
let locationInputMode = false; // Tracks if location input mode is active

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
        "Website URI": website,
    } = facility;

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

    marker.type = type; // Store the type for filtering
    markers.push(marker); // Add marker to the global array
}

// Function to filter markers by type
function filterMarkers(selectedType) {
    markers.forEach((marker) => {
        if (marker.type === selectedType) {
            marker.setIcon(
                L.icon({
                    iconUrl: `assets/img/${selectedType}.png`, // Custom icon for selected type
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -35],
                })
            );
        } else {
            marker.setIcon(
                L.icon({
                    iconUrl: "assets/img/location_grey.png", // Default grey icon for other types
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -35],
                })
            );
        }
    });
}

// Handle map click events
map.on("click", function (e) {
    if (!locationInputMode) return;

    const { lat, lng } = e.latlng;

    if (tempMarker) {
        map.removeLayer(tempMarker);
    }

    tempMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: "assets/img/location_orange.png", // Custom icon for the temporary marker
            iconSize: [30, 40],
            iconAnchor: [15, 40],
        }),
    }).addTo(map);

    tempMarker.bindPopup(
        `<b>Selected Location</b><br>Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
    ).openPopup();

    locationInputMode = false;
    console.log(`Selected Location: Latitude ${lat}, Longitude ${lng}`);
});

// Handle location selection using "My Location" button
document.addEventListener("DOMContentLoaded", function () {
    const locationButton = document.getElementById("location-input-btn");

    if (locationButton) {
        locationButton.addEventListener("click", function () {
            locationInputMode = true;
            alert("Click on the map to select a location.");
        });
    } else {
        console.error("Button with ID 'location-input-btn' not found.");
    }
});
