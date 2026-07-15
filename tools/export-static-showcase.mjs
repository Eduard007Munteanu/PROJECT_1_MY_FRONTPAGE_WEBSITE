import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "static-showcase");
const frontEndRoot = path.join(projectRoot, "frontEnd");
const assetsRoot = path.join(outputRoot, "assets");
const uploadSource = path.join(projectRoot, "backEnd", "upload");
const uploadTarget = path.join(assetsRoot, "uploads");
const cvSource = path.join(projectRoot, "backEnd", "cv", "Eduard_CV.pdf");
const cvTarget = path.join(assetsRoot, "cv", "Eduard_CV.pdf");

const projects = await loadProjects();

await rm(outputRoot, { recursive: true, force: true });
await mkdir(path.join(outputRoot, "html"), { recursive: true });
await mkdir(path.join(outputRoot, "styles"), { recursive: true });
await mkdir(path.join(outputRoot, "script"), { recursive: true });
await mkdir(path.join(outputRoot, "API"), { recursive: true });
await mkdir(path.join(outputRoot, "data"), { recursive: true });
await mkdir(path.join(assetsRoot, "cv"), { recursive: true });
await mkdir(uploadTarget, { recursive: true });

await copyExistingDirectory(uploadSource, uploadTarget);
await copyExistingFile(cvSource, cvTarget);
await removeVideoFiles(uploadTarget);
await copyStaticFrontendShell();
await writeStaticFiles(projects);

console.log(`Static showcase exported to ${outputRoot}`);

async function loadProjects() {
    try {
        const response = await fetch("http://localhost:8080/api/links");
        if (!response.ok) {
            throw new Error(`Failed to fetch current project data: ${response.status}`);
        }

        const apiProjects = await response.json();
        return normalizeProjects(apiProjects);
    } catch {
        return await loadProjectsFromExistingStatic();
    }
}

async function copyExistingDirectory(source, target) {
    try {
        await stat(source);
        await cp(source, target, { recursive: true, force: true });
    } catch {
        // Ignore missing source directory for export.
    }
}

async function copyExistingFile(source, target) {
    try {
        await stat(source);
        await cp(source, target, { force: true });
    } catch {
        // Ignore missing file and leave links broken rather than crashing export.
    }
}

async function removeVideoFiles(targetDirectory) {
    try {
        const entries = await readdir(targetDirectory, { withFileTypes: true });
        await Promise.all(
            entries
                .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".mp4")
                .map((entry) => rm(path.join(targetDirectory, entry.name), { force: true }))
        );
    } catch {
        // Ignore missing directory.
    }
}

async function copyStaticFrontendShell() {
    const frontendFiles = [
        ["html/Home.html", "html/Home.html"],
        ["html/link.html", "html/link.html"],
        ["html/specificLink.html", "html/specificLink.html"],
        ["styles/main.css", "styles/main.css"],
        ["styles/specificLink.css", "styles/specificLink.css"],
        ["script/main.js", "script/main.js"],
        ["script/defaultPage.js", "script/defaultPage.js"],
        ["script/linkPage.js", "script/linkPage.js"],
        ["script/specificLinkPage.js", "script/specificLinkPage.js"],
        ["script/imageCropper.js", "script/imageCropper.js"]
    ];

    await Promise.all(
        frontendFiles.map(([sourceRelative, targetRelative]) =>
            cp(path.join(frontEndRoot, sourceRelative), path.join(outputRoot, targetRelative), { force: true })
        )
    );
}

