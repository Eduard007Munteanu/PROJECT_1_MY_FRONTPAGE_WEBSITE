import { changeoption } from "./defaultPage.js";
import { insertLinkContent,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage, applyProjectAccess, initProjectCategorySwitcher } from "./linkPage.js";
import { isAdmin, isLocalDev, toggleAdminRole } from "./siteState.js";
import { getCvPdfDownloadUrl, getCvPdfUrl } from "./appConfig.js";

function renderSessionControls() {
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
            toggleButton.textContent = isAdmin() ? "Return to Guest" : "Enable Local Admin";
            toggleButton.title = "Local development only";
            toggleButton.addEventListener("click", () => {
                toggleAdminRole();
                window.location.reload();
            });
            container.append(toggleButton);
        }
    });
}

function hydrateHomeLinks() {
    const openCvLink = document.querySelector('[data-role="open-cv-link"]');
    const downloadCvLink = document.querySelector('[data-role="download-cv-link"]');

    if (openCvLink) {
        openCvLink.href = getCvPdfUrl();
    }

    if (downloadCvLink) {
        downloadCvLink.href = getCvPdfDownloadUrl();
        downloadCvLink.setAttribute("download", "Eduard_CV.pdf");
    }
}


changeoption();
hydrateHomeLinks();

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "link.html") {
    applyProjectAccess();
    initProjectCategorySwitcher();
    RenderDataOnPage();
    insertLinkContent();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

renderSessionControls();
