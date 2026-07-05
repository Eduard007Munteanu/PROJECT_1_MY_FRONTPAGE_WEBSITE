import {
    getAllLinks,
    deleteAllLinks,
    getImagePath,
    deleteLink,
    createLink,
    editTextData,
    editBigData
} from "../API/linkAPI.js";
import { isAdmin } from "./siteState.js";

const personalCategory = "personal";
const academicCategory = "academic";
let currentProjectCategory = personalCategory;
let projectCache = [];
let pendingDeleteProject = null;
let activeCardEditorProjectId = null;

export function insertLinkContent() {
    if (!isAdmin()) return;

    const insertLinkButton = document.querySelector(".insert-link-button");
    if (!insertLinkButton) return;

    insertLinkButton.addEventListener("click", async () => {
        await createDraftProject();
    });
}

export function deleteAllInteractorButton() {
    if (!isAdmin()) return;

    const allDeletebutton = document.querySelector(".remove-all-button");
    if (!allDeletebutton) return;

    allDeletebutton.addEventListener("click", async () => {
        await deleteAllLinks();
        projectCache = [];
        renderCurrentCategory();
    });
}

export async function RenderDataOnPage() {
    projectCache = await getAllLinks();
    renderCurrentCategory();
}

export function initProjectCategorySwitcher() {
    const buttons = document.querySelectorAll(".projects-category-button");
    const title = document.querySelector(".projects-view-title");

    if (!buttons.length || !title) return;

    const renderSelection = () => {
        buttons.forEach((button) => {
            const active = button.dataset.category === currentProjectCategory;
            button.classList.toggle("is-active", active);
        });

        title.textContent = currentProjectCategory === academicCategory
            ? "Academic Projects"
            : "Personal Projects";

        renderCurrentCategory();
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            currentProjectCategory = normalizeCategory(button.dataset.category);
            renderSelection();
        });
    });

    renderSelection();
}

export function applyProjectAccess() {
    const adminOnly = document.querySelector(".admin-only");
    if (adminOnly) {
        adminOnly.hidden = !isAdmin();
    }

    const deleteOverlay = document.querySelector(".overlay-delete-project");
    if (deleteOverlay) {
        deleteOverlay.hidden = !isAdmin();
    }
}

export function deleterInteractorButton() {
    if (!isAdmin()) return;

    const parent = document.querySelector(".list-links");
    const confirmDeleteButton = document.querySelector(".confirm-delete-project-button");
    const cancelDeleteButton = document.querySelector(".cancel-delete-project-button");
    const closeDeleteButton = document.querySelector(".close-delete-project-button");

    if (parent) {
        parent.addEventListener("click", (event) => {
            const deleteButton = event.target.closest(".project-card-delete-button");
            if (!deleteButton) return;

            const projectId = deleteButton.dataset.projectId;
            const projectData = projectCache.find((project) => String(project.id) === String(projectId));
            if (!projectData) return;

            openDeleteProjectOverlay(projectData);
        });
    }

    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener("click", async () => {
            if (!pendingDeleteProject) return;

            await deleteLink(pendingDeleteProject.id);
            projectCache = projectCache.filter((project) => String(project.id) !== String(pendingDeleteProject.id));
            closeDeleteProjectOverlay();
            renderCurrentCategory();
        });
    }

    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener("click", closeDeleteProjectOverlay);
    }

    if (closeDeleteButton) {
        closeDeleteButton.addEventListener("click", closeDeleteProjectOverlay);
    }
}

async function createDraftProject() {
    const formData = new FormData();
    formData.append("project_category", currentProjectCategory);
    formData.append("project_name", "Untitled Project");
    formData.append("project_summary", "");
    formData.append("description", "");
    formData.append("github_link", "");
    formData.append("project_context", "");
    formData.append("project_role", "");
    formData.append("project_goal", "");
    formData.append("project_languages", "");
    formData.append("project_technologies", "");
    formData.append("project_takeaways", "");

    const createdProject = await createLink(formData);
    window.location.href = `/html/specificLink.html?id=${createdProject.id}&edit=1`;
}

function normalizeCategory(category) {
    return category === academicCategory ? academicCategory : personalCategory;
}

