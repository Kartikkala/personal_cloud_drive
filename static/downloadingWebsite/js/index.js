import { eventFunction } from "./utils/eventFunctions.js";
import { addElements } from "./views/dom.js";

let downloadList = {};
const existingDiv = document.getElementById("contentDiv");

const requestBody = {"filePath":'/'}
const request = new Request('/fs/ls', {
    method: 'POST',
    body: JSON.stringify(requestBody), // Convert the JSON object to a string
    headers: {
        'Content-Type': 'application/json' // Specify the content type
    }
});


fetch(request)
.then((response)=>{
    response = response.text();
    return response;
})
.then((result)=>{
    result = JSON.parse(result)
    const content = result.content
    downloadList = Object.keys(content)
    for(let file of downloadList)
    {
        addElements.addFileObject(file, content[file] ,existingDiv);
    }
})

document.body.style.overflow = 'hidden';

const refreshButton = document.getElementById('refresh');
refreshButton.addEventListener('click', eventFunction.refresh.bind(null, downloadList, existingDiv));
