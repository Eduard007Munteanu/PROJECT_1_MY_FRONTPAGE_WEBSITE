

export function changeoption(){
    let option = document.querySelector(".change-page-option");

    let currentPage = window.location.pathname.split("/").pop();

    

    option.addEventListener("change", () => {
        const selectValue = option.value;
        console.log("SelectValue is " + selectValue); //Test 1 > checking SelectValue
        const redirect = `${selectValue}.html`;
        if(redirect != currentPage && !redirect.includes("default")){
            window.location.href  = `/html/${redirect}`;
        }

        

        
        
    })
}


