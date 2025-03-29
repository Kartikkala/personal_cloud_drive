import { Throttle } from 'stream-throttle'
import { NFileObjectManager } from '../../../types/lib/fileSystem/types.js'
import { Readable } from 'stream'
import Mp4Box from '../../hls/mp4boxHelper.js'

interface IFileUploadResult
{
    permission : boolean,
    success : boolean,
    limitReached : boolean
}

export class ClientFileTransfer
{
    private fileManagerObject : NFileObjectManager.IFileObjectManager
    private mp4box
    constructor(fileManagerObject : NFileObjectManager.IFileObjectManager, mp4box : Mp4Box)
    {
        this.fileManagerObject = fileManagerObject
        this.mp4box = mp4box
    }
    public async downloadFile(email : string, filePath : string, downloadRate? : number) : Promise<Throttle | undefined>
    {
        try{
            const resource = await this.fileManagerObject.getReadStream(email, filePath)
            if(resource)
            {
                // Maybe implement your own throttling mechanism
                const throttle = new Throttle({rate: downloadRate || 8e+7})
                throttle.on("error", (e)=>{
                    throttle.destroy(e)
                    resource.destroy(e)
                    console.error(e)
                })
                return resource.pipe(throttle)
            }
        }
        catch(err){
            if(err){
                console.error("Requested resource not found, could not initiate download")
            }
        }
        return undefined
    }

    public async uploadFile(email : string, fileName : string, file : Readable & {truncated? : Boolean}, fileSize : number ,uploadRate? : number) : Promise<IFileUploadResult>
    {
        // TODO : Add progress of the upload and ETA as well
        const result = {
            permission : false,
            success : false,
            limitReached : false
        }
        let error = false
        try{
            // Get resource size here
            const resource = await this.fileManagerObject.getWriteStream(email,  `/${fileName}`, fileSize)
            if(resource)
            {
                result.permission = true
                const mp4boxStream = await this.mp4box.fragmentMP4(fileName, file)
                console.log("Mp4boxstream : ", mp4boxStream)
                await new Promise<void>((resolve, reject) =>{
                    const throttle = new Throttle({rate : uploadRate || 8e+7})

                    // Pipe the stream through a stats stream that you will define
                    // so that the streams will get destroyed if specified limit reaches
                    file.on('error', (e)=>{
                        resource.destroy()
                        file.destroy()
                        error = true
                        console.error(e)
                        reject()
                    })
                    file.on("end", ()=>{
                        if(file.truncated)
                        {
                            result.limitReached = true
                            resolve()
                        }
                        else{
                            resolve()
                        }
                        result.success = !error && !result.limitReached
                    })

                    
                    
                    if(mp4boxStream)
                    {
                        console.log('I ran')
                        mp4boxStream.pipe(throttle).pipe(resource)
                    }
                    else{
                        console.log("Else ran!")
                        file.pipe(throttle).pipe(resource)
                    }
                })
            }
        }
        catch(e)
        {
            console.error(e)
            console.error('Error while uploading file on server')
        }
        return result
    }
}
