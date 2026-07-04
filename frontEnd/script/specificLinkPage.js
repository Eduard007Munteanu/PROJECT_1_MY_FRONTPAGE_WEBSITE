import { getSpecificVideoFromLink, 
        getShowPDFPath, getDownloadPDF, getVideoPath, getSpecificLink, getImagePath
 } from "../API/linkAPI.js";



async function fullProjectLoad(){
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const projectData = await getSpecificLink(projectId);

    document.title = `${projectData.project_name} | Projects`;
    const overviewContainer = document.querySelector(".specific-project-overview");
    const detailsContainer = document.querySelector(".specific-project-details-panel");
    const showcaseInfoContainer = document.querySelector(".vertical-specific-link-showcase-info");
    const downloadContainer = document.querySelector(".vertical-specific-link-download-box");

    renderProjectOverview(projectData, overviewContainer);
    renderProjectDetails(projectData, detailsContainer);

    showVideo(projectId, showcaseInfoContainer);
    showPDF(projectId, showcaseInfoContainer);
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
    summary.textContent = projectData.project_summary?.trim() || projectData.description?.trim() || "No summary added yet.";

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

function renderProjectDetails(projectData, container){
    if (!container) return;

    container.innerHTML = "";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Project Details";

    const details = document.createElement("p");
    details.className = "specific-project-description";
    details.textContent = projectData.description?.trim() || projectData.project_summary?.trim() || "No detailed description added yet.";

    container.append(
        sectionTitle,
        details
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



function downloadContentButton(fetchFunction, container, buttonText, extension){
    const downloadButton = document.createElement("button");
    downloadButton.textContent = buttonText;
    downloadButton.addEventListener("click", async () => {
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


function showPDF(projectId, container){
    const pdfContainer = document.createElement("div");
    pdfContainer.id = "pdfContainer-Id-" + projectId;
    pdfContainer.classList.add("pdf-container");

    const pdfIframe = document.createElement("iframe");
    pdfIframe.src = getShowPDFPath(projectId);
    pdfIframe.classList.add("specific-media-preview");

    pdfContainer.appendChild(pdfIframe);
    container.appendChild(pdfContainer);
}



fullProjectLoad();
