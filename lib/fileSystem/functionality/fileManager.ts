import fs from 'fs/promises'
import filesystem, { ReadStream, WriteStream } from 'fs'
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
    private fileObjectPool : Map<string, NFileObject.IFileObject> = new Map<string, NFileObject.IFileObject>()
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
        this.createNewUser = this.createNewUser.bind(this)
        this.deallocateSpace = this.deallocateSpace.bind(this)
        this.createAndMountFileObjects = this.createAndMountFileObjects.bind(this)
        this.refreshMountedDiskStats = this.refreshMountedDiskStats.bind(this)
        this.checkPermission = this.checkPermission.bind(this)
        this.getResourceStats = this.getResourceStats.bind(this)
        this.getResourceStatsInDirectory = this.getResourceStatsInDirectory.bind(this)
        this.copy = this.copy.bind(this)
        this.move = this.move.bind(this)
        this.delete = this.delete.bind(this)
        this.changeTotalUserSpace = this.changeTotalUserSpace.bind(this)
        this.getUserInfo = this.getUserInfo.bind(this)
    }

    public static async getInstance(mountPaths : Array<string>, database : IUserDiskStatsDatabase ,workingDirName? : string)
    {
        if(!this.instance)
        {
            this.instance = new FileObjectManager(this.instanceKey, mountPaths, database, workingDirName)
        }
        const userDirStats = await database.getDiskStatsForAllUsers()
        console.log("\x1b[33m",'Info : Fetching filesystem stats from database for all users...', "\x1b[0m")
        this.instance.createAndMountFileObjects(userDirStats)
        return this.instance
    }

    public async checkSpaceAvailability(email :string, targetSpace : number)
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return await fileObject.checkSpaceAvailaiblity(targetSpace)
        }
        return undefined
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
                let absolutePath = undefined
                try{
                    absolutePath = filesystem.realpathSync(mountPath)
                }
                catch(e)
                {
                    console.error("\x1b[31m",`Error mounting :\x1b[34m${mountPath} \x1b[31m`)
                    console.log("\x1b[33m", `Hint : Check if the path exists`, "\x1b[0m")
                    process.exit(-1)
                }
                const validatedPathArray = absolutePath.split("/")
                if(validatedPathArray.length > 1 && !mountedPathsRoot.has(validatedPathArray[1]))
                {
                    this.mountedPaths.push(mountPath)
                    this.provisionedDiskUsageByMountPath[mountPath] = 0
                    mountedPathsRoot.add(validatedPathArray[1])
                }
                else
                {
                    throw new Error(absolutePath)
                }
            })
            return true
        }
        catch(e : any)
        {
            console.log(`Path not valid to mount: ${e.message}\n`)
            console.log(`Please check if you have not specified same path 2 times.`)
            process.exit(-1)
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
            this.fileObjectPool.set(userStats.email.toString(), fileObject)
        })   
        return true
    }


    private async allocateSpace(email : string ,storageSpaceinBytes : number) : Promise<IUserDiskStats | undefined>
    {
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

    public async createNewUser(email : string, storageSpaceinBytes : number) : Promise<IUserDiskStats | undefined | null>
    {
        if(!this.fileObjectPool.has(email))
        {
            return await this.allocateSpace(email, storageSpaceinBytes)
        }
        return null
    }

    public deallocateSpace(userDirName : string, userDirMountPath : string){

    }

    public async changeTotalUserSpace(email : string, newTotalUserSpaceInBytes : number)
    {
        const userFileObject = this.fileObjectPool.get(email)
        if(userFileObject)
        {
            if(await this.database.modifyTotalUserSpace(email, newTotalUserSpaceInBytes))
            {
                return userFileObject.changeTotalUserSpace(newTotalUserSpaceInBytes)
            }
            else{
                throw new Error('DatabaseError')
            }
        }
        return undefined
    }

    public async checkPermission(email : string, targetPath : string)
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.checkPermission(targetPath)
        }
        return undefined
    }

    public async getResourceStats(email : string, targetPath : string) : Promise<NFileObject.IFileStats | undefined | null>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.getResourceStats(targetPath)
        }
        
        return undefined
    }

    public async getResourceStatsInDirectory( email : string ,targetPath:string) : Promise<NFileObject.IContentStatsObject | undefined>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.getResourceStatsInDirectory(targetPath)
        }
        return undefined
    }

    public async copy(email : string, source:ReadonlyArray<string>, destination:string) : Promise<Array<NFileObject.ICopyStatus> | undefined>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.copy(source, destination)
        }
        return undefined
    }

    public async delete(email : string,target : ReadonlyArray<string>): Promise<Array<NFileObject.IDeleteStatus> | undefined>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.delete(target)
        }
        return undefined
    }

    public async move(email : string ,source : Array<string>, destination: string): Promise<Array<NFileObject.IMoveStatus> | undefined>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.move(source, destination)
        }
        return undefined
    }

    public async getUserInfo(email : string)
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return await fileObject.getUserInfo()
        }
        return undefined
    }

    public async getReadStream(email : string, targetPath : string, start? : number, end? : number) : Promise<ReadStream | undefined | null>
    {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.getReadStream(targetPath, start, end)
        }
        return undefined
    }

    public async getWriteStream(email: string, targetPath: string, resourceSize : number): Promise<WriteStream | undefined | null> {
        const fileObject = this.fileObjectPool.get(email)
        if(fileObject)
        {
            return fileObject.getWriteStream(targetPath, resourceSize)
        }
        return undefined
    }

}
