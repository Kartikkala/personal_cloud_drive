const xhr = new XMLHttpRequest();
let downloadList = [];

function addTextLink(url, linkContent, className, elementId)
{
    let newLink = document.createElement("a");
    newLink.href = url;
    newLink.appendChild(document.createTextNode(linkContent));
    if(className!=undefined)
    {
        newLink.setAttribute('class', className);
    }
    if(elementId !=undefined)
    {
        newLink.setAttribute('id', elementId);
    }
    return newLink;
}

function addDivision(className, elementId)
{
    let newElement = document.createElement("div");
    if(className !=undefined)
    {
        newElement.setAttribute('class', className);
    }
    if(elementId!=undefined)
    {
        newElement.setAttribute('id', elementId);
    }
    return newElement;
}

function addImage(url, className, elementId)
{
    let image = document.createElement("img");
    image.src = url;
    if(className !=undefined)
    {
        image.setAttribute('class', className);
    }
    if(elementId!=undefined)
    {
        image.setAttribute('id', elementId);
    }
    return image;
}

function addImageWithURL(imageUrl, redirectionUrl, imageClassName, redirectionUrlClassName, imageElementId, redirectionUrlElementId)
{
    let link = document.createElement("a");
    link.href = redirectionUrl;
    let image = document.createElement("img");
    image.src = imageUrl;
    if(imageClassName !=undefined)
    {
        image.setAttribute('class', imageClassName);
    }
    if(imageElementId!=undefined)
    {
        image.setAttribute('id', imageElementId);
    }
    if(redirectionUrlClassName !=undefined)
    {
        link.setAttribute('class', redirectionUrlClassName);
    }
    if(redirectionUrlElementId!=undefined)
    {
        link.setAttribute('id', redirectionUrlElementId);
    }
    link.appendChild(image);
    return link;
}

function addFileObject(listItem, parentDiv)
{
    let downloadUrl = "downloadFile" + "/" + listItem;
    let newFileItem = addDivision('fileItems');
    let fileActions = addDivision('actionBar');

    let buttonIcon = addImageWithURL("../assets/icons/download.png", downloadUrl, 'actionButton');
    let newLink = addTextLink(downloadUrl, listItem, 'bodyText');

    fileActions.appendChild(buttonIcon);
    newFileItem.appendChild(newLink);
    newFileItem.append(fileActions);

    parentDiv.appendChild(newFileItem);
}

xhr.open("GET", "/downloads");
xhr.send()
xhr.onload = () => {
    downloadList = xhr.response;
    downloadList = JSON.parse(downloadList);
    const existingDiv = document.getElementById("primary");
    for (let i = 0; i < downloadList.length; i++) {
        addFileObject(downloadList[i], existingDiv);
    }
}


xhr.send();