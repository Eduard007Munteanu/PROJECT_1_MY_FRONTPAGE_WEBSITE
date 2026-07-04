// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks,  
    getSpecificVideoFromLink, deleteAllLinks,
     getVideoPath, getShowPDFPath, deleteLink, createLink, editBigData, 
    editTextData } from "../API/linkAPI.js";
import { isAdmin } from "./siteState.js";


const personalCategory = "personal";
const academicCategory = "academic";
let editPanelProjectID = null;
let editPanelProjectCategory = personalCategory;
const createButtonLabel = "Create";
const updateButtonLabel = "Update";
const feedbackDurationMs = 1000;
let currentProjectCategory = personalCategory;
let projectCache = [];
let popupMode = "create";

//import projectDatabase section















//(1) General interaction bar for all list content

export function insertLinkContent(){
    if (!isAdmin()) return;

    let insertLinkButton = document.querySelector(".insert-link-button");
    if (!insertLinkButton) return;

    insertLinkButton.addEventListener('click', () => {
        setPopupMode("create");
        togglePopUp();
    })
}


export function deleteAllInteractorButton(){
    if (!isAdmin()) return;

    let allDeletebutton = document.querySelector(".remove-all-button");
    if (!allDeletebutton) return;

    allDeletebutton.addEventListener("click", async () => {
        await fullProjectDeletor();
    })
}

async function fullProjectDeletor(){
    await deleteAllLinks();
    // projectDatabase.deleteAllElements(); API
    projectCache = [];
    renderCurrentCategory();
}

function flushVisualLinks(){
    const listlink = document.querySelector(".list-links");
    if (listlink) {
        listlink.innerHTML = "";
    }
}


//General interaction bar for all list content















//(2) Link edit/insertion toolbar settings

export async function projectFULLCreator(){
    if (!isAdmin()) {
        const overlay = document.querySelector(".overlay-insert-link");
        if (overlay) overlay.hidden = true;
        return;
    }

    let sendDataButton = document.querySelector(".send-project-data-button");
    let closeDataButton = document.querySelector(".close-project-data-button");
    if (!sendDataButton || !closeDataButton) return;


    closeDataButton.addEventListener("click", async () => {
        removePopUp();
    })



    sendDataButton.addEventListener("click", async () => {
        if (popupMode === "create"){
            await sendButtonFunction();
        } else if (popupMode === "edit"){
            await editButtonFunction();
        }
        
    })
}

async function sendButtonFunction() {
    const validation = getProjectData("create");
    if (!validation.valid) {
        showButtonFeedback("error", "Important field missing");
        flashInvalidFields(validation.invalidFields);
        return;
    }

    try {
        const formData = new FormData();
        formData.append("project_category", currentProjectCategory);
        for (const [key, value] of Object.entries(validation.data)) {
            // FormData handles both Strings and Files automatically!
            if (key === "github_link") {
                formData.append(key, value ?? "");
                continue;
            }
            if (value) formData.append(key, value);
        }

        const response = await createLink(formData);
        showButtonFeedback("success", "Project created!");
        window.setTimeout(() => {
            removePopUp();
            RenderDataOnPage();
        }, feedbackDurationMs);
    } catch (err) {
        console.error("Failed retrieval of data POST", err);
        showButtonFeedback("error", "Create failed");
    }
}

async function editButtonFunction() {
    const validation = getProjectData("edit");
    if (!validation.valid) {
        showButtonFeedback("error", "Important field missing");
        flashInvalidFields(validation.invalidFields);
        return;
    }

    try {
        const textData = new FormData();
        const bigData = new FormData();
        textData.append("project_category", editPanelProjectCategory);

        for (const [key, value] of Object.entries(validation.data)) {
            if (!value) continue;

            if (key === "pdf_folder" || key === "video_folder") {
                bigData.append(key, value);
            } else {
                textData.append(key, value);
            }
        }

        // Logic for sending split data
        if ([...bigData.keys()].length > 0) {
            await editBigData(bigData, editPanelProjectID);
        }
        if ([...textData.keys()].length > 0) {
            await editTextData(textData, editPanelProjectID);
        }
        
        showButtonFeedback("success", "Project updated!");
        removePopUp();
        window.setTimeout(() => {
            RenderDataOnPage();
        }, feedbackDurationMs);
    } catch (err) {
        console.error("Edit failed", err);
        showButtonFeedback("error", "Update failed");
    }
}


