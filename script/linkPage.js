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
    div.id = projectData.id;

    div.append(
        createElement("p", "", "Project name: " + projectData.name),
        createElement("p", "", "URL link: " + projectData.link),
        createElement("p", "", "Description: " + projectData.description),
        createElement("p", "", "PDF folder: " + projectData.PDF),
        createElement("p", "", "Video folder: " + projectData.video)
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