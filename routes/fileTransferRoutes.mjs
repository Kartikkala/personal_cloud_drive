import express from 'express'
import path from 'path'
import { FileTransfer } from '../lib/fileTransfer/transfer.mjs'
import { fileObject } from './filesystemRoutes.mjs'

const fileTransferRouter = express.Router()

const targetVolume = path.resolve("../downloadables")
const maxFileTransferSpeed = 8e+7
const fileTransfer = new FileTransfer(targetVolume, maxFileTransferSpeed)


fileTransferRouter.use("/downloadFileClient", await fileObject.checkPermissionMiddleware((request, response)=>{
    response.status(403).json({'permission':false})
}))

fileTransferRouter.post("/downloadFileClient", (request, response) => {
    const filePath = response.locals.resourceInfo.filePath
    fileTransfer.downloadFileClient(response, filePath, request.params.filename)
})

export {fileTransferRouter}