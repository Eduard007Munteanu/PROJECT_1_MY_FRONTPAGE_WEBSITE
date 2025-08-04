let projectDatabase = [];


export function giveId(){
    return projectDatabase.length
}


export function giveIdAfterDelete(){
    id = 0;
    projectDatabase.forEach((element) => {
        id ++;
        element.id += id;
    })
}

export function insertElement(element){
    projectDatabase.push(element);
}