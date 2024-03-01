import express from 'express'
import ws from 'ws'
import nodefetch from 'node-fetch'
import path from 'path'
import {Aria2Helper} from '../lib/fileTransfer/aria2Helper.mjs'
import {aria2_configs} from "../configs/app_config.js"
import { file_manager_configs } from '../configs/app_config.js'
import {getInactiveDownloads, getUserDir} from '../lib/authentication/utils/userInfoUtils.mjs'


const aria2cOptions = {
    WebSocket: ws, fetch: nodefetch, host: aria2_configs.host,
    port: aria2_configs.port,
    secure: aria2_configs.secure,
    secret: aria2_configs.secret,
    path: aria2_configs.path,
    downloadStatusUpdateDuration : aria2_configs.downloadStatusUpdateDurationInSeconds * 1000
}
const aria2c = new Aria2Helper(aria2cOptions)
const ariaRouter = express.Router()
// Get each user's dir and download in that dir
const rootDir = path.resolve(file_manager_configs.rootPath)
const responseObject = {
    "guid" : undefined,
    "valid" : false, 
    "active": false,
}

const failedResponseObject = {
    "valid" : false, 
    "active": false,
}


ariaRouter.post("/downloadFileServer", async (request, response)=>{
    const user = request.user
    const {uri} = request.body
    const userDir = path.join(rootDir, await getUserDir(user._id), aria2_configs.downloads_dir)

    const guid =  await aria2c.downloadWithURI([uri], user, userDir)
    if(guid === undefined)
    {
        response.json(failedResponseObject)
    }
    else{
        responseObject.guid = guid
        responseObject.valid = true
        responseObject.active = true
        response.send(responseObject)
    }
})

ariaRouter.get("/cancelDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.cancelDownload(guid) === undefined)
    {
        response.json(failedResponseObject)
    }
    else{
        responseObject.guid = guid
        responseObject.valid = true
        responseObject.active = false
        response.json(responseObject)
    }
})

ariaRouter.get("/pauseDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.pauseDownload(guid) === undefined){
        response.json(failedResponseObject)
    }
    else{
        responseObject.guid = guid
        responseObject.valid = true
        responseObject.active = false
        response.json(responseObject)
    }
})

ariaRouter.get("/resumeDownload/:guid", async (request, response)=>{
    const guid = request.params.guid
    if(await aria2c.resumeDownload(guid) === undefined){
        response.json(failedResponseObject)
    }
    else{
        responseObject.guid = guid
        responseObject.valid = true
        responseObject.active = true
        response.json(responseObject)
    }
})

ariaRouter.get("/getInactiveDownloads", async (request, response)=>{
    const user = request.user
    const inactiveDownloads = await getInactiveDownloads(user._id)
    const inactiveDownloadsStatus = await aria2c.getUserDownloadStatus(inactiveDownloads, ["status","errorCode","errorMessage","files"])
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