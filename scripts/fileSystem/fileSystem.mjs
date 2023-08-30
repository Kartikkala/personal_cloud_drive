import fs from 'fs'
import path from 'path';

export class FileManager{
    #targetPath = undefined;
    constructor(path)
    {
        if(!fs.existsSync(path))
        {
            fs.mkdir(path, (err)=>{
                throw new Error(err)
            })
        }
        this.#targetPath = path;
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
