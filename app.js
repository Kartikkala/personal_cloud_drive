// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url';

// User defined modules

import { FileManager } from './scripts/fileSystem/fileSystem.mjs'
import { FileTransfer } from './scripts/fileTransfer/transfer.mjs'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")
const downloadDirName = 'downloadables'
const targetVolume = path.join(__dirname, downloadDirName)
const maxFileTransferSpeed = 8e+7

// Object creations and initializations

export const app = express()
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

const port = process.env.NODE_ENV === 'test'? 8000 : 80

export const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port 80...") })