import express from 'express'
import { FileTransferFactory } from '../lib/fileTransfer/transfer.js'
import busboy from 'busboy'


export default function getFileTransferRouter(fileTransfer : FileTransferFactory ,maxFileTransferSpeed = 8e+7)
{
    const router = express.Router()


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

    return router
}