async function writeStaticFiles(projectsToWrite) {
    const exportedProjects = projectsToWrite.map((project) => ({
        ...project,
        video_url: ""
    }));

    await writeFile(path.join(outputRoot, "data", "projects.json"), JSON.stringify(exportedProjects, null, 2), "utf8");
    await writeFile(path.join(outputRoot, "API", "linkAPI.js"), buildStaticApi(), "utf8");
    await writeFile(path.join(outputRoot, "script", "siteState.js"), buildStaticSiteState(), "utf8");
    await writeFile(path.join(outputRoot, "script", "appConfig.js"), buildStaticAppConfig(), "utf8");
    await writeFile(path.join(outputRoot, "config.js"), "window.__APP_CONFIG__ = {};\n", "utf8");
    await writeFile(path.join(outputRoot, "index.html"), buildIndexRedirect(), "utf8");
    await writeFile(path.join(outputRoot, "staticServer.js"), buildStaticServer(), "utf8");
}

async function loadProjectsFromExistingStatic() {
    const legacyProjectDirectory = path.join(outputRoot, "project");
    const files = (await readdir(legacyProjectDirectory))
        .filter((fileName) => /^\d+\.html$/.test(fileName))
        .sort((leftFile, rightFile) => Number(leftFile.replace(".html", "")) - Number(rightFile.replace(".html", "")));

    if (!files.length) {
        throw new Error("No backend response and no existing static project pages available.");
    }

    const projects = [];

    for (const fileName of files) {
        const projectId = Number(fileName.replace(".html", ""));
        const filePath = path.join(legacyProjectDirectory, fileName);
        const html = await readFile(filePath, "utf8");

        const specificationMap = {};
        for (const specificationMatch of html.matchAll(/<section class="spec-block">\s*<h3>(.*?)<\/h3>\s*<ul>([\s\S]*?)<\/ul>\s*<\/section>/g)) {
            const label = decodeHtml(specificationMatch[1]).trim().toLowerCase();
            const items = [...specificationMatch[2].matchAll(/<li>(.*?)<\/li>/g)]
                .map((itemMatch) => decodeHtml(itemMatch[1]).trim())
                .filter(Boolean)
                .join("\n");
            specificationMap[label] = items;
        }

        const descriptionSection = html.match(/<section class="card">\s*<h2>Project Description<\/h2>([\s\S]*?)<\/section>/);
        const descriptionParagraphs = descriptionSection
            ? [...descriptionSection[1].matchAll(/<p>(.*?)<\/p>/g)]
                .map((paragraphMatch) => decodeHtml(paragraphMatch[1]).trim())
                .filter(Boolean)
            : [];

        const imageMatch = html.match(/<img class="detail-image" src="\.\.\/assets\/uploads\/([^"]+)"/);
        const pdfMatch = html.match(/href="\.\.\/assets\/uploads\/([^"]+\.pdf)"/);

        projects.push({
            id: projectId,
            created_at: `2000-01-01T00:00:${String(projectId).padStart(2, "0")}Z`,
            project_name: decodeHtml(extractMatch(html, /<h1>(.*?)<\/h1>/)),
            project_summary: decodeHtml(extractMatch(html, /<p class="lead">(.*?)<\/p>/)),
            project_category: normalizeCategoryFromLabel(extractMatch(html, /<p class="category-pill">(.*?)<\/p>/)),
            description: descriptionParagraphs.join("\n\n"),
            github_link: "",
            pdf_url: pdfMatch ? decodeURIComponent(pdfMatch[1]) : "",
            video_url: "",
            image_url: imageMatch ? decodeURIComponent(imageMatch[1]) : "",
            project_context: specificationMap["context"] ?? "",
            project_role: specificationMap["role"] ?? "",
            project_goal: specificationMap["goal"] ?? "",
            project_languages: specificationMap["languages"] ?? "",
            project_technologies: specificationMap["technologies"] ?? "",
            project_takeaways: specificationMap["key learnings"] ?? ""
        });
    }

    return normalizeProjects(projects);
}

