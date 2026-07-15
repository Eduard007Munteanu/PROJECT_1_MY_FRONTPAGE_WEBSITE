import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "static-showcase");
const assetsRoot = path.join(outputRoot, "assets");
const uploadSource = path.join(projectRoot, "backEnd", "upload");
const uploadTarget = path.join(assetsRoot, "uploads");
const cvSource = path.join(projectRoot, "backEnd", "cv", "Eduard_CV.pdf");
const cvTarget = path.join(assetsRoot, "cv", "Eduard_CV.pdf");

const response = await fetch("http://localhost:8080/api/links");
if (!response.ok) {
    throw new Error(`Failed to fetch current project data: ${response.status}`);
}

const projects = await response.json();
const sortedProjects = [...projects].sort((leftProject, rightProject) => {
    const leftCreated = new Date(leftProject.created_at ?? 0).getTime();
    const rightCreated = new Date(rightProject.created_at ?? 0).getTime();

    if (leftCreated !== rightCreated) {
        return leftCreated - rightCreated;
    }

    return Number(leftProject.id) - Number(rightProject.id);
});

await rm(outputRoot, { recursive: true, force: true });
await mkdir(path.join(outputRoot, "project"), { recursive: true });
await mkdir(uploadTarget, { recursive: true });
await mkdir(path.join(assetsRoot, "cv"), { recursive: true });
await mkdir(path.join(outputRoot, "styles"), { recursive: true });

await copyExistingDirectory(uploadSource, uploadTarget);
await copyExistingFile(cvSource, cvTarget);
await removeVideoFiles(uploadTarget);

await writeFile(path.join(outputRoot, "styles", "site.css"), buildStyles(), "utf8");
await writeFile(path.join(outputRoot, "index.html"), buildHomePage(sortedProjects), "utf8");
await writeFile(path.join(outputRoot, "projects.html"), buildProjectsPage(sortedProjects), "utf8");

for (const project of sortedProjects) {
    await writeFile(
        path.join(outputRoot, "project", `${project.id}.html`),
        buildProjectPage(project),
        "utf8"
    );
}

console.log(`Static showcase exported to ${outputRoot}`);

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
        // Ignore missing CV file and leave links broken rather than crashing export.
    }
}

async function removeVideoFiles(targetDirectory) {
    try {
        const directoryEntries = await (await import("node:fs/promises")).readdir(targetDirectory, { withFileTypes: true });
        await Promise.all(
            directoryEntries
                .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".mp4")
                .map((entry) => rm(path.join(targetDirectory, entry.name), { force: true }))
        );
    } catch {
        // Ignore missing upload directory.
    }
}

function buildHomePage(projects) {
    const academicCount = projects.filter((project) => normalizeCategory(project.project_category) === "academic").length;
    const personalCount = projects.filter((project) => normalizeCategory(project.project_category) === "personal").length;

    return wrapPage("Home", `
        <header class="topbar">
            <a class="brand" href="./index.html">Eduard Munteanu</a>
            <nav class="nav">
                <a href="./index.html" aria-current="page">Home</a>
                <a href="./projects.html">Projects</a>
            </nav>
        </header>

        <main class="page home-page">
            <section class="hero card">
                <p class="eyebrow">Computer Science Graduate</p>
                <h1>Projects, academic work, and CV in one place.</h1>
                <p class="lead">This showcase gives a focused overview of the type of software and XR-oriented work I have been building, from academic thesis projects to hands-on technical prototypes.</p>
                <div class="actions">
                    <a class="button primary" href="./projects.html">View Projects</a>
                    <a class="button" href="./assets/cv/Eduard_CV.pdf" target="_blank" rel="noopener">Open CV</a>
                </div>
            </section>

            <section class="card info-grid">
                <div>
                    <h2>Site Overview</h2>
                    <p>This public version is a static showcase snapshot. It is meant to help visitors quickly review my background, browse projects, and open the CV without exposing the editing/admin side of the local project.</p>
                </div>
                <div>
                    <h2>Project Split</h2>
                    <p><strong>${academicCount}</strong> academic projects and <strong>${personalCount}</strong> personal projects are included in this snapshot.</p>
                </div>
            </section>

            <section class="card info-grid">
                <div>
                    <h2>CV</h2>
                    <p>The CV is available as a single formatted PDF.</p>
                    <div class="actions">
                        <a class="button" href="./assets/cv/Eduard_CV.pdf" target="_blank" rel="noopener">Open PDF</a>
                        <a class="button" href="./assets/cv/Eduard_CV.pdf" download>Download CV</a>
                    </div>
                </div>
                <div>
                    <h2>Contact</h2>
                    <p>Email: edoha0117@yahoo.com</p>
                    <p>Phone: (+45) 50158067</p>
                    <p>LinkedIn: <a href="https://www.linkedin.com/in/eduard-munteanu-4a64b3265/" target="_blank" rel="noopener">linkedin.com/in/eduard-munteanu</a></p>
                </div>
            </section>
        </main>
    `);
}

