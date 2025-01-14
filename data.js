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
    ];

    const dropdown = document.getElementById("typeDropdown");
    const searchTypeDropdown = document.getElementById("search-type");

    if (!dropdown || !searchTypeDropdown) {
        console.error("Dropdown elements not found.");
        return;
    }

    dropdown.innerHTML = "";
    searchTypeDropdown.innerHTML = "";

    allowedTypes.forEach((type) => {
        const dropdownOption = document.createElement("a");
        dropdownOption.textContent = type;
        dropdownOption.href = "#";
        dropdownOption.addEventListener("click", () => filterMarkers(type));
        dropdown.appendChild(dropdownOption);

        const searchOption = document.createElement("option");
        searchOption.value = type;
        searchOption.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        searchTypeDropdown.appendChild(searchOption);
    });
}

Papa.parse("facilitiesInfo.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const types = new Set();
        results.data.forEach((facility) => {
            if (facility.Latitude && facility.Longitude && facility["Facility Name"]) {
                addMarker(facility);
                if (facility["Primary Type"]) types.add(facility["Primary Type"]);
            }
        });
        populateDropdown(Array.from(types));
    },
});
