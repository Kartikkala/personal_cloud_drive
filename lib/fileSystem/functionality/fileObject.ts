import path from 'path'
import fs from 'fs/promises'
import filesystem, { ReadStream, WriteStream } from 'fs'
import { NFileObject } from '../../../types/lib/fileSystem/types.js'


export class FileObject implements NFileObject.IFileObject{
    private totalUserSpace:number = 0
    private userDirName :string
    private userDirMountPath: string
    private workingDir: string
    private usedDiskSpace : number
    private HOME_DIR : string
    constructor(userDirName: string, userDirMountPath: string, workingDir: string ,totalUserSpaceInBytes: number)
    {
        if(!userDirName || !userDirMountPath || !totalUserSpaceInBytes || !workingDir)
        {
            throw new Error("Invalid instance creation for file object")
        }

        this.workingDir = workingDir
        this.totalUserSpace = totalUserSpaceInBytes
        this.userDirName = userDirName
        this.userDirMountPath = userDirMountPath
        this.HOME_DIR = path.join(userDirMountPath, workingDir, userDirName)
        this.usedDiskSpace = filesystem.statSync(path.join(this.userDirMountPath, this.workingDir ,this.userDirName)).size

        this.getDirectoryContents = this.getDirectoryContents.bind(this)
        this.getResourceStats = this.getResourceStats.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.checkPermission = this.checkPermission.bind(this)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.changeTotalUserSpace = this.changeTotalUserSpace.bind(this)
        this.copy = this.copy.bind(this)
        this.move = this.move.bind(this)
        this.delete = this.delete.bind(this)
        this.updateUsedDiskSpace = this.updateUsedDiskSpace.bind(this)
        this.getCurrentUserDirSize = this.getCurrentUserDirSize.bind(this)
        this.getReadStream = this.getReadStream.bind(this)
        this.getWriteStream = this.getWriteStream.bind(this)
    }


    public getUserInfo() : NFileObject.IUserDiskStats
    {
        return {
            "USER_HOME" : this.HOME_DIR,
            "totalUserSpaceInBytes" : this.totalUserSpace, 
            "usedSpaceInBytes" : this.usedDiskSpace
        }
    }

    public updateUsedDiskSpace(spaceToAddInBytes : number) : boolean
    {
        if(this.usedDiskSpace + spaceToAddInBytes < this.totalUserSpace)
        {
            this.usedDiskSpace += spaceToAddInBytes
            return true
        } 
        return false
    }

    public changeTotalUserSpace(updatedTotalUserSpaceInBytes : number) : number
    {
        this.totalUserSpace = updatedTotalUserSpaceInBytes
        return updatedTotalUserSpaceInBytes
    }
    
    public async checkPermission(targetPath : string): Promise<NFileObject.IPermissionObject>{
        const permissionObject: NFileObject.IPermissionObject = {'permission': false, 'exception':false, 'pathExists':true, 'dirName' : '', 'fileName' : undefined}
        let fullPath : string
        try{
            let requestedPath : string = path.join(this.userDirMountPath, this.workingDir ,this.userDirName ,targetPath)
            if(targetPath.endsWith('/'))
            {
                permissionObject.dirName = requestedPath
            }
            else
            {
                const pathArray : Array<string> = requestedPath.split('/')
                const fileName : string | undefined = pathArray.pop()
                permissionObject.dirName = path.dirname(requestedPath)
                permissionObject.fileName = fileName
            }
            fullPath = path.normalize(requestedPath)
            permissionObject.permission = fullPath.startsWith(path.join(this.userDirMountPath, this.workingDir ,this.userDirName))
            permissionObject.pathExists = filesystem.existsSync(fullPath)
        }
        catch(exception){
            console.error("Exception occured while checking permission of requested path.")
            console.error(exception)
            permissionObject.exception = true
        }
        return permissionObject
    }

   
    public async getDirectoryContents(targetPath: string) : Promise<NFileObject.IContentObject>{
        const permissionObject : NFileObject.IPermissionObject = await this.checkPermission(targetPath)
        const contentObject: NFileObject.IContentObject = {...permissionObject, 'content':[]}
        if(permissionObject.permission && !permissionObject.fileName){
            try{
                const dir : string = permissionObject['dirName']
                contentObject.content = await fs.readdir(dir)
            }
            catch(exception){
                contentObject.exception = true
                console.error("Error retrieving directory contents!!!")
                console.error(exception)
            }
        }
        return contentObject
    }

