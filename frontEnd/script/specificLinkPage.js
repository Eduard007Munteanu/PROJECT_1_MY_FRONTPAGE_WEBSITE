import { getSpecificVideoFromLink, 
        getShowPDFPath, getDownloadPDF, getVideoPath, getSpecificLink, getImagePath
 } from "../API/linkAPI.js";



async function fullProjectLoad(){
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const projectData = await getSpecificLink(projectId);

    document.title = `${projectData.project_name} | Projects`;
    const overviewContainer = document.querySelector(".specific-project-overview");
    const specificationsContainer = document.querySelector(".specific-project-specifications");
    const descriptionContainer = document.querySelector(".specific-project-description-panel");
    const showcaseInfoContainer = document.querySelector(".vertical-specific-link-showcase-info");
    const downloadContainer = document.querySelector(".vertical-specific-link-download-box");

    renderProjectOverview(projectData, overviewContainer);
    renderProjectSpecifications(projectData, specificationsContainer);
    renderProjectDescription(projectData, descriptionContainer, projectId);

    showVideo(projectId, showcaseInfoContainer);
    downloadContentButton(() => getSpecificVideoFromLink(projectId), downloadContainer, "Download Video", ".mp4");
    downloadContentButton(() => getDownloadPDF(projectId), downloadContainer, "Download PDF", ".pdf");
}

function renderProjectOverview(projectData, container){
    if (!container) return;

    container.innerHTML = "";

    const textColumn = document.createElement("div");
    textColumn.className = "specific-project-text";

    const categoryBadge = document.createElement("p");
    categoryBadge.className = "specific-project-category";
    categoryBadge.textContent = normalizeProjectCategory(projectData.project_category);

    const title = document.createElement("h1");
    title.textContent = projectData.project_name;

    const summary = document.createElement("p");
    summary.className = "specific-project-summary";
    summary.textContent = normalizeProjectText(projectData.project_summary?.trim() || projectData.description?.trim() || "No summary added yet.");

    textColumn.append(
        categoryBadge,
        title,
        summary
    );

    if (projectData.github_link?.trim()) {
        const githubLink = document.createElement("a");
        githubLink.className = "specific-project-github";
        githubLink.href = projectData.github_link;
        githubLink.target = "_blank";
        githubLink.rel = "noopener noreferrer";
        githubLink.textContent = "GitHub Repository";
        textColumn.append(githubLink);
    }

    container.append(
        textColumn,
        createProjectImagePreview(projectData)
    );
}

function renderProjectSpecifications(projectData, container){
    if (!container) return;

    container.innerHTML = "";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Project Specifications";

    const specificationList = document.createElement("div");
    specificationList.className = "specific-project-specification-list";

    const legacySplit = splitLegacyTechnologies(projectData.project_technologies);
    const specificationRows = [
        ["Project type", [normalizeProjectCategory(projectData.project_category)]],
        ["Context", extractSpecificationItems(projectData.project_context)],
        ["Role", extractSpecificationItems(projectData.project_role)],
        ["Goal", extractSpecificationItems(projectData.project_goal)],
        ["Languages", extractSpecificationItems(projectData.project_languages || legacySplit.languages)],
        ["Technologies", extractSpecificationItems(legacySplit.technologies)],
        ["Key learnings", extractSpecificationItems(projectData.project_takeaways)]
    ].filter(([, values]) => values.length);

    if (!specificationRows.length) {
        const emptyState = document.createElement("p");
        emptyState.textContent = "No project specifications added yet.";
        container.append(sectionTitle, emptyState);
        return;
    }

    specificationRows.forEach(([label, values]) => {
        const section = document.createElement("div");
        section.className = "specific-project-specification-section";

        const rowLabel = document.createElement("p");
        rowLabel.className = "specific-project-specification-title";
        rowLabel.textContent = label;

        const list = document.createElement("ul");
        list.className = "specific-project-specification-items";

        values.forEach((value) => {
            const item = document.createElement("li");
            item.textContent = value;
            list.appendChild(item);
        });

        section.append(rowLabel, list);
        specificationList.appendChild(section);
    });

    container.append(sectionTitle, specificationList);
}

