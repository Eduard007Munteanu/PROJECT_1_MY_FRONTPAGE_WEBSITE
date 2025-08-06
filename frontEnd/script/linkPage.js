// import projectDatabase from "../database/projectDatabase.js";
import { getAllLinks, getSpecificLink, deleteAllLinks, deleteLink, createLink } from "../API/linkAPI.js";



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

    sendDataButton.addEventListener("click", async () => {
        let projectData = {
            project_name : null,
            github_link: null,
            description : null,
            pdf_url : null,
            video_url : null
        }

        let projectDataInput = document.querySelectorAll(".project-data");
        

        console.log("being called");

        
        for (const eachProject of projectDataInput) {

            const key = eachProject.name;

            if(eachProject.value.trim()){
                projectData[key] = eachProject.value.trim();
            } else{
                projectData = null;
                break;
            }
        }

        if(projectData != null){
            try{
                let projectBackEndData = await createLink(projectData);  //Back the data from backend + ID
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

    divTools.append(createElement("button", "deleteButton", "Delete"));
    divContent.append(
            createElement("p", "", "Project name: " + projectData.project_name),
            createElement("p", "", "URL link: " + projectData.github_link),
            createElement("p", "", "Description: " + projectData.description),
            createElement("p", "", "PDF folder: " + projectData.pdf_url),
            createElement("p", "", "Video folder: " + projectData.video_url)
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

