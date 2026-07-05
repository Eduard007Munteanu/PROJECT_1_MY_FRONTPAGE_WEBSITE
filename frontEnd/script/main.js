import { changeoption } from "./defaultPage.js";
import { insertLinkContent,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage, applyProjectAccess, initProjectCategorySwitcher } from "./linkPage.js";
import { isAdmin, isLocalDev, toggleAdminRole } from "./siteState.js";

function renderSessionControls(currentPage) {
    document.querySelectorAll(".session-controls").forEach((container) => {
        if (!container) return;

        const role = isAdmin() ? "Admin User" : "Guest User";

        container.innerHTML = "";

        const roleBadge = document.createElement("span");
        roleBadge.className = "session-role-badge";
        roleBadge.textContent = role;
        container.append(roleBadge);

        if (isLocalDev()) {
            const toggleButton = document.createElement("button");
            toggleButton.type = "button";
            toggleButton.className = "session-role-button";
            toggleButton.textContent = isAdmin() ? "Switch to Guest" : "Enable Admin";
            toggleButton.addEventListener("click", () => {
                toggleAdminRole();
                window.location.reload();
            });
            container.append(toggleButton);
        }
    });
}


changeoption();

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "link.html") {
    applyProjectAccess();
    initProjectCategorySwitcher();
    RenderDataOnPage();
    insertLinkContent();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

renderSessionControls(currentPage);
