const express = require('express');
const fs = require("fs");
const { request } = require('http');
const path = require('path');
const app = express();

app.disable('x-powered-by');

const downloadDir = 'downloadables/'
const downloadSiteName = path.join(__dirname, "/static/", "/downloadingWebsite/")


const downloadDirContentList = fs.readdirSync(downloadDir);
const downloadDirContentSize = [];


for (let i = 0; i < downloadDirContentList.length; i++) {
    let fileStatObj = fs.statSync(path.join(__dirname, downloadDir, `${downloadDirContentList[i]}`));
    downloadDirContentSize.push((fileStatObj.size / 1048576).toFixed(2));
}
console.log(downloadDirContentSize);


app.use("/", express.static(downloadSiteName));
app.get("/downloads", (request, response) => {
    response.send(downloadDirContentList);
})


app.get("/downloadFile/:filename", (request, response) => {

    filename = request.params.filename;
    response.download(downloadDir + filename);

})



app.listen(80, '0.0.0.0', () => { console.log("Listening on port 80"); });