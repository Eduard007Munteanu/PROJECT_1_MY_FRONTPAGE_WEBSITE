export function changeoption(){
    let option = document.querySelector(".change-page-option");

    option.addEventListener("change", () => {
        window.location.href  = "link.html";
    })
}