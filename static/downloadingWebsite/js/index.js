const xhr = new XMLHttpRequest();
let downloadList = [];

function getDeviceScreenWidth()
{
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    return width;
}

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

function clipFilename(fileName, maxCharacters=16, numberOfCharactersAtStart=10,numberOfCharactersAtEnd=10)
{
    return new Promise((resolve)=>
    {
        let len = fileName.length;
        const newName = new Array;
        if(len >maxCharacters)
        {
            for(let i=0;i<len;i++)
            {
                if(i>=numberOfCharactersAtStart && i<len-numberOfCharactersAtEnd)
                {
                    if(i<numberOfCharactersAtStart+3)
                    {
                        newName.push('.');
                    }
                    continue;
                }
                newName.push(fileName[i]);
            }
            resolve(newName.join(""));
        }
    resolve(fileName);
})
}

async function addFileObject(listItem, parentDiv)
{
    let downloadUrl = "downloadFile" + "/" + listItem;
    let newFileItem = addDivision('fileItems');
    let fileNameDiv = addDivision('fileNameDiv');
    let newTextDiv = addDivision('textDiv');
    let fileSizeDiv = addDivision('fileSizeDiv');
    let fileActions = addDivision('actionBar');

    fileSizeDiv.appendChild(newTextDiv);
    newTextDiv.appendChild(document.createTextNode("Size: "));

    let buttonIcon = addImageWithURL("../assets/icons/download.png", downloadUrl, 'actionButton');
    let fileName = listItem;
    
    if(getDeviceScreenWidth()<=480)
    {
        fileName = await clipFilename(listItem, 16, 24, 10);
    }
    let newLink = addTextLink(downloadUrl, fileName, 'bodyText');

    fileActions.appendChild(buttonIcon);
    fileNameDiv.appendChild(newLink);
    newFileItem.appendChild(fileNameDiv);
    newFileItem.appendChild(fileSizeDiv);
    newFileItem.append(fileActions);

    parentDiv.appendChild(newFileItem);
}

xhr.open("GET", "/downloads");
xhr.send()
xhr.onload = () => {
    downloadList = xhr.response;
    downloadList = JSON.parse(downloadList);
    const existingDiv = document.getElementById("primary");
    for(file in downloadList)
    {
        addFileObject(file, existingDiv);
    }
}


xhr.send();