import { changeoption } from "./defaultPage.js";
import { insertLinkContent,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage, applyProjectAccess, initProjectCategorySwitcher } from "./linkPage.js";
import { bindAdminPage } from "./loginPage.js";
import { isAdmin } from "./siteState.js";

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

if (currentPage === "Home.html") {
    bindAdminPage();
}

if (currentPage === "link.html") {
    applyProjectAccess();
    initProjectCategorySwitcher();
    RenderDataOnPage();
    insertLinkContent();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

renderSessionControls(currentPage);
