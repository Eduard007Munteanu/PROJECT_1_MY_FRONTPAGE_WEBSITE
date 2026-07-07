import {
    getSpecificVideoFromLink,
    getShowPDFPath,
    getDownloadPDF,
    getVideoPath,
    getSpecificLink,
    getImagePath,
    editBigData,
    editTextData
} from "../API/linkAPI.js";
import { isAdmin } from "./siteState.js";

let currentProjectData = null;
let currentProjectId = null;
let activeEditorSection = null;

async function fullProjectLoad() {
    const params = new URLSearchParams(window.location.search);
    currentProjectId = params.get("id");
    currentProjectData = await getSpecificLink(currentProjectId);

    if (isAdmin() && params.get("edit") === "1") {
        activeEditorSection = "overview";
    }

    renderProjectPage();
}

function renderProjectPage() {
    if (!currentProjectData) return;

    document.title = `${currentProjectData.project_name} | Projects`;

    const overviewContainer = document.querySelector(".specific-project-overview");
    const specificationsContainer = document.querySelector(".specific-project-specifications");
    const descriptionContainer = document.querySelector(".specific-project-description-panel");
    const showcaseInfoContainer = document.querySelector(".vertical-specific-link-showcase-info");
    const downloadContainer = document.querySelector(".vertical-specific-link-download-box");
    const headerContainer = document.querySelector(".header-box");

    renderBackButton(headerContainer);
    renderProjectOverview(currentProjectData, overviewContainer);
    renderProjectDemo(currentProjectData, showcaseInfoContainer);
    renderProjectSpecifications(currentProjectData, specificationsContainer);
    renderProjectDescription(currentProjectData, descriptionContainer);
    renderProjectFiles(currentProjectData, downloadContainer);
}

function renderBackButton(container) {
    if (!container) return;

    container.innerHTML = "";

    const title = document.createElement("p");
    title.className = "main-box-text";
    title.textContent = "Projects";

    const backButton = document.createElement("button");
    backButton.className = "specific-project-back-button";
    backButton.type = "button";
    backButton.textContent = "Back to Projects";
    backButton.addEventListener("click", () => {
        window.location.href = "/html/link.html";
    });

    container.append(title, backButton);
}

function renderProjectOverview(projectData, container) {
    if (!container) return;

    container.innerHTML = "";

    if (activeEditorSection === "overview" && isAdmin()) {
        renderOverviewEditor(projectData, container);
        return;
    }

    const textColumn = document.createElement("div");
    textColumn.className = "specific-project-text";

    const categoryBadge = document.createElement("p");
    categoryBadge.className = "specific-project-category";
    categoryBadge.textContent = normalizeProjectCategory(projectData.project_category);

    const title = document.createElement("h1");
    title.textContent = projectData.project_name?.trim() || "Untitled Project";

    const summary = document.createElement("p");
    summary.className = "specific-project-summary";
    summary.textContent = getDisplayText(
        projectData.project_summary,
        "No summary added yet.",
        "Double-click to add a project summary."
    );

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
    } else if (isAdmin()) {
        textColumn.append(createHintText("Double-click to add a GitHub link."));
    }

    if (isAdmin()) {
        textColumn.append(createHintText("Double-click this section to edit."));
        textColumn.addEventListener("dblclick", () => {
            activeEditorSection = "overview";
            renderProjectPage();
        });
    }

    container.append(
        textColumn,
        createProjectImagePreview(projectData)
    );
}

function renderOverviewEditor(projectData, container) {
    const form = document.createElement("form");
    form.className = "inline-editor-form";

    const titleField = createEditorField("Project name", "input", projectData.project_name);
    const summaryField = createEditorField("Project summary", "textarea", normalizeProjectText(projectData.project_summary ?? ""));
    const githubField = createEditorField("GitHub URL", "input", projectData.github_link ?? "");

    form.append(
        createEditorHeader("Edit Overview"),
        titleField.wrapper,
        summaryField.wrapper,
        githubField.wrapper,
        createEditorActions(
            async () => {
                await saveTextChanges({
                    project_name: titleField.input.value.trim() || "Untitled Project",
                    project_summary: summaryField.input.value.trim(),
                    github_link: githubField.input.value.trim()
                });
            },
            cancelActiveEditor
        )
    );

    const mediaColumn = createProjectImagePreview(projectData);
    container.append(form, mediaColumn);
}

