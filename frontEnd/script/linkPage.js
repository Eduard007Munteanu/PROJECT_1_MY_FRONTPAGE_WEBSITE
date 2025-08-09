// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks, getSpecificPDFFromLink, 
    getSpecificVideoFromLink, deleteAllLinks, deleteLink, createLink } from "../API/linkAPI.js";



export function insertLinkContent(){
    let insertLinkButton = document.querySelector(".insert-link-button");

    insertLinkButton.addEventListener('click', () => {
        togglePopUp();
    })
}


function togglePopUp(){
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "flex";

}

function removePopUp(){
    let overlay = document.querySelector(".overlay-insert-link");
    overlay.style.display = "none";
}


export async function projectFULLCreator(){
    let sendDataButton = document.querySelector(".send-project-data-button");
    let closeDataButton = document.querySelector(".close-project-data-button");


    closeDataButton.addEventListener("click", async () => {
        removePopUp();
    })



    sendDataButton.addEventListener("click", async () => {
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
    })
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


    const pdfP = createElement("p", "", "PDF folder: " + projectData.pdf_url)
    const videoP = createElement("p", "", "Video folder: " + projectData.video_url)




    pdfP.addEventListener("click", async () => {
        const blobResponse = await getSpecificPDFFromLink(projectData.id);
        const url = URL.createObjectURL(blobResponse);
        window.open(url, "_blank"); // Opens PDF in new tab
    });

    videoP.addEventListener("click", async () => {
        const blobResponse = await getSpecificVideoFromLink(projectData.id);
        const url = URL.createObjectURL(blobResponse);
        window.open(url, "_blank"); // Opens video in new tab
    });

    divTools.append(createElement("button", "deleteButton", "Delete"));
    divContent.append(
            createElement("p", "", "Project name: " + projectData.project_name),
            createElement("p", "", "URL link: " + projectData.github_link),
            createElement("p", "", "Description: " + projectData.description),
            pdfP,
            videoP
    );

    li.appendChild(div);
    listLink.appendChild(li);

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

