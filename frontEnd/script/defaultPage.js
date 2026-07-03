export function changeoption(){
    let option = document.querySelector(".change-page-option");

    if (!option) return;

    if (option.dataset.bound === "true") return;
    option.dataset.bound = "true";

    let currentPage = window.location.pathname.split("/").pop();
    const currentPageName = currentPage.replace(".html", "");

    if (["Home", "CV", "link", "login"].includes(currentPageName)) {
        option.value = currentPageName;
    }

    option.addEventListener("change", () => {
        const selectValue = option.value;
        const redirect = `${selectValue}.html`;

        if (redirect !== currentPage && !redirect.includes("default")) {
            window.location.href = `/html/${redirect}`;
        }
    });
}
