import express from 'express'
import { IAria2Helper } from '../types/lib/fileTransfer/serverFileTransfer/types.js'


export default function getAria2Router(aria2Client: IAria2Helper) {
    const ariaRouter = express.Router()

    const responseObject = {
        "guid": '',
        "valid": false,
        "active": false,
        "exception": false
    }

    const failedResponseObject = {
        "valid": false,
        "active": false,
        "exception": false
    }
    ariaRouter.post("/downloadFileServer", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const { uri } = request.body
        if (!uri) {
            return response.json({ "valid": false, "error": true })
        }
        const res = await aria2Client.downloadWithURI(user.email, uri, '/')
        response.send(res)


    })

    ariaRouter.post("/downloadFileTorrent", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const { torrentFilePath } = request.body
        if (!torrentFilePath) {
            return response.json({ "valid": false, "error": true })
        }

        let result = await aria2Client.downloadWithTorrent(user.email, torrentFilePath, '/Downloads')
        response.send(result)
    })

    ariaRouter.get("/cancelDownload/:guid", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const guid = request.params.guid
        if ((await aria2Client.cancelDownload(user.email, guid)) === undefined) {
            return response.json(failedResponseObject)
        }
        else {
            responseObject.guid = guid
            responseObject.valid = true
            responseObject.active = false
            return response.json(responseObject)
        }
    })

    ariaRouter.get("/pauseDownload/:guid", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const guid = request.params.guid
        if (await aria2Client.pauseDownload(user.email, guid) === undefined) {
            return response.json(failedResponseObject)
        }
        else {
            responseObject.guid = guid
            responseObject.valid = true
            responseObject.active = false
            return response.json(responseObject)
        }
    })

    ariaRouter.get("/resumeDownload/:guid", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const guid = request.params.guid
        if (await aria2Client.resumeDownload(user.email, guid) === undefined) {
            return response.json(failedResponseObject)
        }
        else {
            responseObject.guid = guid
            responseObject.valid = true
            responseObject.active = true
            return response.json(responseObject)
        }
    })

    ariaRouter.get("/getInactiveDownloads", async (request, response) => {
        const user = request.user
        if (!user) {
            return response.send("Unauthorized")
        }
        const inactiveDownloads = await aria2Client.getInactiveDownloads(user.email)
        if (inactiveDownloads) {
            response.json(inactiveDownloads)
        }
        else {
            response.json({ "message": "No inactive downloads or failed to fetch inactive downloads!" })
        }
    })

    return ariaRouter

}
