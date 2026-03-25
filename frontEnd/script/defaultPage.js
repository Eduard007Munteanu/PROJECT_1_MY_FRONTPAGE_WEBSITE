export function changeoption(){
    let option = document.querySelector(".change-page-option");

    if (option.dataset.bound === "true") return;
    option.dataset.bound = "true";

    let currentPage = window.location.pathname.split("/").pop();

    option.addEventListener("change", () => {
        const selectValue = option.value;
        const redirect = `${selectValue}.html`;

        if (redirect !== currentPage && !redirect.includes("default")) {
            window.location.href = `/html/${redirect}`;
        }
    });
}