function renderCurrentCategory() {
    const listLink = document.querySelector(".list-links");
    if (!listLink) return;

    listLink.innerHTML = "";

    projectCache
        .filter((projectData) => normalizeCategory(projectData.project_category) === currentProjectCategory)
        .sort((leftProject, rightProject) => {
            const leftCreated = new Date(leftProject.created_at ?? 0).getTime();
            const rightCreated = new Date(rightProject.created_at ?? 0).getTime();

            if (leftCreated !== rightCreated) {
                return leftCreated - rightCreated;
            }

            return Number(leftProject.id) - Number(rightProject.id);
        })
        .forEach((projectData) => {
            listLink.appendChild(createProjectListItem(projectData));
        });
}

function createProjectListItem(projectData) {
    const li = createElement("li", "Link-element");
    li.id = projectData.id;
    li.dataset.category = normalizeCategory(projectData.project_category);

    if (isAdmin()) {
        const deleteButton = createElement("button", "project-card-delete-button", "X");
        deleteButton.dataset.projectId = projectData.id;
        li.appendChild(deleteButton);
    }

    const card = createElement("div", "div-link-element");
    const content = createElement("div", "div-link-element-content");

    content.append(
        createProjectCardMain(projectData),
        createViewButton(projectData)
    );

    card.appendChild(content);
    li.appendChild(card);
    return li;
}

function createProjectCardMain(projectData) {
    const projectMainContent = createElement("div", "project-card-main");
    const projectInfoContent = activeCardEditorProjectId === projectData.id && isAdmin()
        ? createProjectCardEditor(projectData)
        : createProjectCardInfo(projectData);

    projectMainContent.append(
        projectInfoContent,
        createProjectPreview(projectData)
    );

    return projectMainContent;
}

function createProjectCardInfo(projectData) {
    const projectInfoContent = createElement("div", "div-link-element-info-content");
    const categoryBadge = createElement("p", "project-category-badge", formatProjectCategory(projectData.project_category));
    const projectSummaryLabel = createElement("p", "project-description-label", "Summary");
    const projectSummaryBox = createElement("div", "project-description-box");
    const projectSummaryText = createElement("p", "Description", getProjectSummary(projectData));

    projectSummaryBox.append(projectSummaryText);
    projectInfoContent.append(
        categoryBadge,
        createElement("p", "Project_name", projectData.project_name),
        projectSummaryLabel,
        projectSummaryBox
    );

    if (isAdmin()) {
        projectInfoContent.append(createElement("p", "project-card-admin-hint", "Double-click to edit this overview."));
        projectInfoContent.addEventListener("dblclick", () => {
            activeCardEditorProjectId = projectData.id;
            renderCurrentCategory();
        });
    }

    return projectInfoContent;
}

function createProjectCardEditor(projectData) {
    const editor = createElement("div", "project-card-inline-editor");
    const nameField = createInlineEditorField("Project name", "input", projectData.project_name ?? "");
    const summaryField = createInlineEditorField("Summary", "textarea", normalizeProjectText(projectData.project_summary ?? ""), 6);
    const githubField = createInlineEditorField("GitHub URL", "input", projectData.github_link ?? "");
    const actions = createElement("div", "project-card-inline-actions");
    const saveButton = createElement("button", "", "Save");
    const cancelButton = createElement("button", "", "Cancel");

    saveButton.addEventListener("click", async () => {
        const updatedProject = await saveProjectOverviewEdits(projectData, {
            project_name: nameField.input.value.trim() || "Untitled Project",
            project_summary: summaryField.input.value.trim(),
            github_link: githubField.input.value.trim()
        });
        activeCardEditorProjectId = null;
        updateProjectCache(updatedProject);
        renderCurrentCategory();
    });

    cancelButton.addEventListener("click", () => {
        activeCardEditorProjectId = null;
        renderCurrentCategory();
    });

    actions.append(saveButton, cancelButton);
    editor.append(nameField.wrapper, summaryField.wrapper, githubField.wrapper, actions);
    return editor;
}

function createViewButton(projectData) {
    const previewButton = createElement("button", "view-project-button", "View Project");
    previewButton.addEventListener("click", () => {
        window.location.href = `/html/specificLink.html?id=${projectData.id}`;
    });
    return previewButton;
}

