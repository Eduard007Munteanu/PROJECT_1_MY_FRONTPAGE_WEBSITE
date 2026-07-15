let cachedProjects = null;

async function loadProjects() {
    if (cachedProjects) {
        return cachedProjects;
    }

    const response = await fetch("/data/projects.json");
    if (!response.ok) {
        throw new Error("failed to fetch links");
    }

    cachedProjects = await response.json();
    return cachedProjects;
}

function getCachedProjectById(projectId) {
    return (cachedProjects ?? []).find((project) => String(project.id) === String(projectId));
}

function buildUploadPath(fileName) {
    if (!fileName) {
        return "";
    }

    if (/^https?:\/\//i.test(fileName)) {
        return fileName;
    }

    return `/assets/uploads/${encodeURIComponent(fileName)}`;
}

export async function getAllLinks() {
    return await loadProjects();
}

export async function getSpecificLink(specific_id) {
    const projects = await loadProjects();
    const project = projects.find((entry) => String(entry.id) === String(specific_id));
    if (!project) {
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`);
    }
    return project;
}

export async function getShowPDF(specific_id) {
    const response = await fetch(getShowPDFPath(specific_id));
    if (!response.ok) {
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`);
    }
    return await response.blob();
}

export function getShowPDFPath(specific_id) {
    const project = getCachedProjectById(specific_id);
    return buildUploadPath(project?.pdf_url ?? "");
}

export async function getDownloadPDF(specific_id) {
    const response = await fetch(getShowPDFPath(specific_id));
    if (!response.ok) {
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`);
    }
    return await response.blob();
}

export async function getSpecificVideoFromLink(specific_id) {
    const response = await fetch(getVideoPath(specific_id));
    if (!response.ok) {
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`);
    }
    return await response.blob();
}

export async function createLink() {
    throw new Error("Static showcase does not support editing.");
}

export async function deleteLink() {
    throw new Error("Static showcase does not support editing.");
}

export async function deleteAllLinks() {
    throw new Error("Static showcase does not support editing.");
}

export async function getVideoPacketsToPlay() {
    throw new Error("Static showcase does not support video streaming.");
}

export function getVideoPath(specific_id) {
    const project = getCachedProjectById(specific_id);
    return buildUploadPath(project?.video_url ?? "");
}

export function getImagePath(specific_id) {
    const project = getCachedProjectById(specific_id);
    return buildUploadPath(project?.image_url ?? "");
}

export async function editBigData() {
    throw new Error("Static showcase does not support editing.");
}

export async function editTextData() {
    throw new Error("Static showcase does not support editing.");
}
