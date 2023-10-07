import { addElements } from "../views/dom.js";
export const eventFunction = {
    refresh(downloadList, parentElement)
    {
        const requestBody = {"filePath":'/'}
        const request = new Request('/fs/ls', {
            method: 'POST',
            body: JSON.stringify(requestBody), // Convert the JSON object to a string
            headers: {
                'Content-Type': 'application/json' // Specify the content type
            }
        })
        parentElement.innerHTML = "";
        fetch(request)
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