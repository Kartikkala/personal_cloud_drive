const xhr = new XMLHttpRequest();
import { addElements } from "./views/dom.js";
let downloadList = {};


xhr.open("GET", "/downloads");
xhr.onload = () => {
    downloadList = xhr.response;
    downloadList = JSON.parse(downloadList);
    const existingDiv = document.getElementById("primary");
    for(let file in downloadList)
    {
        addElements.addFileObject(file, existingDiv);
    }
    document.body.style.overflow = 'hidden';
}


xhr.send();