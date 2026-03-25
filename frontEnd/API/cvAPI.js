const BASE_URL = "http://localhost:8080/api/cv";

export async function getSpecificLink(){
    const response = await fetch(`${BASE_URL}`);
    if(!response.ok){
        throw new Error(`failed to fetch that specific link with id: ${specific_id}`)
    }

    return await response.json();
}