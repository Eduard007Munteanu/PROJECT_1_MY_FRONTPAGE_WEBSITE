import { isAdmin, setAdminRole, setGuestRole } from "./siteState.js";

const feedbackDurationMs = 1000;
const createButtonLabel = "Enter Admin";
const logoutButtonLabel = "Log Out of Admin Access";

export function bindAdminPage() {
    const openButton = document.querySelector(".home-admin-open-button");
    const overlay = document.querySelector(".overlay-admin-access");
    const closeButton = document.querySelector(".close-admin-data-button");
    const usernameInput = document.querySelector(".admin-access-username");
    const passwordInput = document.querySelector(".admin-access-password");
    const loginButton = document.querySelector(".admin-access-button");
    const statusText = document.querySelector(".admin-access-status");
    const modeText = document.querySelector(".admin-access-mode");

    if (!openButton || !overlay || !closeButton || !usernameInput || !passwordInput || !loginButton || !statusText || !modeText) {
        return;
    }

    const getFields = () => Array.from(document.querySelectorAll(".admin-access-field"));

    const clearInvalidMarks = () => {
        getFields().forEach((field) => field.classList.remove("invalid-field"));
    };

    const hideOverlay = () => {
        overlay.style.display = "none";
        usernameInput.value = "";
        passwordInput.value = "";
        clearInvalidMarks();
        resetButton();
    };

    const showOverlay = () => {
        overlay.style.display = "flex";
        renderState();
    };

    const markInvalid = (fieldName) => {
        const field = document.querySelector(`.admin-access-field[data-field="${fieldName}"]`);
        if (!field) return;
        field.classList.add("invalid-field");
        window.setTimeout(() => field.classList.remove("invalid-field"), feedbackDurationMs);
    };

    const flashButton = (state, label) => {
        loginButton.classList.remove("success-state", "error-state");
        loginButton.classList.add(state === "success" ? "success-state" : "error-state");
        loginButton.textContent = label;

        window.setTimeout(() => {
            loginButton.classList.remove("success-state", "error-state");
            loginButton.textContent = isAdmin() ? "Back to Default Access" : createButtonLabel;
        }, feedbackDurationMs);
    };

    const resetButton = () => {
        loginButton.classList.remove("success-state", "error-state");
        loginButton.textContent = isAdmin() ? "Back to Default Access" : createButtonLabel;
    };

    const renderState = () => {
        const admin = isAdmin();
        modeText.textContent = admin ? "Current mode: Admin User" : "Current mode: Guest User";
        statusText.textContent = admin
            ? "Admin controls are enabled on the rest of the site."
            : "Enter any username and password to switch to admin mode.";
        loginButton.textContent = admin ? "Back to Default Access" : createButtonLabel;
        openButton.textContent = admin ? logoutButtonLabel : "Admin Access";
    };

    openButton.addEventListener("click", () => {
        if (isAdmin()) {
            setGuestRole();
            renderState();
            hideOverlay();
            window.location.reload();
            return;
        }

        showOverlay();
    });

    closeButton.addEventListener("click", hideOverlay);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            hideOverlay();
        }
    });

    loginButton.addEventListener("click", () => {
        if (isAdmin()) {
            setGuestRole();
            renderState();
            flashButton("success", "Back to Guest");
            window.setTimeout(() => {
                hideOverlay();
                window.location.reload();
            }, feedbackDurationMs);
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        clearInvalidMarks();

        if (!username) markInvalid("username");
        if (!password) markInvalid("password");

        if (!username || !password) {
            statusText.textContent = "Important field missing";
            flashButton("error", "Important field missing");
            return;
        }

        setAdminRole();
        statusText.textContent = "Project area unlocked for Admin User.";
        flashButton("success", "Admin User");
        window.setTimeout(() => {
            renderState();
            hideOverlay();
            window.location.reload();
        }, feedbackDurationMs);
    });

    renderState();
    hideOverlay();
}
