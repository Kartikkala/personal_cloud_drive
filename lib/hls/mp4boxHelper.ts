import Queue from './queue.js'
import {createReadStream, createWriteStream} from 'fs'
import { Readable, Transform, Writable } from 'stream'
import child from 'child_process'
import crypto from 'crypto'


export default class Mp4Box{
    private n_processes : number = 0
    private videoFormats = ['.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm']
    private max_process : number
    private process_queue : Queue<Readable>
    constructor(maxNumberOfProcess : number)
    {
        this.max_process = maxNumberOfProcess
        try {
            const version = child.execSync('MP4Box -version', { encoding: 'utf-8' }).trim();
            console.log(`MP4Box Version: ${version}`);
            this.process_queue = new Queue()
        } catch (error) {
            console.error('MP4Box is not installed or not found in PATH.');
            process.exit(-1);
        }
    }

    

    private isVideo(filename : string) : boolean
    {
        for(let i=0;i<this.videoFormats.length;i++)
        {
            const format = this.videoFormats[i]
            if(filename.endsWith(format))
            {
                return true
            }
        }
        return false
    }

    private createNamedFifoPipe() : string
    {
        const fifoPath = `/tmp/${crypto.randomUUID()}.mp4`
        child.execSync(`mkfifo ${fifoPath}`)
        return fifoPath
    }
    // Using nodejs streams with this bullshit is not possible, try to use normal filepaths if still insisting on using mp4box
    public fragmentMP4(filename : string, inputStream : Readable & {truncated? : Boolean}) : Promise<Readable & {truncated? : Boolean}> | null
    {
        // Implement edge cases like truncated streams etc.
        if(!this.isVideo(filename))
        {
            console.log('Not a video. Skipping!')
            return null
        }
        this.process_queue.enqueue(inputStream)
        console.log(inputStream, " enqued!")

        if(this.n_processes >= this.max_process)
        {
            return null;
        }
        const filesToProcess = this.process_queue.dequeue()
        if(filesToProcess)
        {
            const fifoPath = this.createNamedFifoPipe()
            if(!filesToProcess.data)
            {
                console.error("Error processsing mp4 file! Invalid input stream.")
                return null;
            }
            const fifoStream = createWriteStream(fifoPath)
            const mp4box = child.spawn("MP4Box", [
                "-dash", "1000",
                "-rap", "-frag-rap",
                fifoPath,
                "-std"
              ]);

            this.n_processes++;
            filesToProcess.data.pipe(fifoStream).on("finish", ()=>{
                fifoStream.end()
            })

            return new Promise<Readable & { truncated?: Boolean }>((resolve, reject) => {
                fifoStream.on("open", ()=>{
                    console.log("Open")
                })
                fifoStream.on("finish", () => {

                  mp4box.stdout.on("data", (data)=>{
                    console.log('Mp4box processing!')
                  })
          
                  mp4box.stderr.on("data", (data) => {
                    console.error(`stderr: ${data}`);
                  });
          
                  mp4box.on("close", (code) => {
                    this.n_processes--;
                    if (code !== 0) {
                      console.error(`MP4Box exited with code ${code}`);
                      reject(null);
                    }
                  });
          
                  // Return stdout as the readable stream with `truncated`
                  resolve(Object.assign(mp4box.stdout, { truncated: inputStream.truncated }));
                });
          
                fifoStream.on("error", (err) => {
                  console.error("FIFO stream error:", err);
                  reject(null);
                });
              });

              
            
        }
        else{
            console.log("No file to process!")
        }
        return null
    }
}