function createProjectPreview(projectData) {
    const previewColumn = createElement("div", "project-card-preview-column");

    if (projectData.image_url) {
        const previewImage = document.createElement("img");
        previewImage.className = "project-preview-image";
        previewImage.src = getImagePath(projectData.id);
        previewImage.alt = `${projectData.project_name} cover image`;
        previewImage.loading = "lazy";
        previewColumn.appendChild(previewImage);
    } else {
        const previewContainer = createElement("div", "project-preview-placeholder");
        const previewBadge = createElement("span", "project-preview-badge", "Preview Image");
        const previewCaption = createElement("p", "project-preview-caption", "Image placeholder");

        previewContainer.append(
            previewBadge,
            previewCaption
        );

        previewColumn.appendChild(previewContainer);
    }

    if (isAdmin() && activeCardEditorProjectId === projectData.id) {
        previewColumn.appendChild(createProjectCardUploadControl(projectData, "image_folder", projectData.image_url ? "Replace image" : "Add image", ".png,.jpg,.jpeg,.webp"));
    }

    return previewColumn;
}

function openDeleteProjectOverlay(projectData) {
    pendingDeleteProject = projectData;

    const overlay = document.querySelector(".overlay-delete-project");
    const message = document.querySelector(".delete-project-message");
    if (!overlay || !message) return;

    message.textContent = `This will remove the whole project: ${projectData.project_name}`;
    overlay.style.display = "flex";
}

function closeDeleteProjectOverlay() {
    pendingDeleteProject = null;

    const overlay = document.querySelector(".overlay-delete-project");
    if (!overlay) return;

    overlay.style.display = "none";
}

function getProjectSummary(projectData) {
    return normalizeProjectText(projectData.project_summary?.trim() || projectData.description?.trim() || "No summary added yet.");
}

async function saveProjectOverviewEdits(projectData, overrides) {
    const formData = buildProjectTextFormData(projectData, overrides);
    return await editTextData(formData, projectData.id);
}

function buildProjectTextFormData(projectData, overrides = {}) {
    const mergedData = {
        project_name: projectData.project_name ?? "",
        project_summary: projectData.project_summary ?? "",
        description: projectData.description ?? "",
        github_link: projectData.github_link ?? "",
        project_context: projectData.project_context ?? "",
        project_role: projectData.project_role ?? "",
        project_goal: projectData.project_goal ?? "",
        project_languages: projectData.project_languages ?? "",
        project_technologies: projectData.project_technologies ?? "",
        project_takeaways: projectData.project_takeaways ?? "",
        project_category: projectData.project_category ?? "personal",
        ...overrides
    };

    const formData = new FormData();
    Object.entries(mergedData).forEach(([key, value]) => {
        formData.append(key, value ?? "");
    });
    return formData;
}

function createInlineEditorField(label, type, value, rows = 4) {
    const wrapper = document.createElement("label");
    const labelText = document.createElement("span");
    labelText.textContent = label;
    const input = type === "textarea" ? document.createElement("textarea") : document.createElement("input");

    if (type === "textarea") {
        input.rows = rows;
    } else {
        input.type = "text";
    }

    input.value = value ?? "";
    wrapper.append(labelText, input);
    return { wrapper, input };
}

function createProjectCardUploadControl(projectData, fieldName, label, accept) {
    const wrapper = createElement("div", "admin-upload-control");
    const button = createElement("button", "", label);
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
        const updatedProject = await editBigData(formData, projectData.id);
        updateProjectCache(updatedProject);
        renderCurrentCategory();
    });

    wrapper.append(button, input);
    return wrapper;
}

function updateProjectCache(updatedProject) {
    projectCache = projectCache.map((project) =>
        String(project.id) === String(updatedProject.id) ? updatedProject : project
    );
}

function formatProjectCategory(category) {
    return normalizeCategory(category) === academicCategory ? "Academic Project" : "Personal Project";
}

function normalizeProjectText(value) {
    if (!value) return "";
    return value
        .replace(/%0D/gi, "\r")
        .replace(/%0A/gi, "\n");
}

function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}
