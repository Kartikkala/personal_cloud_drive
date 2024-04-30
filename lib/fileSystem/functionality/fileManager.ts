import fs from 'fs/promises'
import filesystem from 'fs'
import path from 'path'
import disk from "diskusage"
import crypto from 'crypto'
import { FileObject } from './fileObject.js'
import { NFileObjectManager, NFileObject } from '../../../types/lib/fileSystem/types.js'
import { IUserDiskStats, IUserDiskStatsDatabase } from '../../../types/lib/db/FileManager/types.js'

export class FileObjectManager implements NFileObjectManager.IFileObjectManager{
    private static instance : null | FileObjectManager = null
    private static instanceKey = Symbol("UniqueFileManagerKey")
    private database : IUserDiskStatsDatabase
    private mountedPaths : Array<string> = []
    private workingDir : string
    private fileObjectPool : NFileObjectManager.IFileObjectMap = {}
    public serviceStatus : boolean = false
    private diskStats : NFileObjectManager.IDiskStatsByMountPath = {}
    private provisionedDiskUsageByMountPath : NFileObjectManager.IProvisionedDiskUsageByMountPath = {}
    
    constructor(instanceKey : Symbol ,mountPaths : Array<string>, database : IUserDiskStatsDatabase ,workingDirName? : string)
    {
        if(instanceKey !== FileObjectManager.instanceKey)
        {
            throw new Error("Please use FileObjectManager.getInstance() to create an object of this class")
        }
        if(!Array.isArray(mountPaths) || mountPaths.length === 0)
        {
            throw new Error("Please provide valid root path in app_config.json")
        }

        this.database = database
        this.addNewMountPaths(mountPaths)
        this.workingDir = workingDirName || 'CloudDrive'
        this.refreshMountedDiskStats()
        

        this.addNewMountPaths = this.addNewMountPaths.bind(this)
        this.allocateSpace = this.allocateSpace.bind(this)
        this.deallocateSpace = this.deallocateSpace.bind(this)
        this.getFileObject = this.getFileObject.bind(this)
        this.createAndMountFileObjects = this.createAndMountFileObjects.bind(this)
        this.refreshMountedDiskStats = this.refreshMountedDiskStats.bind(this)
        this.checkPermission = this.checkPermission.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.copy = this.copy.bind(this)
        this.move = this.move.bind(this)
        this.delete = this.delete.bind(this)
        this.changeTotalUserSpace = this.changeTotalUserSpace.bind(this)

    }

    public static async getInstance(mountPaths : Array<string>, database : IUserDiskStatsDatabase ,workingDirName? : string)
    {
        if(!this.instance)
        {
            this.instance = new FileObjectManager(this.instanceKey, mountPaths, database, workingDirName)
        }
        const userDirStats = await database.getDiskStatsForAllUsers()
        this.instance.createAndMountFileObjects(userDirStats)
        return this.instance
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

    public createAndMountFileObjects(userDiskStats : Array<IUserDiskStats>) : boolean
    {
        if(!Array.isArray(userDiskStats))
        {
            userDiskStats = [userDiskStats]
        }

        userDiskStats.forEach((userStats : IUserDiskStats)=>{
            if(!userStats.email || !userStats.userDirName || !userStats.userDirMountPath || !userStats.totalSpace)
            {
                throw new Error("Invalid user disk stat")
            }
            const fileObject = new FileObject(userStats.userDirName, userStats.userDirMountPath, this.workingDir, userStats.totalSpace)
            this.fileObjectPool[userStats.email.toString()] = fileObject
        })   
        return true
    }

    private getFileObject(email : string) : NFileObject.IFileObject
    {
        if(!email || typeof email !== 'string')
        {
            throw new Error("Invalid user email specified in get file object")
        }
        return this.fileObjectPool[email]
    }

    public async allocateSpace(email : string ,storageSpaceinBytes : number) : Promise<IUserDiskStats | undefined>
    {
        if(!storageSpaceinBytes || !email)
        {
            throw new Error("Invalid email or storage space passed to allocate space")
        }
        // Use uuid as a random unique name for user dir
        const userDirName : string = crypto.randomUUID().concat(crypto.randomUUID())
        this.refreshMountedDiskStats()
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
                    const userDiskStats : IUserDiskStats = {
                        email : email,
                        userDirMountPath : mountPath, 
                        userDirName : userDirName, 
                        totalSpace : storageSpaceinBytes
                    }
                    if(!await this.database.createNewUser(email, userDiskStats.totalSpace, userDiskStats.userDirName, userDiskStats.userDirMountPath))
                    {
                        throw new Error("Cannot create new user in database")
                    }
                    this.createAndMountFileObjects([userDiskStats])
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

    public async changeTotalUserSpace(email : string, newTotalUserSpaceInBytes : number)
    {
        let updatedSpace = undefined
        if(await this.database.modifyTotalUserSpace(email, newTotalUserSpaceInBytes))
        {
            updatedSpace = this.getFileObject(email.toString()).changeTotalUserSpace(newTotalUserSpaceInBytes)
        }
        return updatedSpace
    }

    public async checkPermission(email : string, targetPath : string)
    {
        const fileObject = this.getFileObject(email)
        if(!fileObject)
        {
            return undefined
        }
        return fileObject.checkPermission(targetPath)
    }

    public async getResourceStatsInDirectory( email : string ,targetPath:string) : Promise<NFileObject.IContentStatsObject | undefined>
    {
        const fileObject = this.getFileObject(email)
        if(!fileObject)
        {
            return undefined
        }

        return fileObject.getResourceStatsInDirectory(targetPath)
        
    }

    public async copy(email : string, source:ReadonlyArray<string>, destination:string) : Promise<Array<NFileObject.ICopyStatus> | undefined>
    {
        const fileObject = this.getFileObject(email)
        if(!fileObject)
        {
            return undefined
        }
        return fileObject.copy(source, destination)
    }

    public async delete(email : string,target : ReadonlyArray<string>): Promise<Array<NFileObject.IDeleteStatus> | undefined>
    {
        const fileObject = this.getFileObject(email)
        if(!fileObject)
        {
            return undefined
        }
        return fileObject.delete(target)
    }

    public async move(email : string ,source : Array<string>, destination: string): Promise<Array<NFileObject.IMoveStatus> | undefined>
    {
        const fileObject = this.getFileObject(email)
        if(!fileObject)
        {
            return undefined
        }
        return fileObject.move(source, destination)
    }
}