function renderProjectDescription(projectData, container, projectId){
    if (!container) return;

    container.innerHTML = "";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Project Description";

    const details = document.createElement("p");
    details.className = "specific-project-description";
    details.textContent = normalizeProjectText(projectData.description?.trim() || projectData.project_summary?.trim() || "No project description added yet.");

    const openDocumentButton = document.createElement("button");
    openDocumentButton.className = "specific-project-open-document";
    openDocumentButton.textContent = "Open Project Document";
    openDocumentButton.addEventListener("click", () => {
        window.open(getShowPDFPath(projectId), "_blank", "noopener,noreferrer");
    });

    container.append(
        sectionTitle,
        details,
        openDocumentButton
    );
}

function createProjectImagePreview(projectData){
    if (projectData.image_url) {
        const image = document.createElement("img");
        image.className = "specific-project-cover";
        image.src = getImagePath(projectData.id);
        image.alt = `${projectData.project_name} cover image`;
        return image;
    }

    const placeholder = document.createElement("div");
    placeholder.className = "specific-project-cover placeholder";
    placeholder.textContent = "Project cover image";
    return placeholder;
}

function normalizeProjectCategory(category){
    return category === "academic" ? "Academic Project" : "Personal Project";
}

function normalizeProjectText(value){
    if (!value) return "";
    return value
        .replace(/%0D/gi, "\r")
        .replace(/%0A/gi, "\n");
}

function extractSpecificationItems(value){
    const normalized = normalizeProjectText(value).trim();
    if (!normalized) return [];

    return normalized
        .split(/\r?\n|,/)
        .map((item) => item.replace(/^[\s\-*•]+/, "").trim())
        .filter(Boolean);
}

function splitLegacyTechnologies(value){
    const normalized = normalizeProjectText(value).trim();
    if (!normalized) {
        return {
            languages: "",
            technologies: ""
        };
    }

    const languagesMatch = normalized.match(/languages?\s*:\s*([^\n]+)/i);
    const technologiesMatch = normalized.match(/technologies?\s*:\s*([\s\S]+)/i);

    if (languagesMatch || technologiesMatch) {
        return {
            languages: languagesMatch ? languagesMatch[1].trim() : "",
            technologies: technologiesMatch ? technologiesMatch[1].trim() : normalized
        };
    }

    const items = extractSpecificationItems(normalized);
    const knownLanguages = new Set([
        "javascript",
        "typescript",
        "python",
        "java",
        "c#",
        "c++",
        "c",
        "scala",
        "go",
        "rust",
        "kotlin",
        "swift",
        "php",
        "ruby"
    ]);

    const languages = [];
    const technologies = [];

    items.forEach((item) => {
        if (knownLanguages.has(item.toLowerCase())) {
            languages.push(item);
            return;
        }
        technologies.push(item);
    });

    return {
        languages: languages.join("\n"),
        technologies: technologies.join("\n")
    };
}



function downloadContentButton(fetchFunction, container, buttonText, extension, openInNewTab = false){
    const downloadButton = document.createElement("button");
    downloadButton.textContent = buttonText;
    downloadButton.addEventListener("click", async () => {
        if (openInNewTab) {
            window.open(fetchFunction(), "_blank", "noopener,noreferrer");
            return;
        }

        const contentBlob = await fetchFunction();
        const url = URL.createObjectURL(contentBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = buttonText + extension;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    container.appendChild(downloadButton);
}


function showVideo(projectId, container){
    const videoContainer  =  document.createElement("div");
    videoContainer.id = "videoContainer-Id-" + projectId;
    videoContainer.classList.add("video-container");

    const videoElement = document.createElement("video");
    videoElement.src = getVideoPath(projectId);
    videoElement.controls = true;
    videoElement.classList.add("specific-media-preview");

    videoContainer.appendChild(videoElement);
    container.appendChild(videoContainer);
}



fullProjectLoad();
