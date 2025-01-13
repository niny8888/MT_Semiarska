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

(function () {
    // Wrap everything in an IIFE to avoid global scope pollution
    const searchTypeDropdown = document.getElementById("search-type");
    const formService = document.getElementById("form-service");
    const formFacility = document.getElementById("form-facility");

    // Check if elements exist to prevent errors
    if (searchTypeDropdown && formService && formFacility) {
        // Add event listeners for the dropdown links
        searchTypeDropdown.addEventListener("click", function (event) {
            const target = event.target; // Get the clicked element
            if (target.tagName === "A") {
                event.preventDefault(); // Prevent default link behavior
                const selectedType = target.getAttribute("data-type");

                // Show/hide forms based on the selected type
                if (selectedType === "service") {
                    formService.classList.add("active");
                    formFacility.classList.remove("active");
                } else if (selectedType === "facility") {
                    formFacility.classList.add("active");
                    formService.classList.remove("active");
                }
            }
        });
    } else {
        console.warn(
            "Dropdown menu or forms not found. Ensure IDs 'search-type', 'form-service', and 'form-facility' are correctly set in the HTML."
        );
    }
})();


// Function to populate the dropdown dynamically
function populateDropdown(types) {
    const allowedTypes = [
        "dental_clinic",
        "dentist",
        "hospital",
        "doctor",
        "physiotherapist",
        "pharmacy",
        "spa",
        "health",
    ]; // List of allowed types

    const dropdown = document.getElementById("typeDropdown");
    dropdown.innerHTML = ""; // Clear existing options

    allowedTypes.forEach((type) => {
        const option = document.createElement("a");
        option.textContent = type;
        option.href = "#";
        option.addEventListener("click", () => filterMarkers(type)); // Call filterMarkers on click
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
        "Website URI": website,
    } = facility;

    // Add a marker with a popup showing facility details
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

// Load and parse facilities from a CSV file
Papa.parse("facilitiesInfo.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const types = new Set(); // Collect unique facility types
        results.data.forEach((facility) => {
            if (facility.Latitude && facility.Longitude && facility["Facility Name"]) {
                addMarker(facility); // Add marker to the map
                if (facility["Primary Type"]) types.add(facility["Primary Type"]); // Add to types set
            }
        });
        populateDropdown(Array.from(types)); // Populate the dropdown
    },
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

// Handle map click events
map.on("click", function (e) {
    if (!locationInputMode) return; // Only process clicks if location input mode is active

    const { lat, lng } = e.latlng;

    // Remove the previous marker, if any
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }

    // Add a temporary marker at the clicked location
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

    // Exit location input mode
    locationInputMode = false;

    // Log the selected location for further processing
    console.log(`Selected Location: Latitude ${lat}, Longitude ${lng}`);
});

// Populate procedure types from procedures.csv
Papa.parse("procedures.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const procedureDropdown = document.getElementById("procedure");
        results.data.forEach((procedure) => {
            if (procedure.name && procedure.name.trim() !== "") {
                const option = document.createElement("option");
                option.value = procedure.name;
                option.textContent = procedure.name;
                procedureDropdown.appendChild(option);
            }
        });
    },
});

// Populate facility options from facilities.csv
Papa.parse("facilities.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const facilityDropdown = document.getElementById("facility");
        results.data.forEach((facility) => {
            if (facility["Facility Name"] && facility["Facility Name"].trim() !== "") {
                const option = document.createElement("option");
                option.value = facility["Facility Name"];
                option.textContent = facility["Facility Name"];
                facilityDropdown.appendChild(option);
            }
        });
    },
});