function renderProjectDemo(projectData, container) {
    if (!container) return;

    container.innerHTML = "";

    if (projectData.video_url?.trim()) {
        const videoContainer = document.createElement("div");
        videoContainer.className = "video-container";

        const videoElement = document.createElement("video");
        videoElement.src = getVideoPath(projectData.id);
        videoElement.controls = true;
        videoElement.className = "specific-media-preview";

        videoContainer.appendChild(videoElement);
        container.appendChild(videoContainer);
    } else {
        container.appendChild(createMediaPlaceholder("No project video added yet.", "Add project video."));
    }

    if (isAdmin()) {
        container.append(
            createUploadControl(
                projectData.video_url?.trim() ? "Replace video" : "Add video",
                "video_folder",
                ".mp4"
            )
        );
    }
}

function renderProjectSpecifications(projectData, container) {
    if (!container) return;

    container.innerHTML = "";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Project Specifications";
    container.appendChild(sectionTitle);

    if (activeEditorSection === "specifications" && isAdmin()) {
        renderSpecificationsEditor(projectData, container);
        return;
    }

    const specificationList = document.createElement("div");
    specificationList.className = "specific-project-specification-list";

    const legacySplit = splitLegacyTechnologies(projectData.project_technologies);
    const specificationRows = [
        ["Project type", [normalizeProjectCategory(projectData.project_category)]],
        ["Context", extractSpecificationItemsByLine(projectData.project_context)],
        ["Role", extractSpecificationItemsByLine(projectData.project_role)],
        ["Goal", extractSpecificationItemsByLine(projectData.project_goal)],
        ["Languages", extractSpecificationItemsByLine(projectData.project_languages || legacySplit.languages)],
        ["Technologies", extractSpecificationItemsByLine(legacySplit.technologies)],
        ["Key learnings", extractSpecificationItemsByLine(projectData.project_takeaways)]
    ].filter(([, values]) => values.length);

    if (!specificationRows.length) {
        const emptyState = document.createElement("p");
        emptyState.textContent = isAdmin()
            ? "Double-click to add project specifications."
            : "No project specifications added yet.";
        specificationList.appendChild(emptyState);
    } else {
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
    }

    if (isAdmin()) {
        specificationList.appendChild(createHintText("Double-click this section to edit."));
        container.addEventListener("dblclick", () => {
            activeEditorSection = "specifications";
            renderProjectPage();
        }, { once: true });
    }

    container.appendChild(specificationList);
}

function renderSpecificationsEditor(projectData, container) {
    const form = document.createElement("form");
    form.className = "inline-editor-form";

    const contextField = createEditorField("Context", "input", projectData.project_context ?? "");
    const roleField = createEditorField("Role", "input", projectData.project_role ?? "");
    const goalField = createEditorField("Goal", "textarea", normalizeProjectText(projectData.project_goal ?? ""));
    const languagesField = createEditorField("Languages", "textarea", normalizeProjectText(projectData.project_languages ?? ""), 3);
    const technologiesField = createEditorField("Technologies", "textarea", normalizeProjectText(projectData.project_technologies ?? ""), 4);
    const takeawaysField = createEditorField("Key learnings", "textarea", normalizeProjectText(projectData.project_takeaways ?? ""), 4);

    form.append(
        contextField.wrapper,
        roleField.wrapper,
        goalField.wrapper,
        languagesField.wrapper,
        technologiesField.wrapper,
        takeawaysField.wrapper,
        createEditorActions(
            async () => {
                await saveTextChanges({
                    project_context: contextField.input.value.trim(),
                    project_role: roleField.input.value.trim(),
                    project_goal: goalField.input.value.trim(),
                    project_languages: languagesField.input.value.trim(),
                    project_technologies: technologiesField.input.value.trim(),
                    project_takeaways: takeawaysField.input.value.trim()
                });
            },
            cancelActiveEditor
        )
    );

    container.appendChild(form);
}

