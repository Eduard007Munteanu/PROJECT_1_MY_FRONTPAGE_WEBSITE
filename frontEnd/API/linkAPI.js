const BASE_URL = "http://localhost:8080/api/links";

export async function getAllLinks(){
    const response = await fetch(BASE_URL);
    if(!response.ok){
        throw new Error("failed to fetch links");
    }
    return await response.json();
}

export async function getSpecificLink(specific_id){
    const response = await fetch(`${BASE_URL}/${specific_id}`);
    if(!response.ok){
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`)
    }

    return await response.json();
}


export async function getSpecificPDFFromLink(specific_id){
    const response = await fetch(`${BASE_URL}/pdfFiles/${specific_id}`);
    if(!response.ok){
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`)
    }

    return await response.blob();
}

export async function getSpecificVideoFromLink(specific_id){
    const response = await fetch(`${BASE_URL}/videoFiles/${specific_id}`);
    if(!response.ok){
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`)
    }

    return await response.blob();
    
}

export async function createLink(linkData){
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            
        },
        body: linkData
    });

    if(!response.ok){
        throw new Error('failed to create link');
    }

    return await response.json();
}

export async function deleteLink(specific_id){
    const response = await fetch(`${BASE_URL}/${specific_id}`, {
        method: "DELETE"
    });

    if(!response.ok){
        throw new Error("failed to delete the link");
    }

    return await response.json();
}

export async function deleteAllLinks(){
    const response = await fetch(BASE_URL, {
        method: "DELETE"
    });

    if(!response.ok){
        throw new Error("failed to delete all links");
    }

}


export async function getVideoPacketsToPlay(byteStart, byteEnd){
    const response = await fetch(`${BASE_URL}/videoFilesPLAY/${specific_id}`, {
        method: "GET",
        headers: {
            Range: `bytes=${byteStart}-${byteEnd}`

        },
        
    });
    if(!response.ok){
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`)
    }

    return await response.blob();

}


export  function getVideoPath(specific_id){
    const finder = `${BASE_URL}/videoFilesPLAY/${specific_id}`
    return finder;
}