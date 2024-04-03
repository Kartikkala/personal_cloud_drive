import express from 'express'
import ws from 'ws'
import nodefetch from 'node-fetch'
import path from 'path'
import {Aria2Helper} from '../lib/fileTransfer/aria2Helper.mjs'
import Aria2 from 'aria2'
import {aria2_configs} from "../configs/app_config.js"
import { app_configs } from '../configs/app_config.js'
import {getInactiveDownloads} from '../lib/authentication/utils/userInfoUtils.mjs'


const aria2cOptions = {
    WebSocket: ws, fetch: nodefetch, host: aria2_configs.host,
    port: aria2_configs.port,
    secure: aria2_configs.secure,
    secret: aria2_configs.secret,
    path: aria2_configs.path,
}
const aria2Client = new Aria2(aria2cOptions, aria2_configs.downloadStatusUpdateDurationInSeconds)
const aria2c = new Aria2Helper(aria2Client)
const ariaRouter = express.Router()
// Get each user's dir and download in that dir
const rootDir = path.resolve(app_configs.rootPath)
const responseObject = {
    "guid" : undefined,
    "valid" : false, 
    "active": false,
    "exception" : null
}

const failedResponseObject = {
    "valid" : false, 
    "active": false,
    "exception" : null
}


ariaRouter.post("/downloadFileServer", async (request, response)=>{
    const user = request.user
    const {uri} = request.body
    const userDir = path.join(rootDir, user.userDir, aria2_configs.downloads_dir)
    let guid = undefined

    try{
        guid =  await aria2c.downloadWithURI([uri], user, userDir)
    }
    catch(exception)
    {
        responseObject.exception = exception.message
        failedResponseObject.exception = exception.message
    }
    if(guid === undefined)
    {
        response.json(failedResponseObject)
    }
    else{
        responseObject.guid = guid
        responseObject.valid = true
        responseObject.exception ? responseObject.active = false : responseObject.active = true
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