function renderProjectDescription(projectData, container) {
    if (!container) return;

    container.innerHTML = "";

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = "Project Description";
    container.appendChild(sectionTitle);

    if (activeEditorSection === "description" && isAdmin()) {
        renderDescriptionEditor(projectData, container);
        return;
    }

    const details = document.createElement("p");
    details.className = "specific-project-description";
    details.textContent = getDisplayText(
        projectData.description,
        "No project description added yet.",
        "Double-click to add a project description."
    );

    container.appendChild(details);

    if (projectData.pdf_url?.trim()) {
        const openDocumentButton = document.createElement("button");
        openDocumentButton.className = "specific-project-open-document";
        openDocumentButton.textContent = "Open Project Document";
        openDocumentButton.addEventListener("click", () => {
            window.open(getShowPDFPath(currentProjectId), "_blank", "noopener,noreferrer");
        });
        container.appendChild(openDocumentButton);
    } else if (isAdmin()) {
        container.appendChild(createHintText("Add a PDF in Project Files to open the project document here."));
    }

    if (isAdmin()) {
        container.appendChild(
            createUploadControl(
                projectData.pdf_url?.trim() ? "Replace Project Document" : "Add Project Document",
                "pdf_folder",
                ".pdf"
            )
        );
        container.appendChild(createHintText("Double-click this section to edit."));
        container.addEventListener("dblclick", () => {
            activeEditorSection = "description";
            renderProjectPage();
        }, { once: true });
    }
}

function renderDescriptionEditor(projectData, container) {
    const form = document.createElement("form");
    form.className = "inline-editor-form";

    const descriptionField = createEditorField("Detailed description", "textarea", normalizeProjectText(projectData.description ?? ""), 12);

    form.append(
        descriptionField.wrapper,
        createEditorActions(
            async () => {
                await saveTextChanges({
                    description: descriptionField.input.value.trim()
                });
            },
            cancelActiveEditor
        )
    );

    container.appendChild(form);
}

function renderProjectFiles(projectData, container) {
    if (!container) return;

    container.innerHTML = "";

    if (projectData.video_url?.trim()) {
        container.appendChild(createActionButton("Download Video", async () => {
            const contentBlob = await getSpecificVideoFromLink(currentProjectId);
            triggerBlobDownload(contentBlob, "project-video.mp4");
        }));
    }

    if (projectData.pdf_url?.trim()) {
        container.appendChild(createActionButton("Download PDF", async () => {
            const contentBlob = await getDownloadPDF(currentProjectId);
            triggerBlobDownload(contentBlob, "project-document.pdf");
        }));
    }

    if (!projectData.video_url?.trim() && !projectData.pdf_url?.trim()) {
        const emptyState = document.createElement("p");
        emptyState.textContent = isAdmin()
            ? "Add project files below."
            : "No project files added yet.";
        container.appendChild(emptyState);
    }

}

function createProjectImagePreview(projectData) {
    const wrapper = document.createElement("div");
    wrapper.className = "specific-project-media-column";

    if (projectData.image_url?.trim()) {
        const image = document.createElement("img");
        image.className = "specific-project-cover";
        image.src = getImagePath(projectData.id);
        image.alt = `${projectData.project_name} cover image`;
        wrapper.appendChild(image);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "specific-project-cover placeholder";
        placeholder.textContent = isAdmin()
            ? "Add a project cover image."
            : "Project cover image";
        wrapper.appendChild(placeholder);
    }

    if (isAdmin()) {
        wrapper.append(
            createUploadControl(
                projectData.image_url?.trim() ? "Replace image" : "Add image",
                "image_folder",
                ".png,.jpg,.jpeg,.webp"
            )
        );
    }

    return wrapper;
}

