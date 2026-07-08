function getRuntimeConfig() {
    return window.__APP_CONFIG__ ?? {};
}

function trimTrailingSlash(value) {
    return value.replace(/\/+$/, "");
}

export function getBackendBaseUrl() {
    const configuredUrl = getRuntimeConfig().backendBaseUrl;
    if (typeof configuredUrl === "string" && configuredUrl.trim()) {
        return trimTrailingSlash(configuredUrl.trim());
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:8080";
    }

    return trimTrailingSlash(window.location.origin);
}

export function getLinksApiBaseUrl() {
    return `${getBackendBaseUrl()}/api/links`;
}

export function getCvPdfUrl() {
    return `${getBackendBaseUrl()}/api/cv/pdf`;
}

export function getCvPdfDownloadUrl() {
    return `${getBackendBaseUrl()}/api/cv/pdf/download`;
}
