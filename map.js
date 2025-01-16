// Initialize the map
const map = L.map("map").setView([46.1512, 14.9955], 9); // Center of Slovenia

// Add the tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
}).addTo(map);

let popup = L.popup();
let markers = []; // All markers
let tempMarker = null;
let locationInputMode = false;
let regionOverlay = null; // Variable to hold the region overlay

function intensityToColor(intensity) {
    // Clamp intensity between 0 and 1
    intensity = Math.max(0, Math.min(1, intensity));

    // Define yellow (low) to red (high) RGB values
    const lowColor = { r: 255, g: 255, b: 160 }; // Light yellow
    const highColor = { r: 255, g: 0, b: 0 };    // Red

    // Interpolate between lowColor and highColor
    const r = Math.round(lowColor.r + intensity * (highColor.r - lowColor.r));
    const g = Math.round(lowColor.g + intensity * (highColor.g - lowColor.g));
    const b = Math.round(lowColor.b + intensity * (highColor.b - lowColor.b));

    return `rgb(${r}, ${g}, ${b})`;
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
                    iconUrl: `assets/img/${selectedType}.png`,
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -35],
                })
            );
        } else {
            marker.setIcon(
                L.icon({
                    iconUrl: "assets/img/location_grey.png",
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
            iconUrl: "assets/img/location_orange.png",
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
    const toggleColoringButton = document.getElementById("toggle-coloring");

    if (locationButton) {
        locationButton.addEventListener("click", function () {
            locationInputMode = true;
            alert("Click on the map to select a location.");
        });
    } else {
        console.error("Button with ID 'location-input-btn' not found.");
    }

    if (toggleColoringButton) {
        toggleColoringButton.addEventListener("click", toggleRegionColoring);
    } else {
        console.error("Button with ID 'toggle-coloring' not found.");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const toggleColoringMunicipalityButton = document.getElementById("toggle-coloring-b");

    if (toggleColoringMunicipalityButton) {
        toggleColoringMunicipalityButton.addEventListener("click", toggleMunicipalityColoring);
    } else {
        console.error("Button with ID 'toggle-coloring-b' not found.");
    }
});

// Load and color regions with borders
function toggleRegionColoring() {
    if (regionOverlay) {
        map.removeLayer(regionOverlay);
        regionOverlay = null;
    } else {
        fetch("regions.csv")
            .then((response) => response.text())
            .then((data) => {
                const regions = Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                }).data;

                const maxPopulation = Math.max(...regions.map(r => parseInt(r.population)));

                regionOverlay = L.geoJSON(null, {
                    style: (feature) => {
                        const normalize = (str) => str.trim().toLowerCase();
                    
                        // Match GeoJSON's SR_UIME with the CSV's region
                        const regionData = regions.find(r => normalize(r.region) === normalize(feature.properties.SR_UIME));
                    
                        if (!regionData) {
                            console.warn("No matching region data found for:", feature.properties.SR_UIME);
                            return { fillColor: "#ffffff", color: "#000", weight: 1 }; // Default fallback style
                        }
                    
                        // Parse population and calculate intensity
                        const population = parseInt(regionData.population, 10);
                        if (isNaN(population)) {
                            console.error("Invalid population for region:", regionData.region);
                            return { fillColor: "#ffffff", color: "#000", weight: 1 }; // Default fallback style
                        }
                    
                        const intensity = population / maxPopulation;

                        // Use a gradient function to interpolate colors between yellow and red
                        const fillColor = intensityToColor(intensity);

                        return {
                            fillColor: fillColor,
                            fillOpacity: 0.5,
                            color: "#000", // Black border
                            weight: 2,    // Border width
                        };
                    }                    
                });

                fetch("slovenia-regions.geojson") // GeoJSON file with regions
                    .then((res) => res.json())
                    .then((geoJson) => {
                        regionOverlay.addData(geoJson);
                        regionOverlay.addTo(map);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }
}

let municipalityOverlay = null; // Variable to hold the municipality overlay

function toggleMunicipalityColoring() {
    if (municipalityOverlay) {
        map.removeLayer(municipalityOverlay);
        municipalityOverlay = null;
    } else {
        fetch("municipality.csv")
            .then((response) => response.text())
            .then((data) => {
                const municipalities = Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                }).data;

                // Compute logarithmic population values to reduce skew
                const logPopulations = municipalities.map(m => Math.log(parseInt(m.population) + 1)); // Add 1 to avoid log(0)
                const maxLogPopulation = Math.max(...logPopulations);

                municipalityOverlay = L.geoJSON(null, {
                    style: (feature) => {
                        const municipalityData = municipalities.find(m => m.municipality === feature.properties.OB_UIME);
                        if (!municipalityData) return { fillColor: "#ffffff", weight: 0 };

                        const population = parseInt(municipalityData.population);
                        const logPopulation = Math.log(population + 1); // Logarithmic value
                        const intensity = logPopulation / maxLogPopulation; // Normalize to [0, 1]
                        const color = intensityToColor(intensity); // Use the intensityToColor function

                        return {
                            fillColor: color,
                            fillOpacity: 0.7,
                            color: "#000",
                            weight: 1,
                        };
                    },
                });

                fetch("slovenia-municipality.geojson") // GeoJSON file with municipalities
                    .then((res) => res.json())
                    .then((geoJson) => {
                        municipalityOverlay.addData(geoJson);
                        municipalityOverlay.addTo(map);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }
}

// Prompt for user location on page load
document.addEventListener("DOMContentLoaded", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Add a red marker at the user's location
                const userLocationMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: "assets/img/location_red.png", // Use a red marker image
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [0, -35],
                    }),
                }).addTo(map);

                // Center the map on the user's location
                map.setView([latitude, longitude], 12);

                // Add a popup to the marker
                userLocationMarker.bindPopup("<b>Your Location</b>").openPopup();
            },
            (error) => {
                console.error("Error getting location:", error.message);
                alert("Unable to access your location. Please enable GPS and reload the page.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

const userLocationMarker = L.marker([latitude, longitude], {
    icon: L.icon({
        iconUrl: "https://cdn1.iconfinder.com/data/icons/color-bold-style/21/14_2-512.png", // Default red marker URL
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }),
});