function createUploadControl(label, fieldName, accept) {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-upload-control";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.hidden = true;

    button.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append(fieldName, file);
        currentProjectData = await editBigData(formData, currentProjectId);
        renderProjectPage();
    });

    wrapper.append(button, input);
    return wrapper;
}

function createEditorField(label, type, value, rows = 4) {
    const wrapper = document.createElement("label");
    wrapper.className = "inline-editor-field";

    const text = document.createElement("span");
    text.textContent = label;

    const input = type === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input");

    if (type === "textarea") {
        input.rows = rows;
    } else {
        input.type = "text";
    }

    input.value = value ?? "";
    wrapper.append(text, input);

    return { wrapper, input };
}

function createEditorHeader(text) {
    const title = document.createElement("p");
    title.className = "inline-editor-title";
    title.textContent = text;
    return title;
}

function createEditorActions(onSave, onCancel) {
    const actions = document.createElement("div");
    actions.className = "inline-editor-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", onSave);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", onCancel);

    actions.append(saveButton, cancelButton);
    return actions;
}

function createActionButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function createHintText(text) {
    const hint = document.createElement("p");
    hint.className = "admin-section-hint";
    hint.textContent = text;
    return hint;
}

function createMediaPlaceholder(guestText, adminText) {
    const placeholder = document.createElement("div");
    placeholder.className = "specific-project-media-placeholder";
    placeholder.textContent = isAdmin() ? adminText : guestText;
    return placeholder;
}

function getDisplayText(value, guestFallback, adminFallback) {
    const normalized = normalizeProjectText(value).trim();
    if (normalized) return normalized;
    return isAdmin() ? adminFallback : guestFallback;
}

async function saveTextChanges(overrides) {
    const formData = buildTextFormData(overrides);
    currentProjectData = await editTextData(formData, currentProjectId);
    activeEditorSection = null;
    renderProjectPage();
}

function buildTextFormData(overrides = {}) {
    const mergedData = {
        project_name: currentProjectData.project_name ?? "",
        project_summary: currentProjectData.project_summary ?? "",
        description: currentProjectData.description ?? "",
        github_link: currentProjectData.github_link ?? "",
        project_context: currentProjectData.project_context ?? "",
        project_role: currentProjectData.project_role ?? "",
        project_goal: currentProjectData.project_goal ?? "",
        project_languages: currentProjectData.project_languages ?? "",
        project_technologies: currentProjectData.project_technologies ?? "",
        project_takeaways: currentProjectData.project_takeaways ?? "",
        project_category: currentProjectData.project_category ?? "personal",
        ...overrides
    };

    const formData = new FormData();
    Object.entries(mergedData).forEach(([key, value]) => {
        formData.append(key, value ?? "");
    });
    return formData;
}

function cancelActiveEditor() {
    activeEditorSection = null;
    renderProjectPage();
}

function normalizeProjectCategory(category) {
    return category === "academic" ? "Academic Project" : "Personal Project";
}

function normalizeProjectText(value) {
    if (!value) return "";
    return value
        .replace(/%0D/gi, "\r")
        .replace(/%0A/gi, "\n");
}

function extractSpecificationItemsByLine(value) {
    const normalized = normalizeProjectText(value).trim();
    if (!normalized) return [];

    return normalized
        .split(/\r?\n+/)
        .map((item) => item.replace(/^\s*-\s*/, "").trim())
        .filter(Boolean);
}

function extractSpecificationItems(value) {
    const normalized = normalizeProjectText(value).trim();
    if (!normalized) return [];

    return normalized
        .split(/\r?\n|,/)
        .map((item) => item.replace(/^[\s\-*•]+/, "").trim())
        .filter(Boolean);
}

function splitLegacyTechnologies(value) {
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

    const items = extractSpecificationItemsByLine(normalized);
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

function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

fullProjectLoad();
