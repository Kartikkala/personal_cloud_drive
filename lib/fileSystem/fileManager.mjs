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
import disk from "diskusage"
import crypto from 'crypto'
import { FileObject } from './fileObject.mjs'

/**
 * Provides various middleware functions for performing different filesystem operations
 * 
 * @class 
 */
export class FileManager{
    #mountedPaths = []
    #workingDir = undefined
    #fileObjectPool = {}
    #flag = false
    #diskStats = {}
    
    constructor(workingDirName, mountPaths, userDiskStats ,options)
    {
        if(!options)
        {
            options = userDiskStats
            userDiskStats = undefined
        }

        if(!Array.isArray(mountPaths) || !workingDirName || mountPaths.length === 0)
        {
            throw new Error("Please provide valid root path/working dir in app_config.json")
        }

        this.addNewMountPaths(mountPaths)
        this.#workingDir = workingDirName
        this.refreshMountedDiskStats()

        if(Array.isArray(userDiskStats))
        {
            this.setFileObjects(userDiskStats)
        }

        this.addNewMountPaths = this.addNewMountPaths.bind(this)
    }

    addNewMountPaths(mountPathsArray)
    {
        const mountedPathsRoot = new Set([])
        if(!Array.isArray(mountPathsArray))
        {
            throw new Error("Mount paths must be passed inside an array")
        }
        try{
            mountPathsArray.forEach((mountPath)=>{
                const absolutePath = filesystem.realpath(mountPath)
                filesystem.access(absolutePath)
                const validatedPathArray = absolutePath.split("/")
                if(validatedPathArray.length > 1 && !mountedPathsRoot.has(validatedPathArray[1]))
                {
                    this.#mountedPaths.push(mountPath)
                    mountedPathsRoot.add(validatedPathArray[1])
                }
                else
                {
                    throw new Error("/ cannot be mounted")
                }
            })
        }
        catch(e)
        {
            console.error(e)
        }
    }


    refreshMountedDiskStats()
    {
        try{
            for(let i=0;i<this.#mountedPaths.length;i++)
            {
                const mountedPath = this.#mountedPaths[i]
                const diskStats = disk.checkSync(mountedPath)
                this.#diskStats[mountedPath] = diskStats
            }

        }
        catch(e)
        {
            // TODO - Handle the error gracefully
            console.error(e)
        }
    }

    getServiceStatus()
    {
        return this.#flag
    }

    setFileObjects(userDiskStats)
    {
        if(!Array.isArray(userDiskStats))
        {
            throw new Error("Please pass valid user disk stats")
        }

        userDiskStats.forEach((userStats)=>{
            if(!userStats.user_id || !userStats.userDirName || !userStats.userDirMountPath || !userStats.totalUserSpace)
            {
                throw new Error("Invalid user disk stat")
            }
            const fileObject = new FileObject(userStats.userDirName, userStats.userDirMountPath, userStats.totalUserSpace)
            this.#fileObjectPool[userStats.user_id] = fileObject
        })   
    }

    async getFileObject(userId)
    {
        if(!userId)
        {
            throw new Error("No user id specified in get file object")
        }
        return this.#fileObjectPool[userId]
    }

    async allocateSpace(storageSpaceinBytes)
    {
        if(!storageSpaceinBytes)
        {
            return undefined
        }
        // Use uuid as a random unique name for user dir
        const userDirName = crypto.randomUUID().concat(crypto.randomUUID())
        try
        {
            for(let i=0; i<this.#mountedPaths.length; i++)
            {
                if(this.#diskStats[mountPath].available > storageSpaceinBytes)
                {
                    const mountPath = this.#mountedPaths[i]
                    const userDirFullPath = path.join(mountPath, this.#workingDir ,userDirName)
                    await fs.mkdir(userDirFullPath, {recursive : true})
                    return {"mountedPath" : mountPath, "userDirName" : userDirName, "totalUserSpace" : storageSpaceinBytes}
                }
            }
        }
        catch(e)
        {
            // TODO : Handle the error gracefully
        }
        return undefined
    }

    deallocateSpace(userDirName, userDirMountPath){

    }
}
