import express from 'express'
import { FileTransferFactory } from '../lib/fileTransfer/transfer.js'
import busboy from 'busboy'
import VideoStreaming from '../lib/http-streaming/streaming.js'
import { NFileObjectManager } from '../types/lib/fileSystem/types.js'


export default function getFileTransferRouter(fileTransfer : FileTransferFactory, fileManager : NFileObjectManager.IFileObjectManager ,maxFileTransferSpeed = 8e+7)
{
    const router = express.Router()
    const streamer = new VideoStreaming(fileManager)


    router.post("/downloadFileClient", async (request, response) => {
        if(!request.user)
        {
            return response.status(401).send("Unauthorized")
        }
        const filePath = request.body.targetPath
        const fileStream = await fileTransfer.client.downloadFile(request.user.email, filePath, maxFileTransferSpeed)
        if(fileStream)
        {
            return fileStream.pipe(response)
        }
        return response.status(404).send("Permission denied / error / path does not exist")
    })
    
    router.post("/uploadFile", async(request, response)=>{
        if(!request.user)
        {
            return response.status(401).send("Unauthorized")
        }
        if(!request.headers.filesize || Array.isArray(request.headers.filesize))
        {
            return response.status(400).send('Invalid fileSize header')
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
    
    router.get('/stream/:filepath', async (request, response)=>{
        const user = request.user
        if(user)
        {   
            const streamObject = await streamer.stream(user.email, request.params.filepath, request.headers)
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
    return router
}