function buildProjectsPage(projects) {
    const personalProjects = projects.filter((project) => normalizeCategory(project.project_category) === "personal");
    const academicProjects = projects.filter((project) => normalizeCategory(project.project_category) === "academic");

    return wrapPage("Projects", `
        <header class="topbar">
            <a class="brand" href="./index.html">Eduard Munteanu</a>
            <nav class="nav">
                <a href="./index.html">Home</a>
                <a href="./projects.html" aria-current="page">Projects</a>
            </nav>
        </header>

        <main class="page">
            <section class="page-intro card">
                <p class="eyebrow">Projects</p>
                <h1>Project showcase</h1>
                <p class="lead">Browse the snapshot of academic and personal work below. Each project opens into its own dedicated page with media, description, and supporting material.</p>
            </section>

            <section class="card">
                <div class="category-switcher" role="tablist" aria-label="Project category switcher">
                    <button class="tab-button is-active" data-category="academic" type="button">Academic Projects</button>
                    <button class="tab-button" data-category="personal" type="button">Personal Projects</button>
                </div>

                <div class="project-group is-active" data-category-panel="academic">
                    <div class="project-grid">
                        ${academicProjects.map((project) => buildProjectCard(project)).join("")}
                    </div>
                </div>

                <div class="project-group" data-category-panel="personal">
                    <div class="project-grid">
                        ${personalProjects.length ? personalProjects.map((project) => buildProjectCard(project)).join("") : `<p class="empty-state">No personal projects are included in this snapshot yet.</p>`}
                    </div>
                </div>
            </section>
        </main>

        <script>
            const buttons = document.querySelectorAll('[data-category]');
            const panels = document.querySelectorAll('[data-category-panel]');

            buttons.forEach((button) => {
                button.addEventListener('click', () => {
                    const selectedCategory = button.dataset.category;
                    buttons.forEach((currentButton) => {
                        currentButton.classList.toggle('is-active', currentButton === button);
                    });
                    panels.forEach((panel) => {
                        panel.classList.toggle('is-active', panel.dataset.categoryPanel === selectedCategory);
                    });
                });
            });
        </script>
    `);
}

function buildProjectCard(project) {
    const imageMarkup = project.image_url
        ? `<img class="project-card-image" src="./assets/uploads/${encodeURIComponent(project.image_url)}" alt="${escapeHtml(project.project_name)} cover image">`
        : `<div class="project-card-image placeholder">Project cover image</div>`;

    return `
        <article class="project-card">
            ${imageMarkup}
            <div class="project-card-body">
                <p class="category-pill">${escapeHtml(formatProjectCategory(project.project_category))}</p>
                <h2>${escapeHtml(project.project_name || "Untitled Project")}</h2>
                <p class="summary">${escapeHtml(project.project_summary || "No summary available.")}</p>
                <a class="button primary" href="./project/${project.id}.html">View Project</a>
            </div>
        </article>
    `;
}

