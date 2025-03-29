import {IncomingHttpHeaders} from "http"
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { IVideoStreamResult } from "../../types/lib/http-streaming/types.js";
import { NFileObjectManager } from "../../types/lib/fileSystem/types.js";

export default class FfmpegHelper
{
    private _fileManager
    private videoFormats = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm']
    constructor(fileManager : NFileObjectManager.IFileObjectManager)
    {
        this._fileManager = fileManager
        
    }

    private isVideo(filename : string) : boolean
    {
        this.videoFormats.forEach((format)=>{
            if(filename.endsWith(format))
            {
                return true
            }
        })
        return false
    }

    public async makeStreamable(email : string, targetPath : string){
        const permission = await this._fileManager.checkPermission(email, targetPath)
        if(permission && permission.permission && permission.fileName && this.isVideo(permission.fileName)){
            ffmpeg.ffprobe(path.join(permission.dirName,permission.fileName), (err, data)=>{
                if(err)
                {
                    return console.error(err)
                }

                if(data.format && data.format.start_time === 0)
                {
                    console.log("moov box is at start. No changes required.")
                }
                else{
                    const fileName = permission.fileName as string
                    const filenameArray = fileName.split('.')
                    const fileExtenstion = filenameArray[filenameArray.length - 1]
                    const newFileName = (path.basename(fileName, fileExtenstion)).concat('_streamable.').concat(fileExtenstion)
                    
                    ffmpeg(path.join(permission.dirName, permission.fileName as string))
                    .outputOptions('-movflags faststart')
                    .outputOptions('-c copy')
                    .on('end', ()=>{
                        console.log('MP4 optimized for streaming!');
                    })
                    .on('error', (err)=>{
                        console.error('Error in ffmpeg makeStreamable():\n\n', err)
                    })
                    .save(path.join(permission.dirName, newFileName))
                }
            })
        }
    }


    public async convertToHls(email : string, targetPath : string)
    {
        
    }

    public async appendHlsMetadata()
    {

    }

    public async checkHlsMetadata()
    {
         
    }
}