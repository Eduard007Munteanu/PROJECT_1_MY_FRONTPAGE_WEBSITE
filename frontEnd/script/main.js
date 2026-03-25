import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectFULLCreator,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage} from "./linkPage.js";


function loadCV() {
    fetch("CVContent.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("info-content").innerHTML = html;
        });
}


changeoption();

const currentPage = window.location.pathname.split("/").pop();


if (currentPage === "CV.html"){
    loadCV();
}


if (currentPage === "link.html") {
    RenderDataOnPage();
    insertLinkContent();
    projectFULLCreator();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

