// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks,  
    getSpecificVideoFromLink, deleteAllLinks,
     getVideoPath, deleteLink, createLink, editBigData, 
    editTextData } from "../API/linkAPI.js";
import { isAdmin } from "./siteState.js";


let sendEdiButtonSwitch = "send";
let editPanelProjectID = null;
const createButtonLabel = "Create";
const feedbackDurationMs = 1000;

//import projectDatabase section















//(1) General interaction bar for all list content

export function insertLinkContent(){
    if (!isAdmin()) return;

    let insertLinkButton = document.querySelector(".insert-link-button");
    if (!insertLinkButton) return;

    insertLinkButton.addEventListener('click', () => {
        sendEdiButtonSwitch = "send";
        const sendDataButton = document.querySelector(".send-project-data-button");
        if (sendDataButton) sendDataButton.textContent = createButtonLabel;
        togglePopUp();
    })
}


export function deleteAllInteractorButton(){
    if (!isAdmin()) return;

    let allDeletebutton = document.querySelector(".remove-all-button");
    if (!allDeletebutton) return;

    allDeletebutton.addEventListener("click", () => {
        fullProjectDeletor();
    })
}

function fullProjectDeletor(){
    deleteAllLinks();
    // projectDatabase.deleteAllElements(); API
    flushVisualLinks();
}

function flushVisualLinks(){
    let listlink = document.querySelector(".list-links");
    listlink.innerHTML = "";
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
        if(sendEdiButtonSwitch == "send"){
            await sendButtonFunction();
        } else if(sendEdiButtonSwitch == "edit"){
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
            projectCreator(response);
            removePopUp();
            resetButtonFeedback();
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
            const response = await editTextData(textData, editPanelProjectID);
            editSmallData(response, editPanelProjectID);
        }
        
        showButtonFeedback("success", "Project updated!");
        removePopUp();
        window.setTimeout(() => resetButtonFeedback(), feedbackDurationMs);
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
    resetButtonFeedback();
    clearInvalidFieldMarks();
}

function removePopUp(){
    document.querySelectorAll(".project-data").forEach((input) => {
        input.value = "";
    });
    clearInvalidFieldMarks();
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "none";

    
    const previewPDFContent = document.querySelector(".preview-pdf-button");
    const previewVideoContent  = document.querySelector(".preview-video-button");

    if(previewPDFContent && previewVideoContent){
        previewPDFContent.remove();
        previewVideoContent.remove();
    }

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
    button.textContent = createButtonLabel;
}


async function toggleEditPopUp(projectData){
    let overlay = document.querySelector(".overlay-insert-link");
    const overlayObject = document.querySelector(".overlay-object");

    let projectNameData = projectData.project_name;
    let githubLinkData = projectData.github_link;
    let descriptionData = projectData.description;

    editPanelProjectID = projectData.id;


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

//Insert/Edit pop up toolbar close/opening cleanup:















//(4) All link content:
export async function RenderDataOnPage(){
    let data = await getAllLinks();
    data.forEach((dataObject) => {
        projectCreator(dataObject)
    })
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

    let [div, divTools, divContent] = containerCreator()

    
    previewContent(divContent, projectData)
    editToolKitInit(divTools, projectData)



    li.appendChild(div);
    listLink.appendChild(li);

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

    let previewButton = createElement("button", "view-project-button", "View Project")

    previewButton.addEventListener("click", () => {
        window.location.href = `/html/specificLink.html?id=${projectData.id}`;
    })

    divContent.append(
            createElement("p", "Project_name", "Project name: " + projectData.project_name),
            createElement("p", "Description", "Description: " + projectData.description),
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
        sendEdiButtonSwitch = "edit";
        const sendDataButton = document.querySelector(".send-project-data-button");
        if (sendDataButton) sendDataButton.textContent = "Update";

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
        const blobPDFResponse = await getShowPDF(projectData.id);
        const url = URL.createObjectURL(blobPDFResponse);
        window.open(url, "_blank"); // Opens PDF in new tab
    });

    playVideoButton(previewVideoContent, projectData, overlayObject);
}


function editSmallData(editedData, id){
    const specificLink = document.getElementById(id);
    const infoContent = specificLink.querySelector(".div-link-element-info-content");

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
        descriptionP.textContent = "Description: " + editedData.description;
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