function getProjectData(mode) {
    const projectData = {};
    const invalidFields = [];
    const inputs = document.querySelectorAll(".project-data");
    const requiredFields = mode === "create"
        ? new Set(["project_name", "description", "pdf_folder", "video_folder"])
        : new Set(["project_name", "description"]);

    for (const input of inputs) {
        const key = input.name;

        if (input.type === "file") {
            const file = input.files.length > 0 ? input.files[0] : null;
            projectData[key] = file;
            if (requiredFields.has(key) && !file) {
                invalidFields.push(input.closest(".project-field"));
            }
        } else {
            const value = input.value.trim();
            projectData[key] = value;
            if (requiredFields.has(key) && !value) {
                invalidFields.push(input.closest(".project-field"));
            }
        }
    }

    if (mode === "create" && invalidFields.length > 0) {
        return { valid: false, data: projectData, invalidFields };
    }

    if (mode === "edit" && invalidFields.length > 0) {
        return { valid: false, data: projectData, invalidFields };
    }

    return { valid: true, data: projectData, invalidFields: [] };
}

//Link edit/insertion toolbar settings















//(3) Insert/Edit pop up toolbar close/opening cleanup:

function togglePopUp(){
    let overlay = document.querySelector(".overlay-insert-link");
    if (!overlay) return;
    overlay.style.display = "flex";
    setPopupMode("create");
    resetButtonFeedback();
    clearInvalidFieldMarks();
}

function removePopUp(){
    document.querySelectorAll(".project-data").forEach((input) => {
        input.value = "";
    });
    setPopupMode("create");
    editPanelProjectID = null;
    editPanelProjectCategory = personalCategory;
    clearInvalidFieldMarks();
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "none";

    
    const previewPDFContent = document.querySelector(".preview-pdf-button");
    const previewVideoContent  = document.querySelector(".preview-video-button");

    if (previewPDFContent) previewPDFContent.remove();
    if (previewVideoContent) previewVideoContent.remove();

}

function clearInvalidFieldMarks(){
    document.querySelectorAll(".project-field.invalid-field").forEach((field) => {
        field.classList.remove("invalid-field");
    });
}

function flashInvalidFields(fields){
    fields.filter(Boolean).forEach((field) => {
        field.classList.add("invalid-field");
        window.setTimeout(() => field.classList.remove("invalid-field"), feedbackDurationMs);
    });
}

function showButtonFeedback(state, label){
    const button = document.querySelector(".send-project-data-button");
    if (!button) return;

    resetButtonFeedback();
    button.textContent = label;
    button.classList.add(state === "success" ? "success-state" : "error-state");

    window.setTimeout(() => {
        resetButtonFeedback();
        clearInvalidFieldMarks();
    }, feedbackDurationMs);
}

function resetButtonFeedback(){
    const button = document.querySelector(".send-project-data-button");
    if (!button) return;

    button.classList.remove("success-state", "error-state");
    button.textContent = getPopupButtonLabel();
}


async function toggleEditPopUp(projectData){
    let overlay = document.querySelector(".overlay-insert-link");
    const overlayObject = document.querySelector(".overlay-object");

    let projectNameData = projectData.project_name;
    let githubLinkData = projectData.github_link;
    let descriptionData = projectData.description;

    editPanelProjectID = projectData.id;
    editPanelProjectCategory = normalizeCategory(projectData.project_category);
    setPopupMode("edit");


    const previewPDFContent = createElement("button", "preview-pdf-button", "Preview PDF");
    const previewVideoContent  = createElement("button", "preview-video-button", "Preview Video");

    overlayObject.append(
        previewPDFContent,
        previewVideoContent
    );


    previewContentFunction(previewPDFContent, previewVideoContent, overlayObject, projectData);
    

    let projectNameElement = document.querySelector('.project-data[name="project_name"]');
    let githubLinkElement = document.querySelector('.project-data[name="github_link"]');
    let descriptionElement = document.querySelector('.project-data[name="description"]');
    
    projectNameElement.value = projectNameData;
    githubLinkElement.value = githubLinkData;
    descriptionElement.value = descriptionData;
    overlay.style.display = "flex";

}

