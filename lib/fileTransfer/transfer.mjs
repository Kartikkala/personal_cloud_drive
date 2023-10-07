import fs from 'fs'
import util from 'util'
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
        let fileStats = undefined
        try{
            fileStats = await statAsync(filePath)
            console.log("File size in bytes: "+fileStats.size)
            const throttle = new Throttle({rate: 8e+7})
            const readableStream = fs.createReadStream(filePath, {'highWaterMark': 4e+7})
            let headers = {'Content-Type':'application/octet-stream', 'Content-Disposition':`attachment;filename="${suggestedFileName}"`,'Content-Length':fileStats.size}
            response.writeHead(200, headers)
            readableStream.pipe(throttle).pipe(response)
            readableStream.on('close', ()=>console.log(`File ${filePath} has been downloaded`))
            return
        }
        catch(err){
            if(err){
                response.status(404).send("Error, requested resource not found!!!")
                return
            }
        }
    }
}