function buildProjectPage(project) {
    const imageMarkup = project.image_url
        ? `<img class="detail-image" src="../assets/uploads/${encodeURIComponent(project.image_url)}" alt="${escapeHtml(project.project_name)} cover image">`
        : `<div class="detail-image placeholder">Project cover image</div>`;

    const videoMarkup = "";

    const documentMarkup = project.pdf_url
        ? `
            <div class="actions">
                <a class="button" href="../assets/uploads/${encodeURIComponent(project.pdf_url)}" target="_blank" rel="noopener">Open Project Document</a>
                <a class="button" href="../assets/uploads/${encodeURIComponent(project.pdf_url)}" download>Download PDF</a>
            </div>
        `
        : "";

    const videoDownloadMarkup = "";

    const githubMarkup = project.github_link?.trim()
        ? `<a class="button" href="${escapeAttribute(project.github_link)}" target="_blank" rel="noopener">GitHub Repository</a>`
        : "";

    return wrapPage(project.project_name || "Project", `
        <header class="topbar">
            <a class="brand" href="../index.html">Eduard Munteanu</a>
            <nav class="nav">
                <a href="../index.html">Home</a>
                <a href="../projects.html">Projects</a>
            </nav>
        </header>

        <main class="page detail-page">
            <section class="card detail-hero">
                <div class="detail-copy">
                    <p class="category-pill">${escapeHtml(formatProjectCategory(project.project_category))}</p>
                    <h1>${escapeHtml(project.project_name || "Untitled Project")}</h1>
                    <p class="lead">${escapeHtml(project.project_summary || "No summary available.")}</p>
                    <div class="actions">
                        <a class="button" href="../projects.html">Back to Projects</a>
                        ${githubMarkup}
                    </div>
                </div>
                <div class="detail-media">
                    ${imageMarkup}
                </div>
            </section>

            ${videoMarkup}

            <section class="card">
                <h2>Project Specifications</h2>
                <div class="spec-grid">
                    ${buildSpecSection("Context", project.project_context)}
                    ${buildSpecSection("Role", project.project_role)}
                    ${buildSpecSection("Goal", project.project_goal)}
                    ${buildSpecSection("Languages", project.project_languages)}
                    ${buildSpecSection("Technologies", project.project_technologies)}
                    ${buildSpecSection("Key learnings", project.project_takeaways)}
                </div>
            </section>

            <section class="card">
                <h2>Project Description</h2>
                ${buildParagraphMarkup(project.description)}
                ${documentMarkup}
            </section>

            ${project.pdf_url ? `
                <section class="card">
                    <h2>Project Files</h2>
                    <div class="actions">
                        ${videoDownloadMarkup}
                        <a class="button" href="../assets/uploads/${encodeURIComponent(project.pdf_url)}" download>Download PDF</a>
                    </div>
                </section>
            ` : ""}
        </main>
    `);
}

function buildSpecSection(label, value) {
    const items = splitLines(value);
    if (!items.length) return "";

    return `
        <section class="spec-block">
            <h3>${escapeHtml(label)}</h3>
            <ul>
                ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
        </section>
    `;
}

function buildParagraphMarkup(value) {
    const paragraphs = String(value || "")
        .replace(/\r/g, "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.replace(/\n+/g, " ").trim())
        .filter(Boolean);

    if (!paragraphs.length) {
        return `<p>No project description available.</p>`;
    }

    return paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("");
}

function splitLines(value) {
    return String(value || "")
        .replace(/\r/g, "")
        .split("\n")
        .map((item) => item.replace(/^\s*-\s*/, "").trim())
        .filter(Boolean);
}

function normalizeCategory(category) {
    return category === "academic" ? "academic" : "personal";
}

function formatProjectCategory(category) {
    return normalizeCategory(category) === "academic" ? "Academic Project" : "Personal Project";
}

function wrapPage(title, bodyMarkup) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} | Eduard Munteanu</title>
    <link rel="stylesheet" href="${title === "Home" || title === "Projects" ? "./styles/site.css" : "../styles/site.css"}">
