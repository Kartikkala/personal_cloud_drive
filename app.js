// Built in modules
const express = require('express')
const path = require('path')

// User defined modules

const {FileManager} = require("./scripts/fileSystem/fileSystem.js")
const {FileTransfer} = require('./scripts/fileTransfer/transfer.js')

// Configurations

const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")
const downloadDirName = 'downloadables'
const targetVolume = path.join(__dirname, downloadDirName)
const maxFileTransferSpeed = 8e+7

// Object creations and initializations

const app = express()
const fileTransfer = new FileTransfer(targetVolume, maxFileTransferSpeed)
const fileObject = new FileManager(targetVolume)

app.disable('x-powered-by')

// Route handling

app.use("/", express.static(frontendApp))

app.get("/downloads", (request, response) => {
    fileObject.getFileStatsInDirectory().then((statObject)=>
    {
        response.send(statObject)
    })
    .catch((error)=>{
        console.log(error)
        response.send(["error: "+error])
    })
})


app.get("/downloadFile/:filename", (request, response) => {
    let filePath = path.join(targetVolume, request.params.filename)
    fileTransfer.downloadFileClient(response, filePath, request.params.filename)
})



app.listen(80, '0.0.0.0', () => { console.log("Listening on port 80") })