    public async getResourceStats(targetPath : string) : Promise<NFileObject.IFileStats | null>
    {
        const permissionObject : NFileObject.IPermissionObject = await this.checkPermission(targetPath)
        if(permissionObject.permission && permissionObject.pathExists)
        {
            let resourceStat = undefined
            let basename = undefined
            if(permissionObject.fileName)
            {
                resourceStat = await fs.stat(path.join(permissionObject.dirName, permissionObject.fileName))
                basename = permissionObject.fileName
            }
            else{
                resourceStat = await fs.stat(permissionObject.dirName)
                basename = path.basename(permissionObject.dirName)
            }
            const statObject = {
                name : basename, 
                size : resourceStat.size, 
                birthtime : resourceStat.birthtime, 
                isDirectory : resourceStat.isDirectory(), 
                isFile : resourceStat.isFile()
            }
            return statObject
        }
        return null
    }


    public async getResourceStatsInDirectory(targetPath:string) : Promise<NFileObject.IContentStatsObject>
    {
        let stats : Array<NFileObject.IFileStats> = []
        const contentObject: NFileObject.IContentObject = await this.getDirectoryContents(targetPath)
        const directoryContents : Array<string> = contentObject.content
        try{
            for(let element of directoryContents){
                let filePath : string | object = path.join(contentObject['dirName'], element)
                const fileStat = await fs.stat(filePath)
                const statObject : NFileObject.IFileStats = 
                {name : element, size : fileStat.size, birthtime : fileStat.birthtime, isDirectory : fileStat.isDirectory(), isFile : fileStat.isFile()}
                stats.push(statObject)
            }
        }
        catch(exception){
            console.error("Error occured while getting stats for directory contents!!!")
            console.error(exception)
            contentObject.exception = true
        }

        const contentStatsObject : NFileObject.IContentStatsObject = {permission : contentObject.permission,
            pathExists : contentObject.pathExists,
            exception : contentObject.exception,
            content : stats, 
            dirName : contentObject.dirName,
            fileName : contentObject.fileName}
        return contentStatsObject
    }

    public async copy(source:ReadonlyArray<string>, destination:string) : Promise<Array<NFileObject.ICopyStatus>>
    {
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        const destinationPermissionObject : NFileObject.IPermissionObject = await this.checkPermission(destination)
        const result = source.map(async (element) => {
            const sourceObject : NFileObject.IPermissionObject = await this.checkPermission(element)
            const copyStatus : NFileObject.ICopyStatus = {
                permission : sourceObject.permission,
                pathExists : sourceObject.pathExists,
                exception  : sourceObject.pathExists,
                copied     : false,
                target     : element,
                error      : ""
            }

            // TODO : Recheck this logic from here and change it if there is some problem or redundancy
            if(sourceObject.permission && destinationPermissionObject.permission && sourceObject.pathExists)
            {
                try{
                    if(sourceObject.fileName)
                    {
                        const sourceFileStats = await fs.stat(path.join(sourceObject.dirName, sourceObject.fileName))
                        const requiredSpace = sourceFileStats.size
                        if(this.updateUsedDiskSpace(requiredSpace))
                        {
                            await fs.cp(path.join(sourceObject.dirName, sourceObject.fileName) ,path.join(destinationPermissionObject.dirName, sourceObject.fileName))
                        }
                        else
                        {
                            throw new Error("OutOfSpace")
                        } 
                    }
                    else
                    {
                        const sourceDirectoryBaseName = path.basename(sourceObject.dirName)
                        const destinationDirectoryName = path.join(destinationPermissionObject.dirName, sourceDirectoryBaseName)
                        const sourceDirStats = await fs.stat(sourceObject.dirName)
                        const requiredSpace = sourceDirStats.size
                        if(this.updateUsedDiskSpace(requiredSpace))
                        {
                            // Create a directory of the same name as source first
                            await fs.mkdir(destinationDirectoryName, {recursive : true})
                            // Then copy all the files from the source directory inside the newly created destination directory
                            await fs.cp(sourceObject.dirName, destinationDirectoryName, {recursive : true})
                        }
                        else
                        {
                            throw new Error("OutOfSpace")
                        }
                    }
                    copyStatus.copied = true
                }
                catch(exception)
                {
                    // Set the space to the size of user's directory
                    // in case of errors in copy operation
                    const userDirStats = await fs.stat(this.HOME_DIR)
                    this.usedDiskSpace = userDirStats.size
                    // Set exception to true in case of exception
                    copyStatus.exception = true
                }
            }
            else
            {
                copyStatus.permission = false
                !(sourceObject.pathExists && destinationPermissionObject.pathExists) ? copyStatus.pathExists = false : copyStatus.pathExists = true 
            }
            return copyStatus
        })
        return await Promise.all(result)
    }

