const ROLE_KEY = "project_site_role";
const GUEST_ROLE = "guest";
const ADMIN_ROLE = "admin";

export function getRole() {
    const storedRole = window.localStorage.getItem(ROLE_KEY);
    return storedRole === ADMIN_ROLE ? ADMIN_ROLE : GUEST_ROLE;
}

export function isAdmin() {
    return getRole() === ADMIN_ROLE;
}

export function setAdminRole() {
    window.localStorage.setItem(ROLE_KEY, ADMIN_ROLE);
}

export function setGuestRole() {
    window.localStorage.setItem(ROLE_KEY, GUEST_ROLE);
}
