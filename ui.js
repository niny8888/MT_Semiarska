// Example: Hide "Ustanova" form when clicking "Čakalne dobe"
document.getElementById("search-type").addEventListener("click", function (event) {
    const target = event.target;
    if (target.tagName === "A") {
        event.preventDefault();

        // Hide all forms, including "Ustanova"
        document.querySelectorAll(".form").forEach((form) => {
            form.classList.remove("active");
        });

        const selectedType = target.getAttribute("data-type");

        // Show the appropriate form
        if (selectedType === "service") {
            document.getElementById("form-service").classList.add("active");
        } else if (selectedType === "facility") {
            document.getElementById("form-facility").classList.add("active");
        }
    }
});


// Ensure only the "Ustanova" form is visible when clicking the dropdown button
document.getElementById("open-search").addEventListener("click", () => {
    // Hide all forms first
    document.querySelectorAll(".form").forEach((form) => {
        form.classList.remove("active");
    });

    // Show the "Ustanova" form
    const facilitySearchForm = document.getElementById("search-about-facility");
    facilitySearchForm.classList.add("active");
});

