import express from 'express'
import { FileTransferFactory } from '../lib/fileTransfer/transfer.js'
import DatabaseFactory from '../lib/db/database.js'
import { fileManagerMiddleware } from './filesystemRoutes.mjs'
import busboy from 'busboy'

const fileTransferRouter = express.Router()

const maxFileTransferSpeed = 8e+7
const database = DatabaseFactory.getInstance().getInactiveDownloadsDatabase()
const fileTransfer = await FileTransferFactory.getInstance(database, fileManagerMiddleware.fileManager)

fileTransferRouter.post("/downloadFileClient", async (request, response) => {
    if(!request.user)
    {
        return response.send("Unauthorized")
    }
    const filePath = request.body.targetPath
    const fileStream = await fileTransfer.client.downloadFile(request.user.email, filePath, maxFileTransferSpeed)
    if(fileStream)
    {
        return fileStream.pipe(response)
    }
    return response.send("Permission denied / error / path does not exist")
})

fileTransferRouter.post("/uploadFile", async(request, response)=>{
    if(!request.user)
    {
        return response.send("Unauthorized")
    }
    // console.log(request.headers)
    if(!request.headers.filesize || Array.isArray(request.headers.filesize))
    {
        return response.send('Invalid fileSize header')
    }
    const email = request.user.email
    const fileSize = parseInt(request.headers.filesize)
    const bb = busboy({headers : request.headers, limits : {fileSize : fileSize}})
    bb.on('file', async (name, file, info)=>{
        const { filename, encoding, mimeType } = info
        let result = await fileTransfer.client.uploadFile(email, filename, file, fileSize)
        response.send(result)
    })

    request.pipe(bb)
})

export {fileTransferRouter, fileTransfer}