    public async delete(target : ReadonlyArray<string>): Promise<Array<NFileObject.IDeleteStatus>>{
        if(!Array.isArray(target))
        {
            throw Error("TargetPathNotArray")
        }
        const result = target.map(async (targetPath)=>{
            const permissionObject = await this.checkPermission(targetPath)
            const deleteStatus: NFileObject.IDeleteStatus = {
                permission : permissionObject.permission,
                pathExists : permissionObject.pathExists,
                exception  : permissionObject.pathExists,
                deleted    : false,
                target     : targetPath,
                error      : ""
            }
            try{
                let deleted = false
                if(permissionObject.permission && permissionObject.pathExists && !permissionObject.fileName)
                {
                    const dirSize = (await fs.stat(permissionObject.dirName)).size
                    await fs.rmdir(permissionObject.dirName, {recursive : true})
                    deleted = this.updateUsedDiskSpace(-dirSize)
                }
                else if(permissionObject.permission && permissionObject.pathExists && permissionObject.fileName)
                {
                    const fileSize = (await fs.stat(path.join(permissionObject.dirName, permissionObject.fileName))).size
                    await fs.rm(path.join(permissionObject.dirName, permissionObject.fileName))
                    deleted = this.updateUsedDiskSpace(-fileSize)
                }
                deleteStatus.deleted = deleted
            }
            catch(exception)
            {
                // Recalculate used disk stats on error for safety
                this.usedDiskSpace = (await fs.stat(this.HOME_DIR)).size
                deleteStatus.exception = true
            }
            return deleteStatus
        })
        return await Promise.all(result)
    }

    public async getCurrentUserDirSize() : Promise<number>
    {
        return (await fs.stat(this.HOME_DIR)).size
    }

    public async move(source : Array<string>, destination: string): Promise<Array<NFileObject.IMoveStatus>>
    {
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        const destinationObject = await this.checkPermission(destination)
        const result = source.map(async (element : string) => {
            const sourceObject = await this.checkPermission(element)
            const moveStatus : NFileObject.IMoveStatus = {
                permission : sourceObject.permission,
                pathExists : sourceObject.pathExists,
                exception  : sourceObject.pathExists,
                moved      : false,
                target     : element,
                error      : ""
            }
            if(sourceObject.permission && sourceObject.pathExists)
            {
                try{
                    if(destinationObject.permission)
                    {
                        if(sourceObject.fileName)
                        {
                            // If destination path has filename with it then move the file with destination file name
                            // else move the file to the new path with the same filename
                            await fs.rename(path.join(sourceObject.dirName, sourceObject.fileName),
                            path.join(destinationObject.dirName, destinationObject.fileName ? destinationObject.fileName : sourceObject.fileName))
                        }
                        else
                        {
                            const sourceDirectoryName : string = element
                            const destinationDirectory : string = path.join(destinationObject.dirName, sourceDirectoryName)

                            // Create a directory of the same name as source first
                            await fs.mkdir(destinationDirectory, {recursive : true})

                            // Then move all the files from the source directory inside the newly created destination directory
                            await fs.rename(sourceObject.dirName, destinationDirectory)
                        }
                        moveStatus.moved = true
                    }
                }
                catch(exception)
                {
                    console.error(exception)
                    // Change exception to true in case of exception
                    moveStatus.exception = true
                }
            }
            moveStatus.permission = sourceObject.permission && destinationObject.permission
            moveStatus.pathExists = sourceObject.pathExists && destinationObject.pathExists
            return moveStatus
        })
        return await Promise.all(result)
    }

    public async getReadStream(targetPath : string, start? : number, end? : number) : Promise<ReadStream | null>
    {
        let result : null | ReadStream = null
        const permissionObject = await this.checkPermission(targetPath)
        if(permissionObject.permission && permissionObject.pathExists && permissionObject.fileName)
        {
            const options: any = {}
            if(start !== null && end !== null && start !== undefined && end !==undefined)
            {
                options.start = start
                options.end = end
            }
            const readStream = filesystem.createReadStream(path.join(permissionObject.dirName, permissionObject.fileName), options)
            readStream.on('error', (e)=>{
                readStream.destroy(e)
                console.error("Error in read stream")
                console.error(e)
            })
            result = readStream
        }
        return result
    }

    public async getWriteStream(targetPath : string, resourceSize : number) : Promise <WriteStream | null>
    {
        // Pipe read stream via a different transform stream that measures
        // ETA, remaining bytes to recieve and download %. Well for the writestream,
        // it is required that the readstream that is being piped to this writestream
        // would get intercepted by that same kind of transform stream
        let result = null
        const permissionObject = await this.checkPermission(targetPath)
        if(permissionObject.permission && permissionObject.fileName)
        {
            if(this.updateUsedDiskSpace(resourceSize))
            {
                const writeStream = 
                result = filesystem.createWriteStream(path.join(permissionObject.dirName, permissionObject.fileName))
                result.on('error', async (e)=>{
                    // Recalculate used disk stats on error for safety
                    this.usedDiskSpace = (await fs.stat(this.HOME_DIR)).size
                    writeStream.destroy()
                    console.error(e)
                    console.error('Error in write stream')
                })
            }
        }
        return result
    }

}