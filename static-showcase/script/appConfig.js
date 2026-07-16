export function getBackendBaseUrl() {
    return window.location.origin;
}

export function getLinksApiBaseUrl() {
    return new URL("../data/projects.json", window.location.href).toString();
}

export function getCvPdfUrl() {
    return new URL("../assets/cv/Eduard_CV.pdf", window.location.href).toString();
}

export function getCvPdfDownloadUrl() {
    return new URL("../assets/cv/Eduard_CV.pdf", window.location.href).toString();
}
