import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectFULLCreator,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage, applyProjectAccess } from "./linkPage.js";
import { bindAdminPage } from "./loginPage.js";
import { isAdmin } from "./siteState.js";


function loadCV() {
    fetch("CVContent.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("info-content").innerHTML = html;
        });
}

function renderSessionControls(currentPage) {
    document.querySelectorAll(".session-controls").forEach((container) => {
        if (!container) return;

        const role = isAdmin() ? "Admin User" : "Guest User";

        container.innerHTML = "";

        const roleBadge = document.createElement("span");
        roleBadge.className = "session-role-badge";
        roleBadge.textContent = role;
        container.append(roleBadge);
    });
}


changeoption();

const currentPage = window.location.pathname.split("/").pop();


if (currentPage === "CV.html"){
    loadCV();
}

if (currentPage === "Home.html") {
    bindAdminPage();
}

if (currentPage === "link.html") {
    applyProjectAccess();
    RenderDataOnPage();
    insertLinkContent();
    projectFULLCreator();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

renderSessionControls(currentPage);
