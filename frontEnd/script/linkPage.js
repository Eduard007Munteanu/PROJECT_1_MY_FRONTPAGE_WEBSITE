// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks, getSpecificPDFFromLink, 
    getSpecificVideoFromLink, deleteAllLinks,
     getVideoPath, deleteLink, createLink, editBigData, 
    editTextData } from "../API/linkAPI.js";


let sendEdiButtonSwitch = "send";
let editPanelProjectID = null;


export function insertLinkContent(){
    let insertLinkButton = document.querySelector(".insert-link-button");

    insertLinkButton.addEventListener('click', () => {
        sendEdiButtonSwitch = "send";
        togglePopUp();
    })
}


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


function previewContentFunction(previewPDFContent, previewVideoContent, overlayObject, projectData){
    previewPDFContent.addEventListener("click", async () => {
        const blobPDFResponse = await getSpecificPDFFromLink(projectData.id);
        const url = URL.createObjectURL(blobPDFResponse);
        window.open(url, "_blank"); // Opens PDF in new tab
    });

    playVideoButton(previewVideoContent, projectData, overlayObject);
}











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



async function sendButtonFunction(){
    let projectData = {
        project_name : null,
        github_link: null,
        description : null,
        pdf_folder : null, //Actual files
        video_folder: null,
    }

    let projectDataInput = document.querySelectorAll(".project-data");
    

    console.log("being called");

    
    for (const eachProject of projectDataInput) {

        const key = eachProject.name;

        if(eachProject.name == "pdf_folder" || eachProject.name == "video_folder"){
            const file = eachProject.files[0];
            projectData[key] = file;
        }
        else if(eachProject.value.trim()){
            projectData[key] = eachProject.value.trim();
        } else{
            projectData = null;
            break;
        }
    }

    if(projectData != null){
        try{
            console.log("At projectData check if not null");
            const formData = new FormData();
            console.log("At projectData, FormData() created")
            for (const key in projectData) {
                console.log("At projectData, in the loop ", key)
                const value = projectData[key];
                console.log("Value defined as ", value)
                if (typeof value === "string") {
                    formData.append(key, value);
                } else {
                    formData.append(key, value, value.name);
                }
            }
            console.log("Yuppi, formData is ", formData);
            let projectBackEndData = await createLink(formData);  //Back the data from backend + ID
            projectCreator(projectBackEndData);
        } catch{
            throw new Error("Failed retrieval of data POST");
        }
        removePopUp();
    }
}


async function editButtonFunction(){

    console.log("We are at editButtonFunction()");


    let projectData = {
        project_name : null,
        github_link: null,
        description : null,
        pdf_folder : null, //Actual files
        video_folder: null,
    }

    let projectDataInput = document.querySelectorAll(".project-data");

   

    
    for (const eachProject of projectDataInput) {

        const key = eachProject.name;

        if(eachProject.name == "pdf_folder" || eachProject.name == "video_folder"){
            if(eachProject.files.length == 0){
                projectData[key] = null;
                continue;
            }
            const file = eachProject.files[0];
            projectData[key] = file;
        }
        else if(eachProject.value.trim()){
            projectData[key] = eachProject.value.trim();
        } else{
            projectData = null;
            break;
        }
    }

    if(projectData != null){
        try{
            console.log("At projectData check if not null");
            const textData = new FormData();
            const bigData  = new FormData();
            console.log("At projectData, FormData() created")
            for (const key in projectData) {
                if(key == "pdf_folder" || key == "video_folder"){
                    const value = projectData[key];
                    if(value != null){
                        bigData.append(key, value, value.name);
                    }
                }
                else{
                    console.log("At projectData, in the loop ", key)
                    const value = projectData[key];
                    console.log("Value defined as ", value);
                    if(value != null){
                        textData.append(key, value);
                    }
                }
            }


            if([...bigData.keys()].length > 0){
                await editBigData(bigData, editPanelProjectID);   //Nothing back from editBigData, data retrieved in the pdf and video functions
                     
            }
            if([...textData.keys()].length > 0){
                let textDataResponse = await editTextData(textData, editPanelProjectID);
                editSmallData(textDataResponse, editPanelProjectID);
                
            }
        } catch{
            throw new Error("Failed retrieval of data POST");
        }
        removePopUp();
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

export function deleteAllInteractorButton(){
    let allDeletebutton = document.querySelector(".remove-all-button");
    allDeletebutton.addEventListener("click", () => {
        fullProjectDeletor();
    })
}


function editInteractorButton(editButton, projectData){

    editButton.addEventListener("click", (event) => {
        toggleEditPopUp(projectData);
        sendEdiButtonSwitch = "edit";

    });
}




function projectCreator(projectData){
    let listLink = document.querySelector(".list-links");
    const li = createElement("li", "Link-element");
    li.id = projectData.id;

    const div = createElement("div", "div-link-element");

    const divContent = createElement("div", "div-link-element-content");
    const divTools = createElement("div", "div-link-element-tools");


    div.append(
        divTools,
        divContent
    );

    const divInfoContent = createElement("div", "div-link-element-info-content");
    divContent.append(divInfoContent);


    const pdfP = createElement("p", "", "PDF folder: ");
    const a = createElement("a");
    a.setAttribute('href', "#");
    a.textContent = "Download PDF";
    pdfP.append(a);

    const videoP = createElement("p", "", "Video folder: ")
    const buttonDownloadVideo = createElement("button", "download-button", "Download"); 
    const buttonPlayVideo = createElement("button", "show-video-button", "Show Video");

    videoP.append(buttonDownloadVideo, buttonPlayVideo);


    downloadVideoButton(buttonDownloadVideo, projectData);
    playVideoButton(buttonPlayVideo, projectData, divContent);
    openPDFFile(a, projectData);

    

    divTools.append(createElement("button", "deleteButton", "Delete"));


    const editButton = createElement("button", "editButton", "Edit");

    editInteractorButton(editButton, projectData);

    

    divTools.append(editButton);




    divInfoContent.append(
            createElement("p", "Project_name", "Project name: " + projectData.project_name),
            createElement("p", "URL_Link", "URL link: " + projectData.github_link),
            createElement("p", "Description", "Description: " + projectData.description),
            pdfP,
            videoP
    );

    li.appendChild(div);
    listLink.appendChild(li);

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











function openPDFFile(a, projectData){
    a.addEventListener("click", async () => {
        const blobResponse = await getSpecificPDFFromLink(projectData.id);
        const url = URL.createObjectURL(blobResponse);
        window.open(url, "_blank"); // Opens PDF in new tab
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

