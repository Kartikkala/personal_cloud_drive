// Typedefs

/**
 * @typedef {Object} Permission
 * @property {boolean} permission - If path is a child path of rootPath set in constructor then returns true
 * @property {string} dirPath - Returns the full path on which permission was allowed
 * @property {boolean} exception - Returns true of there was an exception otherwise, returns false
 */

// Callbacks


/**
     * @callback returnUserRequestedPath
     * @param {express.Request} request - The Express.js request object
     * @param {express.Response} response - The Express.js response object
     * @returns {void}

     * @callback permissionDenyCallback
     * @param {express.Request} request - The Express.js request object
     * @param {express.Response} response - The Express.js response object
 */

import fs from 'fs/promises'
import filesystem from 'fs'
import path from 'path'
import express from 'express'
import { getUserDir } from '../authentication/utils/userInfoUtils.mjs'

/**
 * Provides various middleware functions for performing different filesystem operations
 * 
 * @class 
 */
export class FileManager{
    #rootPath = undefined
    #currentUserDir = undefined
    /**
    * Validates the given path and sets it as the root path for file object
    * @constructor
    * @param {object} options - ---!!!Write some documentation for this object!!!---
    * */
    constructor(options)
    {
        if(!options.rootPath)
        {
            throw new Error("Please provide root path in options object!!!")
        }
        if(!filesystem.existsSync(options.rootPath))
        {
            fs.mkdir(options.rootPath, (err)=>{
                if(err)
                {
                    throw new Error(err)
                }
            })
        }
        this.getDirectoryContents = this.getDirectoryContents.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.copyMiddleware = this.copyMiddleware.bind(this)
        this.deleteMiddleware = this.deleteMiddleware.bind(this)
        this.moveMiddleware = this.moveMiddleware.bind(this)
        this.#rootPath = filesystem.realpathSync(options.rootPath)
    }

    /**
     * @function ***modifyCurrentUserDirectoryPath***
     * @param {*} pathToCurrentUserDirectory  - File path for the currently logged in user
     * @returns {Boolean} - Returns true if current user directory was updated in the object from database
     */

    modifyCurrentUserDirectoryPath(pathToCurrentUserDirectory)
    {
        this.#currentUserDir = pathToCurrentUserDirectory
        if(!filesystem.existsSync(path.join(this.#rootPath, this.#currentUserDir)))
        {
            fs.mkdir(path.join(this.#rootPath, this.#currentUserDir), (err)=>{
                if(err)
                {
                    throw new Error(err)
                }
            })
        }
        return true
    }



    /**
     * 
     * @param {string} targetPath - File system path to be checked for permissions
     * @returns {Promise<Permission>} 
     *
     */
    
    async #checkPermission(targetPath){
        const permissionObject = {'permission': false, 'exception':false, 'pathExists':true, 'dirName' : undefined, 'fileName' : undefined}
        let fullPath = undefined
        try{
            let requestedPath = path.join(this.#rootPath, this.#currentUserDir ,targetPath)
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
            permissionObject.permission = fullPath.startsWith(path.join(this.#rootPath, this.#currentUserDir))
            permissionObject.pathExists = filesystem.existsSync(fullPath)
        }
        catch(exception){
            console.error("Exception occured while checking permission of requested path.")
            console.error(exception)
            permissionObject.exception = true
        }
        return permissionObject
    }

    async #copy(source, destination)
    {
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        destination = await this.#checkPermission(destination)
        const result = source.map(async (element) => {
            const sourceObject = await this.#checkPermission(element)
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

    async #delete(targetPathArray){
        if(!Array.isArray(targetPathArray))
        {
            throw Error("TargetPathNotArray")
        }
        const result = targetPathArray.map(async (targetPath)=>{
            const permissionObject = await this.#checkPermission(targetPath)
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

    async #move(source, destination){
        if(!Array.isArray(source) || !destination || !source)
        {
            throw Error("InvalidSourceOrDestination")
        }
        const destinationObject = await this.#checkPermission(destination)
        const result = source.map(async (element) => {
            const sourceObject = await this.#checkPermission(element)
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

    async copyMiddleware(request, response, next)
    {
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        
        let destination = request.body.destination
        const userDir = request.user.userDir

        this.modifyCurrentUserDirectoryPath(userDir)
        
        response.locals.result = await this.#copy(source, destination)
        return next()
    }

    async deleteMiddleware(request, response, next)
    {
        let targetPathArray = Array.isArray(request.body.targetPath) ? request.body.targetPath : [request.body.targetPath]
        const userDir = request.user.userDir

        this.modifyCurrentUserDirectoryPath(userDir)

        response.locals.result = await this.#delete(targetPathArray)
        return next()
    }

    async moveMiddleware(request, response, next)
    {
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        
        let destination = request.body.destination
        const userDir = request.user.userDir

        this.modifyCurrentUserDirectoryPath(userDir)
        
        response.locals.result = await this.#move(source, destination)
        return next()
    }

     /**
     * @function ***checkPermissionMiddleware***
     * 
     * This middleware is used to check if the user requested path (obtained by express.request) is permitted to be accessed by the user 
     * 
     * @param {returnUserRequestedPath} returnRequestedPathCallback - **Contains the logic for returning user requested path via GET or POST requests using <express.request> object**
     * @param {permissionDenyCallback} permissionDenyCallback - **Contains the logic that will be called if permission to the requested path is denied**
     * @returns {Promise<Function>} - Returns express.js middleware function
     */

    async checkPermissionMiddleware(permissionDenyCallback){
        return async (request, response, next)=>{
            const targetPath = request.body.targetPath
            const userDir = await getUserDir(request.user._id)
            this.modifyCurrentUserDirectoryPath(userDir)
            const permissionObject = await this.#checkPermission(targetPath)
            response.locals.resourceInfo = permissionObject
            if(permissionObject.permission){
                next()
            }
            else{
                permissionDenyCallback(request, response)
            }
        }
    }

    /**
     * @function  ***getDirectoryContents***
     * 
     * This middleware wrapper function returns a middleware that attaches resourceInfo object containing filenames/dirnames of all the resources present in the specified directory with response.locals . Refer to the documentation for additional details.
     * 
     * 
     * @param {express.Request} request - The Express.js request object
     * @param {express.Response} response - The Express.js response object
     * @param {@function} next - Next middleware in the chain
     * 
     * @returns {Promise<Function>}
     */
   
    async getDirectoryContents(request, response, next){
        const targetPath = request.body.targetPath
        const userDir = request.user.userDir
        this.modifyCurrentUserDirectoryPath(userDir)
        const permissionObject = await this.#checkPermission(targetPath)
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
        else
        {
            resourceInfo.exception = true
        }
        response.locals.resourceInfo = resourceInfo
        return next()
    }
    
    /**
     * @function ***getResourceStatsInDirectory***
     * 
     * 
     * This middleware wrapper function returns a middleware that attaches resourceInfo object containing stats of all the resources present in the specified directory with response.locals. Refer to the documentation for additional details.
     * 
     * 
     * @param {express.Request} request - The Express.js request object
     * @param {express.Response} response - The Express.js response object
     * @param {@function} next - Next middleware in the chain
     * 
     * @returns {Promise<Function>}
     */
    async getResourceStatsInDirectory(request, response, next)
    {
        let stats = []
        await this.getDirectoryContents(request, response, async ()=>{
            const resourceInfo = response.locals.resourceInfo
            
            try{
                const directoryContents = resourceInfo.content
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
            response.locals.resourceInfo.content = stats
            delete response.locals.resourceInfo['dirName']    // Delete dirPath field after everything is done
            return next()
        })
    }
}
