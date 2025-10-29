import ffmpeg from 'fluent-ffmpeg'
import { spawn } from "child_process";
import path from 'path'
import { fileTypeFromFile } from "file-type";
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

    public async makeStreamableHls(email : string, targetPath : string){
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


    public async isFragmented(filepath: string) {
        return new Promise((resolve, reject) => {
            const process = spawn(
                `ffprobe -loglevel trace -hide_banner -select_streams v:0 ${filepath} 2>&1 | grep -q "frag flags" && echo true || echo false`,
                { shell: true }
            );

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                const output = stdout.trim();
                if (output === 'true') {
                    resolve(true);
                } else if (output === 'false') {
                    resolve(false);
                } else {
                    reject(new Error(`Unexpected output: ${output}\n${stderr}`));
                }
            });

            process.on('error', (err) => {
                reject(err);
            });
        });
    }

    private async fragmentMp4(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', inputPath,
                '-c:v', 'copy',
                '-c:a', 'copy',
                '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
                outputPath
            ]);

            ffmpeg.stderr.on('data', data => {
                process.stderr.write(data);
            });

            ffmpeg.on('close', code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });

            ffmpeg.on('error', err => {
                reject(err);
            });
        });
    }



    public async makeStreamable(email: string, filepath: string) : Promise<void>{
        const filePermissionObject = await this._fileManager.checkPermission(email, filepath)
        if(filePermissionObject?.permission && filePermissionObject.pathExists && !filePermissionObject.exception && filePermissionObject.fileName)
        {
            const fullFilePath = path.join(filePermissionObject.dirName, filePermissionObject.fileName)
            const type = await fileTypeFromFile(fullFilePath)
            if (!type?.mime?.startsWith("video/")) {
                const error = new Error()
                error.message = "INVALID_FILE_TYPE"
                throw error;
            }
            
            if (!(await this.isFragmented(fullFilePath))) {
                console.log("This is not fragmented. Fragmenting....")
                const fileNameArray = filePermissionObject.fileName.split(".")
                fileNameArray.pop()
                await this.fragmentMp4(fullFilePath, path.join(filePermissionObject.dirName, fileNameArray.toString().concat("_streamable").concat(".mp4")))
                const result = await this._fileManager.delete(email, [filepath])
                if(result)
                {
                    if(result[0].error)
                        throw new Error(result[0].error)
                }

            }
        }
    }
}