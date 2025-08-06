import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectFULLCreator,
        deleterInteractorButton, deleteAllInteractorButton,
        RenderDataOnPage} from "./linkPage.js";

changeoption();

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "link.html") {
    RenderDataOnPage();
    insertLinkContent();
    projectFULLCreator();
    deleterInteractorButton();
    deleteAllInteractorButton();
}

