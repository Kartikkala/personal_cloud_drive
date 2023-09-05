import {text} from '../utils/textUtils.js'
import { screen } from '../utils/screen.js';
import { statParser } from '../utils/fileStatParser.js';
export const addElements = {
    addTextLink(url, linkContent, className, elementId)
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
    },
    
    addDivision(className, elementId)
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
    },
    
    addImage(url, className, elementId)
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
    ,
    addImageWithURL(imageUrl, redirectionUrl, imageClassName, redirectionUrlClassName, imageElementId, redirectionUrlElementId)
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
    },
    async addFileObject(listItem, listItemStats,parentDiv)
    {
        let downloadUrl = "downloadFileClient" + "/" + listItem;
        let newFileItem = this.addDivision('fileItems');
        let fileNameDiv = this.addDivision('fileNameDiv');
        let newTextDiv = this.addDivision('textDiv');
        let fileSizeDiv = this.addDivision('fileSizeDiv');
        let fileActions = this.addDivision('actionBar');
        let buttonIcon = this.addImageWithURL("../assets/icons/download.png", downloadUrl, 'actionButton');
        let fileName = listItem;
        let fileSize = statParser.getFileSizeinMB(listItemStats);
        fileSizeDiv.appendChild(newTextDiv);
    
        if(fileSize>1024)
        {
            fileSize = statParser.convertMBtoGB(fileSize);
            newTextDiv.appendChild(document.createTextNode(`Size: ${fileSize} GB`));
        }
        else
        {
            newTextDiv.appendChild(document.createTextNode(`Size: ${fileSize} MB`));
        }

        
    
        if(screen.getDeviceScreenWidth()<=480)
        {
            fileName = await text.clipText(listItem, 16, 24, 10);
        }
        let newLink = this.addTextLink(downloadUrl, fileName, 'bodyText');

        fileActions.appendChild(buttonIcon);
        fileNameDiv.appendChild(newLink);
        newFileItem.appendChild(fileNameDiv);
        newFileItem.appendChild(fileSizeDiv);
        newFileItem.append(fileActions);

        parentDiv.appendChild(newFileItem);
        return newFileItem;
    }
}    