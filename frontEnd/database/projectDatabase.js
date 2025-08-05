class ProjectDatabase{
    #projectDatabase = [];


    getId(){
        return `link-element-${this.#projectDatabase.length + 1}`;  //To not have init being 0.
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

    deleteAllElements(){
        this.#projectDatabase.length = 0;
    }
}


let projectDatabase = new ProjectDatabase();
export default projectDatabase;