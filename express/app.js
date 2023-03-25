const express = require('express');
const fs = require("fs");
const { request } = require('http');
const path = require('path');


const app = express();

app.disable('x-powered-by');

const downloadDir = 'downloadables/'
const downloadSiteName = path.join(__dirname, "/static/", "/downloadingWebsite/")


downloadDirContentList = fs.readdirSync(downloadDir);


app.use("/", express.static(downloadSiteName));
app.get("/downloads", (request, response) => {
    response.send(downloadDirContentList);
})


app.get("/downloadFile/:filename", (request, response) => {

    filename = request.params.filename;
    response.download(downloadDir + filename);

})



app.listen(80, '0.0.0.0', () => { console.log("Listening on port 80"); });