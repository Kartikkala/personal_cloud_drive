import path from 'path'
import fs from 'fs/promises'
import filesystem from 'fs'
import { NFileObject } from '../../../types/lib/fileSystem/types.js'

export class FileObject implements NFileObject.IFileObject{
    private totalUserSpace:number = 0
    private userDirName :string
    private userDirMountPath: string
    private workingDir: string
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

        this.getDirectoryContents = this.getDirectoryContents.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.checkPermission = this.checkPermission.bind(this)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.changeTotalUserSpace = this.changeTotalUserSpace.bind(this)
        this.copy = this.copy.bind(this)
        this.move = this.move.bind(this)
        this.delete = this.delete.bind(this)
        
        // TODO
        /*
            1. User level space will be handled in individual file opearations. Create functionality, that only allows any
            of the copy operations only if user has enough space to do that operation.
        */
    }


    public getUserInfo() : NFileObject.IPartialUserDiskStats
    {
        return {"totalUserSpaceInBytes" : this.totalUserSpace , "userDirName" : this.userDirName, "userDirMountPath" : this.userDirMountPath}
    }

    public changeTotalUserSpace(updatedTotalUserSpaceInBytes : number) : number
    {
        const difference = updatedTotalUserSpaceInBytes - this.totalUserSpace
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
                        await fs.cp(path.join(sourceObject.dirName, sourceObject.fileName) ,path.join(destinationPermissionObject.dirName, sourceObject.fileName))
                    }
                    else
                    {
                        const sourceDirectoryBaseName = path.basename(sourceObject.dirName)
                        const destinationDirectoryName = path.join(destinationPermissionObject.dirName, sourceDirectoryBaseName)

                        // Create a directory of the same name as source first
                        await fs.mkdir(destinationDirectoryName, {recursive : true})

                        // Then copy all the files from the source directory inside the newly created destination directory
                        await fs.cp(sourceObject.dirName, destinationDirectoryName, {recursive : true})
                    }
                    copyStatus.copied = true
                }
                catch(exception)
                {
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
                if(permissionObject.permission && permissionObject.pathExists && !permissionObject.fileName)
                {
                    await fs.rmdir(permissionObject.dirName, {recursive : true})
                }
                else if(permissionObject.permission && permissionObject.pathExists && permissionObject.fileName)
                {
                    await fs.rm(path.join(permissionObject.dirName, permissionObject.fileName))
                }
                deleteStatus.deleted = permissionObject.permission && permissionObject.pathExists
            }
            catch(exception)
            {
                deleteStatus.exception = true
            }
            return deleteStatus
        })
        return await Promise.all(result)
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

}