function getPopupButtonLabel(){
    return popupMode === "edit" ? updateButtonLabel : createButtonLabel;
}

function syncPopupButtonLabel(){
    const sendDataButton = document.querySelector(".send-project-data-button");
    if (sendDataButton) {
        sendDataButton.textContent = getPopupButtonLabel();
    }
}

function setPopupMode(mode){
    popupMode = mode === "edit" ? "edit" : "create";
    syncPopupButtonLabel();
}

//Insert/Edit pop up toolbar close/opening cleanup:















//(4) All link content:
export async function RenderDataOnPage(){
    projectCache = await getAllLinks();
    renderCurrentCategory();
}

export function initProjectCategorySwitcher(){
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

export function applyProjectAccess(){
    const adminOnly = document.querySelector(".admin-only");
    if (adminOnly) {
        adminOnly.hidden = !isAdmin();
    }

    const overlay = document.querySelector(".overlay-insert-link");
    if (overlay) {
        overlay.hidden = !isAdmin();
    }
}
//















//(5) Per link current content:
function projectCreator(projectData){
    let listLink = document.querySelector(".list-links");
    if (!listLink) return;
    const li = createElement("li", "Link-element");
    li.id = projectData.id;
    li.dataset.category = normalizeCategory(projectData.project_category);

    let [div, divTools, divContent] = containerCreator()

    
    previewContent(divContent, projectData)
    editToolKitInit(divTools, projectData)



    li.appendChild(div);
    listLink.appendChild(li);

}

function normalizeCategory(category){
    return category === academicCategory ? academicCategory : personalCategory;
}

function getListForCategory(category){
    const normalizedCategory = normalizeCategory(category);
    if (normalizedCategory !== currentProjectCategory) {
        return null;
    }
    return document.querySelector(".list-links");
}

function renderCurrentCategory(){
    flushVisualLinks();
    const listLink = document.querySelector(".list-links");
    if (!listLink) return;

    projectCache
        .filter((projectData) => normalizeCategory(projectData.project_category) === currentProjectCategory)
        .forEach((projectData) => {
            projectCreator(projectData);
        });
}

function containerCreator(){
    const div = createElement("div", "div-link-element");

    const divContent = createElement("div", "div-link-element-content");
    const divTools = createElement("div", "div-link-element-tools");

    div.append(
        divTools,
        divContent
    );

    return [div, divTools, divContent];
}

function previewContent(divContent, projectData){
    const projectDescriptionLabel = createElement("p", "project-description-label", "Description");
    const projectDescriptionBox = createElement("div", "project-description-box");
    const projectDescriptionText = createElement("p", "Description", projectData.description);
    const previewButton = createElement("button", "view-project-button", "View Project");

    previewButton.addEventListener("click", () => {
        window.location.href = `/html/specificLink.html?id=${projectData.id}`;
    })

    projectDescriptionBox.append(projectDescriptionText);

    divContent.append(
        createElement("p", "Project_name", "Project name: " + projectData.project_name),
        projectDescriptionLabel,
        projectDescriptionBox,
        previewButton
    );
}

/**per link EDIT listener + single listener DELETE per all links  
 * WHY? 
 *  => delete required a simple id tracking, edit requires diff big packages
 *     per link
*/
function editToolKitInit(divTools, projectData){
    if (!isAdmin()) return;

    divTools.append(createElement("button", "deleteButton", "Delete"));
    const editButton = createElement("button", "editButton", "Edit");
    editInteractorButton(editButton, projectData);
    divTools.append(editButton);
}

function editInteractorButton(editButton, projectData){

    editButton.addEventListener("click", (event) => {
        toggleEditPopUp(projectData);
    });
}

export function deleterInteractorButton(){
    if (!isAdmin()) return;

    let parent = document.querySelector(".list-links");
    if (!parent) return;
    parent.addEventListener("click", (event) => {
        let deleteButton = event.target.closest(".deleteButton");
         
        if(deleteButton){
            let objectToDelete = deleteButton.closest(".Link-element");
            projectDeletor(objectToDelete);
        }

    })
}

function projectDeletor(deletedElement){
    // projectDatabase.deleteElement(deletedElement); /API 
    let id = deletedElement.id;
    deleteLink(id);
    flushSpecificLink(deletedElement.id);
}

function flushSpecificLink(id){
    let listlink = document.querySelector(".list-links");
    let specificLink = document.getElementById(id);
    listlink.removeChild(specificLink);
}
//Per link current content:















// Rest, more practical:
function previewContentFunction(previewPDFContent, previewVideoContent, overlayObject, projectData){
    previewPDFContent.addEventListener("click", async () => {
        window.open(getShowPDFPath(projectData.id), "_blank", "noopener,noreferrer");
    });

    playVideoButton(previewVideoContent, projectData, overlayObject);
}


function editSmallData(editedData, id){
    const specificLink = document.getElementById(id);
    if (!specificLink) {
        return;
    }
    const infoContent = specificLink.querySelector(".div-link-element-info-content");
    if (!infoContent) {
        return;
    }

    console.log("Edit Small Data called with ", editedData , " and id ", id);

    if(editedData.project_name){
        console.log("Edited data project name is ", editedData.project_name);
        const projectNameP = infoContent.querySelector(".Project_name");
        projectNameP.textContent = "Project name: " + editedData.project_name;
    }
    if(editedData.github_link){
        console.log("Edited data github link is ", editedData.github_link);
        const urlLinkP = infoContent.querySelector(".URL_Link");
        urlLinkP.textContent = "GitHub URL: " + editedData.github_link;
    }
    if(editedData.description){
        console.log("Edited data description is ", editedData.description);
        const descriptionP = infoContent.querySelector(".Description");
        descriptionP.textContent = editedData.description;
    }

    if (editedData.project_category) {
        const newCategory = normalizeCategory(editedData.project_category);
        specificLink.dataset.category = newCategory;
        const targetList = getListForCategory(newCategory);
        if (targetList && specificLink.parentElement !== targetList) {
            targetList.appendChild(specificLink);
        }
    }
}



function playVideoButton(buttonPlayVideo, projectData, divContent){
    buttonPlayVideo.addEventListener("click", async () => {

        
        if(document.getElementById("videoContainer-Id-" + projectData.id)){
            let videoContainer = document.getElementById("videoContainer-Id-" + projectData.id);
            videoContainer.remove();
            buttonPlayVideo.textContent = "Show Video";
            return;
        }


        let videoContainer = document.createElement("div");
        videoContainer.id = "videoContainer-Id-" + projectData.id;


        let videoTag = document.createElement("video");
        videoTag.src = getVideoPath(projectData.id);
        videoTag.controls = true;
        videoTag.autoplay = true;
        videoTag.type = "video/mp4";
        videoTag.style.maxWidth = "100%";


        videoContainer.appendChild(videoTag);
        divContent.appendChild(videoContainer);

        buttonPlayVideo.textContent = "Hide Video";


    });
}


function downloadVideoButton(buttonDownloadVideo, projectData){
    let videoTrigger = false;

    buttonDownloadVideo.addEventListener("click", async () => {
        
        const blobResponse = await getSpecificVideoFromLink(projectData.id);
        const url = URL.createObjectURL(blobResponse);
        let videoTag = document.createElement("a");
        videoTag.setAttribute('href', url);
        videoTag.setAttribute('download', "folder.mp4");
        videoTag.className = "dynamicVideoLink";
        videoTag.src = url;
        videoTag.controls = true;
        videoTag.click();
        videoTrigger = true;
    });
}


function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

// Rest, more practical
