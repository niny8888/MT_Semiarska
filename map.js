// Initialize the map
const map = L.map("map").setView([46.1512, 14.9955], 9); // Center of Slovenia

// Add the tile layer (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap",
}).addTo(map);

let highlightedMarker = null; // To track the currently highlighted marker
let popup = L.popup();
let markers = []; // All markers
let tempMarker = null;
let locationInputMode = false;
let regionOverlay = null; // Variable to hold the region overlay

function intensityToColor(intensity) {
    intensity = Math.max(0, Math.min(1, intensity));
    const lowColor = { r: 255, g: 255, b: 160 }; // Light yellow
    const highColor = { r: 255, g: 0, b: 0 }; // Red
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
                `${address}<br>` +
                `${hours ? hours.split(";").map((day) => `<div>${day.trim()}</div>`).join("") : "<i>Delovni čas ni na voljo</i>"}<br>` +
                `<b>Tel:</b> ${phone || "<i>Ni na voljo</i>"}<br>` +
                `<b>Dostopnost:</b> ${accessibility || "<i>Ni na voljo</i>"}<br>` +
                `<a href='${mapUri}' target='_blank'>Odpri zemljevid</a><br>` +
                `<a href='${website}' target='_blank'>Spletna stran</a>`
        );

    marker.type = type; // Store the type for filtering
    markers.push(marker); // Add marker to the global array
}

// Function to filter markers by procedure
function filterMarkersByProcedure(selectedProcedureId) {
    console.log("Filter function triggered");

    // Remove all markers from the map
    markers.forEach((marker) => {
        map.removeLayer(marker);
    });

    // Add only markers corresponding to the selected procedure
    const filteredFacilities = proceduresData.filter(
        (procedure) => procedure.ProcedureId === selectedProcedureId
    );

    // Add filtered markers back to the map
    filteredFacilities.forEach((facility) => {
        const correspondingMarker = markers.find(
            (marker) =>
                marker.getPopup().getContent().includes(facility.Facility)
        );

        if (correspondingMarker) {
            map.addLayer(correspondingMarker);

            // When the marker is clicked, update the sidebar with its information
            correspondingMarker.on("click", function () {
                updateSidebarWithMarkerInfo(correspondingMarker);
            });
        }
    });
}

// Function to update the sidebar with the selected marker's information
function updateSidebarWithMarkerInfo(marker) {
    const markerPopupContent = marker.getPopup().getContent();
    const markerName = markerPopupContent.split("<br>")[0].replace("<b>", "").replace("</b>", "");
    const markerDetails = proceduresData.find(
        (procedure) => procedure.Facility === markerName
    );

    if (markerDetails) {
        document.getElementById("marker-title").textContent = markerName;
        const waitingTimes = markerDetails["Waiting Time"] || "No waiting time available";
        document.getElementById("marker-description").innerHTML = `<b>Čakalna doba:</b> ${waitingTimes}`;
        document.getElementById("marker-population").textContent = `<b>Facility Type:</b> ${markerDetails["Primary Type"] || "N/A"}`;
        document.getElementById("marker-details").classList.remove("hidden");
    } else {
        console.error("No waiting time data found for this marker.");
    }
}

// Populate dropdown dynamically
function populateProcedureDropdown() {
    const dropdown = document.getElementById("procedure");

    dropdown.addEventListener("change", function () {
        const selectedProcedureId = this.value;
        console.log("Selected Procedure ID:", selectedProcedureId);
        if (selectedProcedureId) {
            filterMarkersByProcedure(selectedProcedureId);
        } else {
            markers.forEach((marker) => map.addLayer(marker));
        }
    });

    fetch("procedures.csv")
        .then((response) => response.text())
        .then((data) => {
            const procedures = Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
            }).data;

            procedures.forEach((procedure) => {
                const option = document.createElement("option");
                option.value = procedure.idProcedure;
                option.textContent = procedure.fullName;
                dropdown.appendChild(option);
            });
        })
        .catch(console.error);
}

// Load procedures data
let proceduresData = [];
fetch("procedures_waiting_times.csv")
    .then((response) => response.text())
    .then((data) => {
        proceduresData = Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
        }).data;
    })
    .catch(console.error);

// Initialize dropdown on page load
document.addEventListener("DOMContentLoaded", () => {
    populateProcedureDropdown();
});

document.addEventListener("DOMContentLoaded", function () {
    // Ensure user location marker is initialized
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Add a red marker at the user's location
                const userLocationMarker = L.marker([latitude, longitude], {
                    icon: L.icon({
                        iconUrl: "https://cdn1.iconfinder.com/data/icons/color-bold-style/21/14_2-512.png", // Use a red marker image
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [0, -35],
                    }),
                }).addTo(map);

                // Center the map on the user's location
                map.setView([latitude, longitude], 12); // Zoom level 12 for better clarity

                // Add a popup to the marker with some custom content
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