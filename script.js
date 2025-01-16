// State variables to track button activity
let isColoringAActive = false;
let isColoringBActive = false;

// Get references to both buttons
const toggleColoringButtonA = document.getElementById("toggle-coloring");
const toggleColoringButtonB = document.getElementById("toggle-coloring-b");

// Function to deactivate Region Coloring (Button A)
function deactivateRegionColoringA() {
    if (regionOverlay) {
        map.removeLayer(regionOverlay);
        regionOverlay = null;
    }
    isColoringAActive = false;
    toggleColoringButtonA.classList.remove("active"); // Optional: Add a CSS class to indicate active state
}

// Function to deactivate Municipality Coloring (Button B)
function deactivateRegionColoringB() {
    if (municipalityOverlay) {
        map.removeLayer(municipalityOverlay);
        municipalityOverlay = null;
    }
    isColoringBActive = false;
    toggleColoringButtonB.classList.remove("active"); // Optional: Add a CSS class to indicate active state
}

// Function to toggle region coloring for Button A
function toggleRegionColoringA() {
    // If Button B is active, deactivate it first
    if (isColoringBActive) deactivateRegionColoringB();

    if (isColoringAActive) {
        // If already active, deactivate Button A
        deactivateRegionColoringA();
    } else {
        // Activate coloring for A
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
                        const regionData = regions.find(r => r.region === feature.properties.SR_UIME);
                        if (!regionData) return { fillColor: "#ffffff", weight: 0 };

                        const population = parseInt(regionData.population);
                        const intensity = Math.sqrt(population) / Math.sqrt(maxPopulation);
                        const color = `rgb(${255 * intensity}, ${200 * (1 - intensity)}, 0)`;

                        return {
                            fillColor: color,
                            fillOpacity: 0.7,
                            color: "#000",
                            weight: 1,
                        };
                    },
                });

                fetch("slovenia-regions.geojson")
                    .then((res) => res.json())
                    .then((geoJson) => {
                        regionOverlay.addData(geoJson);
                        regionOverlay.addTo(map);
                    })
                    .catch(console.error);
            })
            .catch(console.error);

        isColoringAActive = true;
        toggleColoringButtonA.classList.add("active"); // Optional: Add a CSS class to indicate active state
    }
}

// Function to toggle municipality coloring for Button B
function toggleRegionColoringB() {
    // If Button A is active, deactivate it first
    if (isColoringAActive) deactivateRegionColoringA();

    if (isColoringBActive) {
        // If already active, deactivate Button B
        deactivateRegionColoringB();
    } else {
        // Activate coloring for B
        fetch("municipality.csv")
            .then((response) => response.text())
            .then((data) => {
                const municipalities = Papa.parse(data, {
                    header: true,
                    skipEmptyLines: true,
                }).data;

                const maxPopulation = Math.max(...municipalities.map(m => parseInt(m.population)));

                municipalityOverlay = L.geoJSON(null, {
                    style: (feature) => {
                        const municipalityData = municipalities.find(m => m.municipality === feature.properties.OB_UIME);
                        if (!municipalityData) return { fillColor: "#ffffff", weight: 0 };

                        const population = parseInt(municipalityData.population);
                        const intensity = Math.sqrt(population) / Math.sqrt(maxPopulation);
                        const color = `rgb(${255 * intensity}, ${200 * (1 - intensity)}, 0)`;

                        return {
                            fillColor: color,
                            fillOpacity: 0.7,
                            color: "#000",
                            weight: 1,
                        };
                    },
                });

                fetch("slovenia-municipality.geojson")
                    .then((res) => res.json())
                    .then((geoJson) => {
                        municipalityOverlay.addData(geoJson);
                        municipalityOverlay.addTo(map);
                    })
                    .catch(console.error);
            })
            .catch(console.error);

        isColoringBActive = true;
        toggleColoringButtonB.classList.add("active"); // Optional: Add a CSS class to indicate active state
    }
}

// Attach event listeners to both buttons
toggleColoringButtonA.addEventListener("click", toggleRegionColoringA);
toggleColoringButtonB.addEventListener("click", toggleRegionColoringB);
