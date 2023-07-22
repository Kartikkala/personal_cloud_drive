import { eventFunction } from "./utils/eventFunctions.js";
import { addElements } from "./views/dom.js";

let downloadList = {};
const existingDiv = document.getElementById("contentDiv");

fetch('/downloads')
.then((response)=>{
    response = response.text();
    return response;
})
.then((result)=>{
    downloadList = JSON.parse(result);
    for(let file in downloadList)
    {
        addElements.addFileObject(file, downloadList[file],existingDiv);
    }
})

document.body.style.overflow = 'hidden';

const refreshButton = document.getElementById('refresh');
refreshButton.addEventListener('click', eventFunction.refresh.bind(null, downloadList, existingDiv));
