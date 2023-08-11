const express = require('express');
const fs = require("fs");
const util = require('util')
const {Throttle} = require('stream-throttle')

const statAsync = util.promisify(fs.stat)

const path = require('path');
const app = express();

app.disable('x-powered-by');

const downloadDir = 'downloadables';
const downloadSiteName = path.join(__dirname, "/static/", "/downloadingWebsite/");
const targetVolume = path.join(__dirname, downloadDir);


class fileManager{
    #targetPath = undefined;
    setTargetPath(path)
    {
        if(typeof path == "string" && fs.existsSync(path))
        {
            this.#targetPath = path;
        }
        else
        {
            console.log("Error!!! Invalid Path...");
        }
        return;
    }
    getTargetPath()
    {
        return this.#targetPath;
    }
    getDirectoryContents()
    {
        if(this.#targetPath == undefined)
        {
            console.log("Error target path is not set!!!");
            return [];
        }
        
        return new Promise((resolve, reject)=>
        {
            fs.readdir(this.#targetPath, (err, files)=>{
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve(files);
                }
            })
        })
    }
    getFileStats(fileName)
    {
        if(this.#targetPath == undefined)
        {
            console.log("Error target path is not set!!!");
            return {};
        }
        return new Promise((resolve, reject)=>{
            let filePath = path.join(this.#targetPath, fileName);
            if(!fs.existsSync(filePath))
            {
                let error = "File: "+filePath+" does not exist";
                reject(error);
            }
            fs.stat(filePath, (error, stats)=>
            {
                if(error)
                {
                    reject(error);
                }
                else
                {
                    resolve(stats);
                }
            })
        })
    }
    getFileStatsInDirectory()
    {
        let statObject = {};
        if(this.#targetPath == undefined)
        {
            console.log("Error target path is not set!!!");
            return {};
        }
        return new Promise((resolve, reject)=>{
            this.getDirectoryContents().then((files)=>
            {
                const fileStatsPromises = files.map(file => {
                    let filePath = path.join(this.#targetPath, file);
                    if(!fs.existsSync(filePath))
                    {
                        let error = "File: "+filePath+" does not exist";
                        reject(error);
                    }
                    return new Promise((resolve, reject) => {
                        fs.stat(filePath, (error, stats)=>
                        {
                            if(error)
                            {
                                reject(error);
                            }
                            else
                            {
                                statObject[file] = stats;
                                resolve();
                            }
                        })
                    });
                });
                Promise.all(fileStatsPromises).then(() => {
                    resolve(statObject);
                }).catch((error) => {
                    reject(error);
                });
            });
        });
    }

    isDirectory(fileName)
    {
        if(this.#targetPath == undefined)
        {
            console.log("Error target path is not set!!!");
            return {};
        }
        let filePath = path.join(this.#targetPath, fileName);
        if(fs.existsSync(filePath))
        {
            return fs.statSync(filePath).isDirectory();
        }
    }
    isFile(fileName)
    {
        if(this.#targetPath == undefined)
        {
            console.log("Error target path is not set!!!");
            return {};
        }
        let filePath = path.join(this.#targetPath, fileName);
        if(fs.existsSync(filePath))
        {
            return fs.statSync(filePath).isFile();
        }
    }
}

function downloadFile(response, filePath, suggestedFileName, size)
{
    const throttle = new Throttle({rate: 2e+7})
    const readableStream = fs.createReadStream(filePath, {'highWaterMark': 120000})
    let headers = {'Content-Type':'application/octet-stream', 'Content-Disposition':`attachment;filename="${suggestedFileName}"`,'Content-Length':size}
    response.writeHead(200, headers)
    readableStream.pipe(throttle).pipe(response)
    readableStream.on('close', ()=>console.log(`File ${filePath} has been downloaded`))
}


const fileObject = new fileManager;
fileObject.setTargetPath(targetVolume);

app.use("/", express.static(downloadSiteName));
app.get("/downloads", (request, response) => {
    fileObject.getFileStatsInDirectory().then((statObject)=>
    {
        // let responseString = JSON.stringify(statObject);
        response.send(statObject);
    })
    .catch((error)=>{
        console.log(error);
        response.send(["error: "+error]);
    })
})



app.get("/downloadFile/:filename", async (request, response) => {
    filename = request.params.filename
    let filePath = path.join(targetVolume, filename)
    let fileStats = await statAsync(filePath)
    let fileSize = fileStats.size
    console.log(fileSize)
    downloadFile(response, filePath, request.params.filename, fileSize)
})



app.listen(80, '0.0.0.0', () => { console.log("Listening on port 80"); });