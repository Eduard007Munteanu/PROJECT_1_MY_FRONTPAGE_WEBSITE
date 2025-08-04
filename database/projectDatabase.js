class ProjectDatabase{
    #projectDatabase = [];


    getId(){
        return this.#projectDatabase.length;
    }

    giveIdAfterDelete(){
        id = 0;
        this.#projectDatabase.forEach((element) => {
            id ++;
            element.id += id;
        }) 
    }

    insertElement(element){
        this.#projectDatabase.push(element);
    }
}


let projectDatabase = new ProjectDatabase();
export default projectDatabase;