import express from 'express'
import ws from 'ws'
import nodefetch from 'node-fetch'
import path from 'path'
import {Aria2Helper} from '../lib/fileTransfer/aria2Helper.mjs'
import {aria2_configs} from "../configs/app_config.js"
import {getInactiveDownloads} from '../lib/authentication/utility.mjs'


const aria2cOptions = {
    WebSocket: ws, fetch: nodefetch, host: aria2_configs.host,
    port: aria2_configs.port,
    secure: aria2_configs.secure,
    secret: aria2_configs.secret,
    path: aria2_configs.path
}
const aria2c = new Aria2Helper(aria2cOptions)
const ariaRouter = express.Router()
const userDir = path.resolve('./downloadables')


ariaRouter.post("/downloadFileServer", async (request, response)=>{
    const user = request.user
    const {uri} = request.body
    const guid =  await aria2c.downloadWithURI([uri], user, userDir)
    if(guid === undefined)
    {
        response.status(500).json({"error" : true, "reason": "Internal aria2 API error!!!"})
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
        response.status(500).json({"error" : true, "reason": "Internal aria2 API error!!!"})
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
        response.status(500).json({"error" : true, "reason": "Internal aria2 API error!!!"})
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
        response.status(500).json({"error" : true, "reason": "Internal aria2 API error!!!"})
    }
    else{
        response.send({"guid" : guid,
                        "active": true,
                        "waiting": false})
    }
})

ariaRouter.get("/getInactiveDownloads", async (request, response)=>{
    const user = request.user
    const inactiveDownloads = await getInactiveDownloads(user._id)
    const inactiveDownloadsStatus = await aria2c.getUserDownloadStatus(inactiveDownloads, ["status","errorCode","errorMessage","files"])
    console.log(inactiveDownloadsStatus)
    if(inactiveDownloadsStatus)
    {
        response.json(inactiveDownloadsStatus)
    }
    else
    {
        response.json({"message": "No inactive downloads or failed to fetch inactive downloads!"})
    }
})

export { ariaRouter, aria2c }