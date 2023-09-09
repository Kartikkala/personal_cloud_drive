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


/**
 * Provides various middleware functions for performing different filesystem operations
 * 
 * @class 
 */
export class FileManager{
    #rootPath = undefined;
    /**
    * Validates the given path and sets it as the root path for file object
    * @constructor
    * @param {string} rootPath - This path will be root path for all filesystem operations
    * */
    constructor(rootPath)
    {
        if(!filesystem.existsSync(rootPath))
        {
            fs.mkdir(rootPath, (err)=>{
                if(err)
                {
                    throw new Error(err)
                }
            })
        }
        this.getDirectoryContents = this.getDirectoryContents.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.#rootPath = rootPath
        return
    }

    /**
     * 
     * @param {string} targetPath - File system path to be checked for permissions
     * @returns {Permission} 
     *
     */

    async #checkPermission(targetPath){
        const permissionObject = {'permission': false, 'dirPath':undefined, 'exception':false, 'pathExists':false}
        const requestedPath = path.join(this.#rootPath, targetPath)
        let fullPath = undefined
        try{
            fullPath = await fs.realpath(requestedPath)
            if(fullPath.startsWith(this.#rootPath))
            {
                permissionObject.permission = true
                permissionObject.dirPath = fullPath
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

    async checkPermissionMiddleware(returnRequestedPathCallback, permissionDenyCallback){
        return async (request, response, next)=>{
            const targetPath = returnRequestedPathCallback(request, response)
            const permissionObject = this.#checkPermission(targetPath)
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
     * @param {returnUserRequestedPath} callback - **Callback that returns the requested path obtained via GET or POST request**
     * 
     * @returns {Promise<Function>} ***Returns Express.js middleware that attaches resourceInfo object with response.locals***
     */
    async getDirectoryContents(callback)
    {
        return async (request, response, next)=>{
            const targetPath = callback(request, response)
            const permissionObject = this.#checkPermission(targetPath)
            const resourceInfo = {...permissionObject, 'content':[]}
    
            if(permissionObject.permission){
                try{
                    const dir = permissionObject.dirPath
                    resourceInfo.content = await fs.readdir(dir)
                }
                catch(exception){
                    resourceInfo.exception = true
                    console.error("Error retrieving directory contents!!!")
                    console.error(exception)
                }
            }
            response.locals.resourceInfo = resourceInfo
            next()
        }
    }
    
    /**
     * @function ***getResourceStatsInDirectory***
     * 
     * 
     * This middleware wrapper function returns a middleware that attaches resourceInfo object containing stats of all the resources present in the specified directory with response.locals. Refer to the documentation for additional details.
     * 
     * 
     * @param {returnUserRequestedPath} callback - **Callback that returns the requested path obtained via GET or POST request**
     */
    async getResourceStatsInDirectory(callback)
    {
        return async (request, response, next)=>{
            const middleware = await this.getDirectoryContents(callback)
            middleware(request, response, async ()=>{
                const stats = {}
                const resourceInfo = response.locals.resourceInfo
                
                try{
                    const directoryContents = resourceInfo.content
                    for(let element of directoryContents){
                        let filePath = path.join(resourceInfo.dirPath, element)
                        let fileStat = await fs.stat(filePath)
                        fileStat.directory = fileStat.isDirectory()
                        fileStat.file = fileStat.isFile()
                        fileStat.symlink = fileStat.isSymbolicLink()
                        delete fileStat.uid
                        delete fileStat.gid
                        stats[`${element}`] = fileStat
                    }
                    
                }
                catch(exception){
                    console.error("Error occured while getting stats for directory contents!!!")
                    console.error(exception)
                    resourceInfo.exception = true
                }
                response.locals.resourceInfo.content = stats
                next()
            })
        }
    }
}
