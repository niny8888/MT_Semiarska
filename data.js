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
// Populate facility options from facilities.csv
Papa.parse("facilities.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const facilityDropdown = document.getElementById("facility");
        if (!facilityDropdown) {
            console.error("Dropdown with ID 'facility' not found.");
            return;
        }

        results.data.forEach((facility) => {
            if (facility["Facility Name"] && facility["Facility Name"].trim() !== "") {
                const option = document.createElement("option");
                option.value = facility["Facility Name"];
                option.textContent = facility["Facility Name"];
                facilityDropdown.appendChild(option);
            } else {
                console.warn("Facility entry is invalid:", facility);
            }
        });

        console.log("Facility dropdown populated successfully!");
    },
    error: function (error) {
        console.error("Error parsing facilities.csv:", error);
    },
});


// Populate procedure types from procedures.csv
Papa.parse("procedures.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        const procedureDropdown = document.getElementById("procedure");
        if (!procedureDropdown) {
            console.error("Dropdown with ID 'procedure' not found.");
            return;
        }

        results.data.forEach((procedure) => {
            if (procedure.name && procedure.name.trim() !== "") {
                const option = document.createElement("option");
                option.value = procedure.name;
                option.textContent = procedure.name;
                procedureDropdown.appendChild(option);
            } else {
                console.warn("Procedure entry is invalid:", procedure);
            }
        });

        console.log("Procedure dropdown populated successfully!");
    },
    error: function (error) {
        console.error("Error parsing procedures.csv:", error);
    },
});

