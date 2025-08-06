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

export async function createLink(linkData){
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(linkData)
    });

    if(!response.ok){
        throw new Error('failed to create link');
    }

    return await response.json();
}