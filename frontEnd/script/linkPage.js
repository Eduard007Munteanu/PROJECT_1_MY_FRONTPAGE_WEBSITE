// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks, getSpecificPDFFromLink, 
    getSpecificVideoFromLink, deleteAllLinks,
     getVideoPath, deleteLink, createLink, editBigData, 
    editTextData } from "../API/linkAPI.js";


let sendEdiButtonSwitch = "send";
let editPanelProjectID = null;

//import projectDatabase section









//(1) General interaction bar for all list content

export function insertLinkContent(){
    let insertLinkButton = document.querySelector(".insert-link-button");

    insertLinkButton.addEventListener('click', () => {
        sendEdiButtonSwitch = "send";
        togglePopUp();
    })
}


export function deleteAllInteractorButton(){
    let allDeletebutton = document.querySelector(".remove-all-button");
    allDeletebutton.addEventListener("click", () => {
        fullProjectDeletor();
    })
}

//General interaction bar for all list content










//(2) Link edit/insertion toolbar settings

export async function projectFULLCreator(){
    let sendDataButton = document.querySelector(".send-project-data-button");
    let closeDataButton = document.querySelector(".close-project-data-button");


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
    const projectData = getProjectData();
    if (!projectData) return;

    try {
        const formData = new FormData();
        for (const [key, value] of Object.entries(projectData)) {
            // FormData handles both Strings and Files automatically!
            if (value) formData.append(key, value);
        }

        const response = await createLink(formData);
        projectCreator(response);
        removePopUp();
    } catch (err) {
        console.error("Failed retrieval of data POST", err);
    }
}

async function editButtonFunction() {
    const projectData = getProjectData();
    if (!projectData) return;

    try {
        const textData = new FormData();
        const bigData = new FormData();

        for (const [key, value] of Object.entries(projectData)) {
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
        
        removePopUp();
    } catch (err) {
        console.error("Edit failed", err);
    }
}


function getProjectData() {
    let projectData = {};
    const inputs = document.querySelectorAll(".project-data");

    for (const input of inputs) {
        const key = input.name;

        if (input.type === "file") {
            // If file exists, grab it; otherwise null
            projectData[key] = input.files.length > 0 ? input.files[0] : null;
        } else {
            const value = input.value.trim();
            if (!value) return null; // Validation: if a text field is empty, fail fast
            projectData[key] = value;
        }
    }
    return projectData;
}

//Link edit/insertion toolbar settings










//(3) Insert/Edit pop up toolbar close/opening cleanup:

function togglePopUp(){
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "flex";
}

function removePopUp(){
    document.querySelectorAll(".project-data").forEach((input) => {
        input.value = "";
    });
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "none";

    
    const previewPDFContent = document.querySelector(".preview-pdf-button");
    const previewVideoContent  = document.querySelector(".preview-video-button");

    if(previewPDFContent && previewVideoContent){
        previewPDFContent.remove();
        previewVideoContent.remove();
    }

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










//(4) Per link current content:
function projectCreator(projectData){
    let listLink = document.querySelector(".list-links");
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
    divContent.append(
            createElement("p", "Project_name", "Project name: " + projectData.project_name),
            createElement("p", "Description", "Description: " + projectData.description),
            createElement("button", "view-project-button", "View Project")
    );
}


function editToolKitInit(divTools, projectData){
    divTools.append(createElement("button", "deleteButton", "Delete"));
    const editButton = createElement("button", "editButton", "Edit");
    editInteractorButton(editButton, projectData);
    divTools.append(editButton);
}

//Per link current content:



function previewContentFunction(previewPDFContent, previewVideoContent, overlayObject, projectData){
    previewPDFContent.addEventListener("click", async () => {
        const blobPDFResponse = await getSpecificPDFFromLink(projectData.id);
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
        urlLinkP.textContent = "URL link: " + editedData.github_link;
    }
    if(editedData.description){
        console.log("Edited data description is ", editedData.description);
        const descriptionP = infoContent.querySelector(".Description");
        descriptionP.textContent = "Description: " + editedData.description;
    }
}




export async function RenderDataOnPage(){
    let data = await getAllLinks();
    data.forEach((dataObject) => {
        projectCreator(dataObject)
    })
}


export function deleterInteractorButton(){
    let parent = document.querySelector(".list-links");
    parent.addEventListener("click", (event) => {
        let deleteButton = event.target.closest(".deleteButton");
         
        if(deleteButton){
            let objectToDelete = deleteButton.closest(".Link-element");
            projectDeletor(objectToDelete);
        }

    })
}




function editInteractorButton(editButton, projectData){

    editButton.addEventListener("click", (event) => {
        toggleEditPopUp(projectData);
        sendEdiButtonSwitch = "edit";

    });
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






function projectDeletor(deletedElement){
    // projectDatabase.deleteElement(deletedElement); /API 
    let id = deletedElement.id;
    deleteLink(id);
    flushSpecificLink(deletedElement.id);
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

function flushSpecificLink(id){
    let listlink = document.querySelector(".list-links");
    let specificLink = document.getElementById(id);
    listlink.removeChild(specificLink);
}

