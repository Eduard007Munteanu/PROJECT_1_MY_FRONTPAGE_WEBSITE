import { changeoption } from "./defaultPage.js";
import { insertLinkContent, projectInit, deleterInteractorButton} from "./linkPage.js";

changeoption();

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "link.html") {
    insertLinkContent();
    projectInit();
    deleterInteractorButton();
}

