import express from 'express'
import ws from 'ws'
import nodefetch from 'node-fetch'
import {Aria2Helper} from '../lib/fileTransfer/aria2Helper.mjs'


const aria2cOptions = {
    WebSocket: ws, fetch: nodefetch, host: 'localhost',
    port: 6800,
    secure: false,
    secret: '',
    path: '/jsonrpc'
}
const aria2c = new Aria2Helper(aria2cOptions)
const ariaRouter = express.Router()
const userDir = 'downloadables'


ariaRouter.post("/downloadFileServer", async (request, response)=>{
    const {uri} = request.body
    const guid =  await aria2c.downloadWithURI([uri], userDir)
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

ariaRouter.get("/cancelDownload/:guid", async (request, response)=>{
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

ariaRouter.get("/pauseDownload/:guid", async (request, response)=>{
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

ariaRouter.get("/resumeDownload/:guid", async (request, response)=>{
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

export { ariaRouter, aria2c }