import fs from 'fs/promises'
import filesystem from 'fs'
import path from 'path'
import disk from "diskusage"
import crypto from 'crypto'
import { FileObject } from './fileObject.js'
import { NFileObjectManager, NFileObject } from '../../../types/lib/fileSystem/types.js'

export class FileObjectManager implements NFileObjectManager.IFileObjectManager{
    private mountedPaths : Array<string> = []
    private workingDir : string = 'Cloud_drive'
    private fileObjectPool : NFileObjectManager.IFileObjectMap = {}
    public serviceStatus : boolean = false
    private diskStats : NFileObjectManager.IDiskStatsByMountPath = {}
    private provisionedDiskUsageByMountPath : NFileObjectManager.IProvisionedDiskUsageByMountPath = {}
    
    constructor(mountPaths : Array<string>, userDiskStats : Array<NFileObjectManager.IUserDiskStats> ,workingDirName? : string)
    {
        if(!Array.isArray(mountPaths) || mountPaths.length === 0)
        {
            throw new Error("Please provide valid root path in app_config.json")
        }

        this.addNewMountPaths(mountPaths)
        this.workingDir = workingDirName ? workingDirName : this.workingDir
        this.refreshMountedDiskStats()
        this.createAndRegisterFileObjects(userDiskStats)
        

        this.addNewMountPaths = this.addNewMountPaths.bind(this)
        this.allocateSpace = this.allocateSpace.bind(this)
        this.getFileObject = this.getFileObject.bind(this)
        this.createAndRegisterFileObjects = this.createAndRegisterFileObjects.bind(this)
        this.refreshMountedDiskStats = this.refreshMountedDiskStats.bind(this)
    }

    public addNewMountPaths(mountPaths : Array<string>) : boolean
    {
        const mountedPathsRoot : Set<string> = new Set([])
        if(!Array.isArray(mountPaths))
        {
            throw new Error("Mount paths must be passed inside an array")
        }
        try{
            mountPaths.forEach((mountPath : string)=>{
                const absolutePath = filesystem.realpathSync(mountPath)
                filesystem.accessSync(absolutePath)
                const validatedPathArray = absolutePath.split("/")
                if(validatedPathArray.length > 1 && !mountedPathsRoot.has(validatedPathArray[1]))
                {
                    this.mountedPaths.push(mountPath)
                    this.provisionedDiskUsageByMountPath[mountPath] = 0
                    mountedPathsRoot.add(validatedPathArray[1])
                }
                else
                {
                    throw new Error("/ cannot be mounted")
                }
            })
            return true
        }
        catch(e)
        {
            console.error(e)
        }
        return false
    }


    public refreshMountedDiskStats() : boolean
    {
        try{
            for(let i=0;i<this.mountedPaths.length;i++)
            {
                const mountedPath = this.mountedPaths[i]
                const diskStats = disk.checkSync(mountedPath)
                this.diskStats[mountedPath] = diskStats
            }
            return true
        }
        catch(e)
        {
            // TODO - Handle the error gracefully
            console.error(e)
        }
        return false
    }

    public createAndRegisterFileObjects(userDiskStats : Array<NFileObjectManager.IUserDiskStats>) : boolean
    {
        if(!Array.isArray(userDiskStats))
        {
            userDiskStats = [userDiskStats]
        }

        userDiskStats.forEach((userStats : NFileObjectManager.IUserDiskStats)=>{
            if(!userStats.id || !userStats.userDirName || !userStats.userDirMountPath || !userStats.totalUserSpaceInBytes)
            {
                throw new Error("Invalid user disk stat")
            }
            const fileObject = new FileObject(userStats.userDirName, userStats.userDirMountPath, this.workingDir, userStats.totalUserSpaceInBytes)
            this.fileObjectPool[userStats.id] = fileObject
        })   
        return true
    }

    public getFileObject(id : string) : NFileObject.IFileObject
    {
        if(!id || typeof id !== 'string')
        {
            throw new Error("Invalid user id specified in get file object")
        }
        return this.fileObjectPool[id]
    }

    public async allocateSpace(id : string ,storageSpaceinBytes : number) : Promise<NFileObjectManager.IUserDiskStats | undefined>
    {
        if(!storageSpaceinBytes || !id || typeof id !== 'string')
        {
            throw new Error("Invalid id or storage space passed to allocate space")
        }
        // Use uuid as a random unique name for user dir
        const userDirName : string = crypto.randomUUID().concat(crypto.randomUUID())
        try
        {
            for(let i=0; i<this.mountedPaths.length; i++)
            {
                const mountPath : string = this.mountedPaths[i]

                if(this.diskStats[mountPath].available > storageSpaceinBytes && 
                    this.provisionedDiskUsageByMountPath[mountPath] < this.diskStats[mountPath].available)
                {
                    const userDirFullPath : string = path.join(mountPath, this.workingDir ,userDirName)
                    await fs.mkdir(userDirFullPath, {recursive : true})
                    this.provisionedDiskUsageByMountPath[mountPath] += storageSpaceinBytes

                    // Set the fileobject automatically after allocation
                    const userDiskStats : NFileObjectManager.IUserDiskStats = {"id" : id, "userDirMountPath" : mountPath, "userDirName" : userDirName, "totalUserSpaceInBytes" : storageSpaceinBytes}
                    this.createAndRegisterFileObjects([userDiskStats])
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

    public deallocateSpace(userDirName : string, userDirMountPath : string){

    }
}
