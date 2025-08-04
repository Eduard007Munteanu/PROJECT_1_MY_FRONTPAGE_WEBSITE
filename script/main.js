import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectInit,
        deleterInteractorButton, deleteAllInteractorButton} from "./linkPage.js";

changeoption();

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "link.html") {
    insertLinkContent();
    projectInit();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

