import path from 'path'
import fs from 'fs/promises'
import filesystem from 'fs'

export class FileObject{
    #totalUserSpace = 0
    #userDirName = undefined
    #userDirMountPath = undefined
    #workingDir = undefined
    constructor(userDirName, userDirMountPath, workingDir ,totalUserSpaceInBytes)
    {
        if(!userDirName || !userDirMountPath || !totalUserSpaceInBytes || !workingDir)
        {
            console.log(userDirName)
            console.log(userDirMountPath)
            console.log(totalUserSpaceInBytes)
            console.log(workingDir)
            throw new Error("Invalid instance creation for file object")
        }

        this.#workingDir = workingDir
        this.#totalUserSpace = totalUserSpaceInBytes
        this.#userDirName = userDirName
        this.#userDirMountPath = userDirMountPath

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


    getUserInfo()
    {
        return {"totalUserSpace" : this.#totalUserSpace , "userDirName" : this.#userDirName, "userDirMountPath" : this.#userDirMountPath}
    }

    changeTotalUserSpace(updatedTotalUserSpaceInBytes)
    {
        const difference = updatedTotalUserSpaceInBytes - this.#totalUserSpace
        this.#totalUserSpace = updatedTotalUserSpaceInBytes
    }

    /**
     * 
     * @param {string} targetPath - File system path to be checked for permissions
     * @returns {Promise<Permission>} 
     *
     */
    
    async checkPermission(targetPath){
        const permissionObject = {'permission': false, 'exception':false, 'pathExists':true, 'dirName' : undefined, 'fileName' : undefined}
        let fullPath = undefined
        try{
            let requestedPath = path.join(this.#userDirMountPath, this.#workingDir ,this.#userDirName ,targetPath)
            if(targetPath.endsWith('/'))
            {
                permissionObject.dirName = requestedPath
            }
            else
            {
                const pathArray = requestedPath.split('/')
                const fileName = pathArray.pop()
                permissionObject.dirName = path.dirname(requestedPath)
                permissionObject.fileName = fileName
            }
            fullPath = path.normalize(requestedPath)
            permissionObject.permission = fullPath.startsWith(path.join(this.#userDirMountPath, this.#workingDir ,this.#userDirName))
            permissionObject.pathExists = filesystem.existsSync(fullPath)
        }
        catch(exception){
            console.error("Exception occured while checking permission of requested path.")
            console.error(exception)
            permissionObject.exception = true
        }
        return permissionObject
    }

    /**
     * @function ***getDirectoryContents***
     * 
     * 
     * 
     * 
     * @param {string} targetPath - The Express.js request object
     * 
     * @returns {Promise<resourceInfo>}
     */
   
    async getDirectoryContents(targetPath){
        const permissionObject = await this.checkPermission(targetPath)
        const resourceInfo = {...permissionObject, 'content':[]}
        if(permissionObject.permission && !permissionObject.fileName){
            try{
                const dir = permissionObject['dirName']
                resourceInfo.content = await fs.readdir(dir)
            }
            catch(exception){
                resourceInfo.exception = true
                console.error("Error retrieving directory contents!!!")
                console.error(exception)
            }
        }
        return resourceInfo
    }

    /**
     * @function ***getResourceStatsInDirectory***
     * 
     * 
     * 
     * 
     * @param {string} targetPath - The Express.js request object
     * 
     * @returns {Promise<resourceInfo>}
     */
    async getResourceStatsInDirectory(targetPath)
    {
        let stats = []
        const resourceInfo = await this.getDirectoryContents(targetPath)
        const directoryContents = resourceInfo.content
        try{
            for(let element of directoryContents){
                let filePath = path.join(resourceInfo['dirName'], element)
                let fileStat = await fs.stat(filePath)
                fileStat.directory = fileStat.isDirectory()
                fileStat.file = fileStat.isFile()
                fileStat.symlink = fileStat.isSymbolicLink()
                fileStat.name = element
                delete fileStat.uid
                delete fileStat.gid
                delete fileStat.atime
                delete fileStat.atimeMs
                delete fileStat.ctime
                delete fileStat.ctimeMs
                delete fileStat.blocks
                delete fileStat.nlink
                delete fileStat.dev
                delete fileStat.ino
                delete fileStat.birthtimeMs
                delete fileStat.mode
                delete fileStat.rdev
                delete fileStat.blksize
                delete fileStat.mtime
                delete fileStat.mtimeMs
                stats.push(fileStat)
            }
        }
        catch(exception){
            console.error("Error occured while getting stats for directory contents!!!")
            console.error(exception)
            resourceInfo.exception = true
        }
        resourceInfo.content = stats
        return resourceInfo
    }

    async copy(source, destination)
    {
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        destination = await this.checkPermission(destination)
        const result = source.map(async (element) => {
            const sourceObject = await this.checkPermission(element)
            const copyStatus = {
                ...sourceObject,
                "copied" : false,
                "dirName" : undefined,
                "errorMessage" : undefined
            }

            // TODO : Recheck this logic from here and change it if there is some problem or redundancy
            if(sourceObject.permission && destination.permission)
            {
                try{
                    if(sourceObject.fileName)
                    {
                        await fs.cp(path.join(sourceObject.dirName, sourceObject.fileName) ,path.join(destination.dirName, sourceObject.fileName))
                    }
                    else
                    {
                        const sourceDirectoryName = (sourceObject.dirName.split('/').pop())
                        const destinationDirectory = path.join(destination.dirName, sourceDirectoryName)

                        // Create a directory of the same name as source first
                        await fs.mkdir(destinationDirectory, {recursive : true})

                        // Then copy all the files from the source directory inside the newly created destination directory
                        await fs.cp(sourceObject.dirName, destinationDirectory, {recursive : true})
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
                !(sourceObject.pathExists && destination.pathExists) ? copyStatus.pathExists = false : copyStatus.pathExists = true 
            }
            return copyStatus
        })
        return await Promise.all(result)
    }

    async delete(targetPathArray){
        if(!Array.isArray(targetPathArray))
        {
            throw Error("TargetPathNotArray")
        }
        const result = targetPathArray.map(async (targetPath)=>{
            const permissionObject = await this.checkPermission(targetPath)
            const deleteStatus = {
                ...permissionObject,
                "dirName" : undefined,
                "fileName" : undefined,
                "deleted" : false
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

    async move(source, destination){
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        const destinationObject = await this.checkPermission(destination)
        const result = source.map(async (element) => {
            const sourceObject = await this.checkPermission(element)
            const moveStatus = {
                ...sourceObject,
                "moved" : false,
                "dirName" : undefined,
                "fileName" : undefined,
                "errorMessage" : undefined
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
                            const sourceDirectoryNameArray = sourceObject.dirName.split('/')
                            let sourceDirectoryName = ''
                            while(sourceDirectoryName.length > 0)
                            {
                                sourceDirectoryName = sourceDirectoryNameArray.pop()
                            }
                            const destinationDirectory = path.join(destinationObject.dirName, sourceDirectoryName)

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