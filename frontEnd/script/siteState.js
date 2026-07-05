const ROLE_KEY = "project_site_role";
const GUEST_ROLE = "guest";
const ADMIN_ROLE = "admin";

export function isLocalDev() {
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getRole() {
    if (!isLocalDev()) {
        window.localStorage.removeItem(ROLE_KEY);
        return GUEST_ROLE;
    }

    const storedRole = window.localStorage.getItem(ROLE_KEY);
    return storedRole === ADMIN_ROLE ? ADMIN_ROLE : GUEST_ROLE;
}

export function isAdmin() {
    return getRole() === ADMIN_ROLE;
}

export function setAdminRole() {
    if (!isLocalDev()) return;
    window.localStorage.setItem(ROLE_KEY, ADMIN_ROLE);
}

export function setGuestRole() {
    if (!isLocalDev()) return;
    window.localStorage.setItem(ROLE_KEY, GUEST_ROLE);
}

export function toggleAdminRole() {
    if (!isLocalDev()) return GUEST_ROLE;

    if (isAdmin()) {
        setGuestRole();
        return GUEST_ROLE;
    }

    setAdminRole();
    return ADMIN_ROLE;
}
