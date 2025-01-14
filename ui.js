(function () {
    const searchTypeDropdown = document.getElementById("search-type");
    const formService = document.getElementById("form-service");
    const formFacility = document.getElementById("form-facility");

    if (searchTypeDropdown && formService && formFacility) {
        searchTypeDropdown.addEventListener("click", function (event) {
            const target = event.target;
            if (target.tagName === "A") {
                event.preventDefault();
                const selectedType = target.getAttribute("data-type");

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

document.getElementById("open-search").addEventListener("click", () => {
    document.querySelectorAll(".form").forEach((form) => {
        form.classList.remove("active");
    });

    const facilitySearchForm = document.getElementById("search-about-facility");
    facilitySearchForm.classList.add("active");
});
