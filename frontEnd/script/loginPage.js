import { isAdmin, setAdminRole, setGuestRole } from "./siteState.js";

export function bindAdminPage() {
    const usernameInput = document.querySelector(".admin-access-username");
    const passwordInput = document.querySelector(".admin-access-password");
    const loginButton = document.querySelector(".admin-access-button");
    const statusText = document.querySelector(".admin-access-status");
    const modeText = document.querySelector(".admin-access-mode");

    if (!loginButton || !statusText || !modeText) return;

    const renderState = () => {
        const admin = isAdmin();
        modeText.textContent = admin ? "Current mode: Admin User" : "Current mode: Guest User";
        loginButton.textContent = admin ? "Back to Default Access" : "Enter Admin";
        statusText.textContent = admin
            ? "Admin controls are enabled on the rest of the site."
            : "Enter any username and password to switch to admin mode.";

        if (usernameInput) usernameInput.disabled = admin;
        if (passwordInput) passwordInput.disabled = admin;
    };

    loginButton.addEventListener("click", () => {
        if (isAdmin()) {
            setGuestRole();
            renderState();
            return;
        }

        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";

        if (!username || !password) {
            statusText.textContent = "Please fill in both fields.";
            return;
        }

        setAdminRole();
        if (usernameInput) usernameInput.value = "";
        if (passwordInput) passwordInput.value = "";
        renderState();
    });

    renderState();
}
