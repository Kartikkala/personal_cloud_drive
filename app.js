// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'
import nodefetch from 'node-fetch'

// User defined modules

import { FileManager } from './scripts/fileSystem/fileSystem.mjs'
import { FileTransfer } from './scripts/fileTransfer/transfer.mjs'
import {Aria2Helper} from './scripts/fileTransfer/aria2Helper.mjs'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")
const downloadDirName = 'downloadables'
const targetVolume = path.join(__dirname, downloadDirName)
const maxFileTransferSpeed = 8e+7
const aria2cOptions = {
    WebSocket: ws, fetch: nodefetch, host: 'localhost',
    port: 6800,
    secure: false,
    secret: '',
    path: '/jsonrpc'
}

// Object creations and initializations

export const app = express()
export const aria2c = new Aria2Helper(aria2cOptions)
const fileTransfer = new FileTransfer(targetVolume, maxFileTransferSpeed, aria2cOptions)
const fileObject = new FileManager(targetVolume)

app.disable('x-powered-by')
app.use(express.json())

// Route handling

app.use("/", express.static(frontendApp))

app.get("/downloads", (request, response) => {
    // Change this to await 

    fileObject.getFileStatsInDirectory().then((statObject)=>
    {
        response.send(statObject)
    })
    .catch((error)=>{
        console.log(error)
        response.send(["error: "+error])
    })
})


app.get("/downloadFileClient/:filename", (request, response) => {
    let filePath = path.join(targetVolume, request.params.filename)
    fileTransfer.downloadFileClient(response, filePath, request.params.filename)
})

app.post("/downloadFileServer", async (request, response)=>{
    const {uri} = request.body
    const guid =  await aria2c.downloadWithURI([uri], downloadDirName)
    if(guid === undefined)
    {
        console.log("Hey, I am in if")
        response.status(500).send("<h1>Internal server Error</h1>")
    }
    else{
        response.send({"guid" : guid,
        "active": true,
        "waiting": false})
    }
})

app.get("/cancelDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.cancelDownload(guid) === undefined)
    {
        response.status(500).send("<h1>Internal server Error</h1>")
    }
    else{
        response.send({"guid" : guid,
                        "active": false,
                        "waiting": false})
    }
})

app.get("/pauseDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.pauseDownload(guid) === undefined){
        response.status(500).send("<h1>Internal server Error</h1>")
    }
    else{
        response.send({"guid" : guid,
                        "active": false,
                        "waiting": true})
    }
})

app.get("/resumeDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.resumeDownload(guid) === undefined){
        response.status(500).send("<h1>Internal server Error</h1>")
    }
    else{
        response.send({"guid" : guid,
                        "active": true,
                        "waiting": false})
    }
})


const port = process.env.NODE_ENV === 'test'? 8000 : 80

export const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })