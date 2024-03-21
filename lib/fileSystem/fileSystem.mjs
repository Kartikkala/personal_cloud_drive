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
    #filePathField = undefined
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
        this.#rootPath = options.rootPath
        this.#filePathField = options.filePathField || "filePath"
    }
    filePathField()
    {
        return this.#filePathField
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
        const permissionObject = {'permission': false, 'exception':false, 'pathExists':false}
        permissionObject[this.#filePathField] = undefined
        let requestedPath = undefined
        let fullPath = undefined
        try{
            requestedPath = path.join(this.#rootPath, this.#currentUserDir ,targetPath)
            fullPath = await fs.realpath(requestedPath)
            if(fullPath.startsWith(path.join(this.#rootPath, this.#currentUserDir)))
            {
                permissionObject.permission = true
                permissionObject[this.#filePathField] = fullPath
            }
            if(filesystem.existsSync(requestedPath)){
                permissionObject.pathExists = true
            }
        }
        catch(exception){
            console.error("Exception occured while checking permission of requested path. Check if path "+requestedPath+" exists!!!")
            console.error(exception)
            permissionObject.exception = true
        }
        return permissionObject
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
            const targetPath = request.body[this.#filePathField]
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
        const targetPath = request.body[this.#filePathField]
        const userDir = await getUserDir(request.user._id)
        this.modifyCurrentUserDirectoryPath(userDir)
        const permissionObject = await this.#checkPermission(targetPath)
        const resourceInfo = {...permissionObject, 'content':[]}
        if(permissionObject.permission){
            try{
                const dir = permissionObject[this.#filePathField]
                resourceInfo.content = await fs.readdir(dir)
            }
            catch(exception){
                resourceInfo.exception = true
                console.error("Error retrieving directory contents!!!")
                console.error(exception)
            }
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
                    let filePath = path.join(resourceInfo[this.#filePathField], element)
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
            delete response.locals.resourceInfo[this.#filePathField]    // Delete filepath field after everything is done
            return next()
        })
    }
}