function normalizeProjects(projectsToNormalize) {
    return [...projectsToNormalize]
        .map((project) => ({
            ...project,
            project_category: project.project_category === "academic" ? "academic" : "personal",
            project_name: project.project_name ?? "Untitled Project",
            project_summary: project.project_summary ?? "",
            description: project.description ?? "",
            github_link: project.github_link ?? "",
            pdf_url: project.pdf_url ?? "",
            video_url: "",
            image_url: project.image_url ?? "",
            project_context: project.project_context ?? "",
            project_role: project.project_role ?? "",
            project_goal: project.project_goal ?? "",
            project_languages: project.project_languages ?? "",
            project_technologies: project.project_technologies ?? "",
            project_takeaways: project.project_takeaways ?? ""
        }))
        .sort((leftProject, rightProject) => {
            const leftCreated = new Date(leftProject.created_at ?? 0).getTime();
            const rightCreated = new Date(rightProject.created_at ?? 0).getTime();

            if (leftCreated !== rightCreated) {
                return leftCreated - rightCreated;
            }

            return Number(leftProject.id) - Number(rightProject.id);
        });
}

function extractMatch(value, pattern) {
    const match = value.match(pattern);
    return match ? match[1] : "";
}

function normalizeCategoryFromLabel(label) {
    return String(label).toLowerCase().includes("academic") ? "academic" : "personal";
}

function decodeHtml(value) {
    return String(value ?? "")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
}

function buildIndexRedirect() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/html/Home.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="/html/Home.html">Home</a>...</p>
</body>
</html>
`;
}

function buildStaticSiteState() {
    return `export function isLocalDev() {
    return false;
}

export function getRole() {
    return "guest";
}

export function isAdmin() {
    return false;
}

export function setAdminRole() {}

export function setGuestRole() {}

export function toggleAdminRole() {
    return "guest";
}
`;
}

function buildStaticAppConfig() {
    return `export function getBackendBaseUrl() {
    return window.location.origin;
}

export function getLinksApiBaseUrl() {
    return "/data/projects.json";
}

export function getCvPdfUrl() {
    return "/assets/cv/Eduard_CV.pdf";
}

export function getCvPdfDownloadUrl() {
    return "/assets/cv/Eduard_CV.pdf";
}
`;
}

function buildStaticApi() {
    return `let cachedProjects = null;

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
    return fileName ? \`/assets/uploads/\${encodeURIComponent(fileName)}\` : "";
}

export async function getAllLinks() {
    return await loadProjects();
}

export async function getSpecificLink(specific_id) {
    const projects = await loadProjects();
    const project = projects.find((entry) => String(entry.id) === String(specific_id));
    if (!project) {
        throw new Error(\`failed to fetch that specific link with id: \${specific_id}\`);
    }
    return project;
}

export async function getShowPDF(specific_id) {
    const response = await fetch(getShowPDFPath(specific_id));
    if (!response.ok) {
        throw new Error(\`failed to fetch that specific link with id: \${specific_id}\`);
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
        throw new Error(\`failed to fetch that specific link with id: \${specific_id}\`);
    }
    return await response.blob();
}

export async function getSpecificVideoFromLink(specific_id) {
    const response = await fetch(getVideoPath(specific_id));
    if (!response.ok) {
        throw new Error(\`failed to fetch that specific link with id: \${specific_id}\`);
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
`;
}

function buildStaticServer() {
    return `const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5500);
const ROOT = __dirname;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((request, response) => {
    if (request.url === "/") {
        response.writeHead(302, { Location: "/html/Home.html" });
        response.end();
        return;
    }

    const requestPath = request.url.split("?")[0];
    const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\\.\\.[\\\\/])+/, "");
    const filePath = path.join(ROOT, normalizedPath);

    if (!filePath.startsWith(ROOT)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Not found");
            return;
        }

        const resolvedPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
        const extension = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[extension] || "application/octet-stream";

        fs.readFile(resolvedPath, (readError, fileBuffer) => {
            if (readError) {
                response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Not found");
                return;
            }

            response.writeHead(200, { "Content-Type": contentType });
            response.end(fileBuffer);
        });
    });
});

server.listen(PORT, () => {
    console.log("Static showcase running on http://localhost:" + PORT);
});
`;
}