</head>
<body>
    ${bodyMarkup}
</body>
</html>`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

function buildStyles() {
    return `
:root {
    --bg: #f3f6fb;
    --surface: #ffffff;
    --surface-soft: #f7fafc;
    --line: #d8e0ea;
    --text: #1f2937;
    --muted: #5f6b7a;
    --accent: #244c66;
    --accent-soft: rgba(36, 76, 102, 0.08);
    --shadow: 0 12px 30px rgba(31, 41, 55, 0.08);
    --radius: 18px;
    --radius-sm: 14px;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    color: var(--text);
    background:
        radial-gradient(circle at top left, rgba(36, 76, 102, 0.08), transparent 24%),
        radial-gradient(circle at top right, rgba(36, 76, 102, 0.04), transparent 18%),
        var(--bg);
    font: 16px/1.6 "Segoe UI", "Inter", Arial, sans-serif;
}

a {
    color: var(--accent);
}

.topbar,
.page {
    width: min(1160px, calc(100% - 40px));
    margin-inline: auto;
}

.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
}

.brand {
    color: var(--accent);
    font-size: 1.1rem;
    font-weight: 700;
    text-decoration: none;
}

.nav {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
}

.nav a {
    text-decoration: none;
    color: var(--muted);
    font-weight: 600;
}

.nav a[aria-current="page"] {
    color: var(--accent);
}

.page {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-block: 18px 24px;
}

.card {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow);
    padding: 22px;
}

.hero h1,
.page-intro h1,
.detail-hero h1 {
    margin: 0 0 0.8rem 0;
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: var(--accent);
}

.eyebrow,
.category-pill {
    width: fit-content;
    margin: 0 0 0.85rem 0;
    padding: 0.28rem 0.75rem;
    border-radius: 999px;
    border: 1px solid rgba(36, 76, 102, 0.18);
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 600;
}

.lead {
    margin: 0;
    color: var(--muted);
    font-size: 1.05rem;
}

.actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0.65rem 1rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: linear-gradient(180deg, #ffffff, #eef3f8);
    color: var(--text);
    text-decoration: none;
    font-weight: 600;
}

.button.primary {
    background: linear-gradient(180deg, #2c6488, #244c66);
    border-color: #244c66;
    color: #fff;
}

.info-grid,
.detail-hero {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
}

.category-switcher {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
}

.tab-button {
    min-height: 44px;
    padding: 0.7rem 1.1rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface-soft);
    color: var(--muted);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
}

.tab-button.is-active {
    background: linear-gradient(180deg, #2c6488, #244c66);
    border-color: #244c66;
    color: #fff;
}

.project-group {
    display: none;
}

.project-group.is-active {
    display: block;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
}

.project-card {
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    background: var(--surface-soft);
}

.project-card-image {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    background: #e9eef5;
}

.project-card-image.placeholder,
.detail-image.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
}

.project-card-body {
    padding: 18px;
}

.project-card h2,
.card h2,
.card h3 {
    margin-top: 0;
}

.project-card .summary {
    color: var(--muted);
}

.detail-image {
    display: block;
    width: 100%;
    max-height: 420px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
    object-fit: contain;
    background: #fff;
}

.detail-video {
    width: min(100%, 760px);
    display: block;
    margin: 0 auto;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
    background: #111827;
}

.spec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 16px;
}

.spec-block {
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    padding: 16px;
    background: var(--surface-soft);
}

.spec-block ul {
    margin: 0;
    padding-left: 18px;
}

.empty-state {
    margin: 0;
    color: var(--muted);
}

@media (max-width: 820px) {
    .topbar,
    .page {
        width: min(100%, calc(100% - 20px));
    }

    .info-grid,
    .detail-hero {
        grid-template-columns: 1fr;
    }

    .card {
        padding: 18px;
    }
}
`;
}
