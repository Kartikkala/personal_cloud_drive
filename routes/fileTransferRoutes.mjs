import express from 'express'
import { FileTransferFactory } from '../lib/fileTransfer/transfer.js'
import DatabaseFactory from '../lib/db/database.js'
import { fileManagerMiddleware } from './filesystemRoutes.mjs'
import busboy from 'busboy'
import { videoStream } from '../lib/http-streaming/streaming.js'

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

fileTransferRouter.post('/stream', async (request, response)=>{
    const user = request.user
    if(user)
    {   
        const streamObject = await videoStream(user.email, request.body.filepath, request.headers)
        if(streamObject)
        {
            if(streamObject.start !== undefined && streamObject.end !==undefined)
            {
                if(streamObject.size && streamObject.stream)
                {
                    const start = streamObject.start
                    const end = Math.min(streamObject.end, streamObject.size-1)
                    const headers = {
                        "Content-Range" : `bytes ${start}-${end}/${streamObject.size}`,
                        "Accept-Ranges" : "bytes",
                        "Content-Length" : end-start+1,
                        "Content-Type" : "video/mp4",
                    }
                    response.writeHead(206, headers)
                    streamObject.stream.pipe(response)
                }
                else{
                    return response.status(404).send("The requested resource was not found")
                }
            }
            else{
                return response.status(400).send("Incorrect range headers syntax")
            }
        }
        else{
            return response.status(400).send("Range headers not present")
        }
    }
    else{
        return response.status(401).send("Unauthorized")
    }
})

export {fileTransferRouter, fileTransfer}