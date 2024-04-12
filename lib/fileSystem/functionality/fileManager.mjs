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
export class FileObjectManager{
    #mountedPaths = []
    #workingDir = undefined
    #fileObjectPool = {}
    #flag = false
    #diskStats = {}
    #provisionedDiskUsageByMountPath = {}
    
    constructor(workingDirName, mountPaths, userDiskStats)
    {
        if(!Array.isArray(mountPaths) || !workingDirName || mountPaths.length === 0)
        {
            throw new Error("Please provide valid root path/working dir in app_config.json")
        }

        this.addNewMountPaths(mountPaths)
        this.#workingDir = workingDirName
        this.refreshMountedDiskStats()
        this.createAndRegisterFileObjects(userDiskStats)
        

        this.addNewMountPaths = this.addNewMountPaths.bind(this)
        this.allocateSpace = this.allocateSpace.bind(this)
        this.getFileObject = this.getFileObject.bind(this)
        this.createAndRegisterFileObjects = this.createAndRegisterFileObjects.bind(this)
        this.refreshMountedDiskStats = this.refreshMountedDiskStats.bind(this)
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
                const absolutePath = filesystem.realpathSync(mountPath)
                filesystem.accessSync(absolutePath)
                const validatedPathArray = absolutePath.split("/")
                if(validatedPathArray.length > 1 && !mountedPathsRoot.has(validatedPathArray[1]))
                {
                    this.#mountedPaths.push(mountPath)
                    this.#provisionedDiskUsageByMountPath[mountPath] = 0
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

    createAndRegisterFileObjects(userDiskStats)
    {
        if(!Array.isArray(userDiskStats))
        {
            userDiskStats = [userDiskStats]
        }

        userDiskStats.forEach((userStats)=>{
            if(!userStats.id || !userStats.userDirName || !userStats.userDirMountPath || !userStats.totalUserSpace)
            {
                throw new Error("Invalid user disk stat")
            }
            const fileObject = new FileObject(userStats.userDirName, userStats.userDirMountPath, this.#workingDir, userStats.totalUserSpace)
            this.#fileObjectPool[userStats.id] = fileObject
        })   
    }

    getFileObject(id)
    {
        if(!id || typeof id !== 'string')
        {
            throw new Error("Invalid user id specified in get file object")
        }
        return this.#fileObjectPool[id]
    }

    async allocateSpace(id ,storageSpaceinBytes)
    {
        if(!storageSpaceinBytes || !id || typeof id !== 'string')
        {
            throw new Error("Invalid id or storage space passed to allocate space")
        }
        // Use uuid as a random unique name for user dir
        const userDirName = crypto.randomUUID().concat(crypto.randomUUID())
        try
        {
            for(let i=0; i<this.#mountedPaths.length; i++)
            {
                const mountPath = this.#mountedPaths[i]

                if(this.#diskStats[mountPath].available > storageSpaceinBytes && 
                    this.#provisionedDiskUsageByMountPath[mountPath] < this.#diskStats[mountPath].available)
                {
                    const userDirFullPath = path.join(mountPath, this.#workingDir ,userDirName)
                    await fs.mkdir(userDirFullPath, {recursive : true})
                    this.#provisionedDiskUsageByMountPath[mountPath] += storageSpaceinBytes

                    // Set the fileobject automatically after allocation
                    const userDiskStats = {"id" : id, "userDirMountPath" : mountPath, "userDirName" : userDirName, "totalUserSpace" : storageSpaceinBytes}
                    this.createAndRegisterFileObjects(userDiskStats)
                    return userDiskStats
                }
            }
        }
        catch(e)
        {
            // TODO : Handle the error gracefully
            console.error(e)
        }
        return undefined
    }

    deallocateSpace(userDirName, userDirMountPath){

    }
}
