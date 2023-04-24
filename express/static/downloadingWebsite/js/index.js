const xhr = new XMLHttpRequest();
let downloadList = [];

xhr.open("GET", "/downloads");

console.log(xhr.readyState);
xhr.send()
console.log(xhr.readyState);
xhr.onload = () => {
    downloadList = xhr.response;
    downloadList = JSON.parse(downloadList);

    for (let i = 0; i < downloadList.length; i++) {

        let newLink = document.createElement("a");
        let linkContent = document.createTextNode(downloadList[i]);

        newLink.appendChild(linkContent);
        newLink.href = "downloadFile" + "/" + downloadList[i];

        const existingDiv = document.getElementById("primary");
        existingDiv.appendChild(newLink);
    }
}


xhr.send();