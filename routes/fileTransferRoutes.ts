import express, { response } from 'express'
import { FileTransferFactory } from '../lib/fileTransfer/transfer.js'
import busboy from 'busboy'
import VideoStreaming from '../lib/http-streaming/streaming.js'
import { NFileObjectManager } from '../types/lib/fileSystem/types.js'
import Mp4Box from '../lib/hls/mp4boxHelper.js'


export default function getFileTransferRouter(fileTransfer : FileTransferFactory, fileManager : NFileObjectManager.IFileObjectManager,mp4box : Mp4Box ,maxFileTransferSpeed = 8e+7)
{
    const router = express.Router()
    const streamer = new VideoStreaming(fileManager)


    router.post("/downloadFileClient", async (request, response) => {
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

    
    router.get("/uploadFile", async(request, response)=>{
        console.log("Upload GET route called!")
        if(!request.user)
        {
            return response.send("Unauthorized")
        }
        if(!request.headers.filesize || Array.isArray(request.headers.filesize))
        {
            return response.send('Invalid fileSize header')
        }
        const email = request.user.email
        const fileSize = parseInt(request.headers.filesize)
        const limit = await fileManager.checkSpaceAvailability(email, fileSize)
        return response.json({
            limitReached : !limit
        })
        
    })

    router.post("/uploadFile", async(request, response)=>{
        console.log("Upload route called!")
        if(!request.user)
        {
            return response.send("Unauthorized")
        }
        if(!request.headers.filesize || Array.isArray(request.headers.filesize))
        {
            return response.send('Invalid fileSize header')
        }
        const email = request.user.email
        const fileSize = parseInt(request.headers.filesize)
        console.log(fileSize)
        if(!await fileManager.checkSpaceAvailability(email, fileSize))
        {
            return response.json({
                success : false,
                limitReached : true
            })
        }
        const bb = busboy({headers : request.headers, limits : {fileSize : fileSize+1}})

        bb.on("file", async (name, file, info) => {
            const { filename } = info;
            try {
                const result = await fileTransfer.client.uploadFile(email, filename, file, fileSize);
                return response.json(result)
            } catch (err) {
                console.error("Error in file upload:", err);
            }
        });

    
        request.pipe(bb)
    })
    
    router.post('/stream', async (request, response)=>{
        const user = request.user
        if(user)
            {   
            const streamObject = await streamer.stream(user.email, request.body.filepath, request.headers)
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
                            "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length"
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