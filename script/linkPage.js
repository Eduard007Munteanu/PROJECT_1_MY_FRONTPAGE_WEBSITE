import projectDatabase from "../database/projectDatabase.js";

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


export function projectInit(){
    let sendDataButton = document.querySelector(".send-project-data-button");

    sendDataButton.addEventListener("click", () => {
        let projectData = {
            name : null,
            link: null,
            video : null,
            PDF : null,
            description : null
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
            projectCreator(projectData);
            removePopUp();
        }
    })
}


function projectCreator(projectData){
    let listLink = document.querySelector(".list-links");
    projectData.id = projectDatabase.getId();
    projectDatabase.insertElement(projectData);

    
    const li = createElement("li", "Link-element");
    li.id = projectData.id;

    const div = createElement("div", "div-link-element");

    const divContent = createElement("div", "div-link-element-content");
    const divTools = createElement("div", "div-link-element-tools");


    //div.id = projectData.id;

    div.append(
        divTools,
        divContent
    );

    divTools.append(createElement("button", "deleteButton", "Delete"));
    divContent.append(
            createElement("p", "", "Project name: " + projectData.name),
            createElement("p", "", "URL link: " + projectData.link),
            createElement("p", "", "Description: " + projectData.description),
            createElement("p", "", "PDF folder: " + projectData.PDF),
            createElement("p", "", "Video folder: " + projectData.video)
    );





    li.appendChild(div);
    listLink.appendChild(li);

    //Testing part> Check database elements:
    console.log(projectDatabase);
}

function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
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



function projectDeletor(deletedElement){
    let projectData = projectDatabase.getDataBase();
    projectDatabase.deleteElement(deletedElement);
    flushSpecificLink(deletedElement.id);
    projectData.forEach((dataElement) => {
        updateOthersId();
    })
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

function updateOthersId(){
    projectDatabase.giveIdAfterDelete();
    let listlink = document.querySelector(".list-links");
    let children = listlink.children;
    for(let i=0; i < children.length; i++){
        children[i].id = projectDatabase.getDataBase()[i].id;
    }


}