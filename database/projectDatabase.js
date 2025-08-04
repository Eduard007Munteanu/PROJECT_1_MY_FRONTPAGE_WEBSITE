class ProjectDatabase{
    #projectDatabase = [];


    getId(){
        return `link-element-${this.#projectDatabase.length + 1}`;  //To not have init being 0.
    }

    giveIdAfterDelete(){
        let id = 0;
        this.#projectDatabase.forEach((element) => {
            id ++;
            element.id = `link-element-${id}`
        }) 
    }

    insertElement(element){
        this.#projectDatabase.push(element);
    }

    getDataBase(){
        return this.#projectDatabase; 
    }

    deleteElement(element){
        this.#projectDatabase.pop(element);
    }
}


let projectDatabase = new ProjectDatabase();
export default projectDatabase;