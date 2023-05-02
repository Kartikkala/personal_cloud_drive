import { addElements } from "../views/dom.js";
export const eventFunction = {
    refresh(downloadList, parentElement)
    {
        parentElement.innerHTML = "";
        fetch('/downloads')
        .then((response)=>{
            response = response.text();
            return response;
        })
        .then((result)=>{
            downloadList = JSON.parse(result);
            for(let file in downloadList)
            {
                addElements.addFileObject(file, downloadList[file],parentElement);
            }
        })
    }
}