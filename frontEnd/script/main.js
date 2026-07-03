import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectFULLCreator,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage, applyProjectAccess } from "./linkPage.js";
import { bindAdminPage } from "./loginPage.js";
import { isAdmin, setGuestRole } from "./siteState.js";


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
        let buttonLabel = "Admin Access";
        if (isAdmin()) {
            buttonLabel = "Back to Default Access";
        } else if (currentPage === "login.html") {
            buttonLabel = "Home";
        }

        container.innerHTML = "";

        const roleBadge = document.createElement("span");
        roleBadge.className = "session-role-badge";
        roleBadge.textContent = role;

        const roleButton = document.createElement("button");
        roleButton.className = "session-role-button";
        roleButton.textContent = buttonLabel;
        roleButton.addEventListener("click", () => {
            if (isAdmin()) {
                setGuestRole();
                window.location.reload();
                return;
            }

            if (currentPage === "login.html") {
                window.location.href = "/html/Home.html";
            } else {
                window.location.href = "/html/login.html";
            }
        });

        container.append(roleBadge, roleButton);
    });
}


changeoption();

const currentPage = window.location.pathname.split("/").pop();


if (currentPage === "CV.html"){
    loadCV();
}

if (currentPage === "login.html") {
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
