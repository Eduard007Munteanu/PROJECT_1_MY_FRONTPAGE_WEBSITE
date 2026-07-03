import { getSpecificVideoFromLink, 
        getShowPDFPath, getDownloadPDF, getVideoPath
 } from "../API/linkAPI.js";



async function fullProjectLoad(){
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    


    const showcaseInfoContainer = document.querySelector(".vertical-specific-link-showcase-info");
    const downloadContainer = document.querySelector(".vertical-specific-link-download-box");


    showVideo(projectId, showcaseInfoContainer);
    showPDF(projectId, showcaseInfoContainer);
    downloadContentButton(() => getSpecificVideoFromLink(projectId), downloadContainer, "Download Video", ".mp4");
    downloadContentButton(() => getDownloadPDF(projectId), downloadContainer, "Download PDF", ".pdf");
}



function downloadContentButton(fetchFunction, container, buttonText, extension){
    const downloadButton = document.createElement("button");
    downloadButton.textContent = buttonText;
    downloadButton.addEventListener("click", async () => {
        const contentBlob = await fetchFunction;
        const url = URL.createObjectURL(contentBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = buttonText + extension; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    container.appendChild(downloadButton);
}


function showVideo(projectId, container){
    const videoContainer  =  document.createElement("div");
    videoContainer.id = "videoContainer-Id-" + projectId;
    videoContainer.classList.add("video-container");

    const videoElement = document.createElement("video");
    videoElement.src = getVideoPath(projectId);
    videoElement.controls = true;
    videoElement.style.width = "60%";
    videoElement.style.height = "auto";

    videoContainer.appendChild(videoElement);
    container.appendChild(videoContainer);
}


function showPDF(projectId, container){
    const pdfContainer = document.createElement("div");
    pdfContainer.id = "pdfContainer-Id-" + projectId;
    pdfContainer.classList.add("pdf-container");

    const pdfIframe = document.createElement("iframe");
    pdfIframe.src = getShowPDFPath(projectId);
    pdfIframe.style.width = "60%";
    pdfIframe.style.height = "auto";

    pdfContainer.appendChild(pdfIframe);
    container.appendChild(pdfContainer);
}



fullProjectLoad();