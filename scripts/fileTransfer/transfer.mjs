import fs from 'fs'
import util from 'util'
// import path from 'path'
// import { Aria2Helper } from './aria2Helper.mjs'
import { Throttle } from 'stream-throttle'
const statAsync = util.promisify(fs.stat)


export class FileTransfer
{
    constructor(targetDirectory, maxTransferSpeed)
    {
        this.targetDirectory = targetDirectory
        this.transferSpeed = maxTransferSpeed
    }
    async downloadFileClient(response, filePath, suggestedFileName)
    {
        let fileStats = await statAsync(filePath)
        let fileSize = fileStats.size
        const throttle = new Throttle({rate: 8e+7})
        const readableStream = fs.createReadStream(filePath, {'highWaterMark': 4e+7})
        let headers = {'Content-Type':'application/octet-stream', 'Content-Disposition':`attachment;filename="${suggestedFileName}"`,'Content-Length':fileSize}
        response.writeHead(200, headers)
        readableStream.pipe(throttle).pipe(response)
        readableStream.on('close', ()=>console.log(`File ${filePath} has been downloaded`))
        return
    }
}
