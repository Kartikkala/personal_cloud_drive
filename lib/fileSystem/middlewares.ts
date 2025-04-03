import { IUserDiskStatsDatabase } from "../../types/lib/db/FileManager/types.js"
import { NFileObjectManager } from "../../types/lib/fileSystem/types.js"
import { Request, Response, NextFunction } from "express"
import { FileObjectManager } from "./functionality/fileManager.js"


export class FileObjectManagerMiddleware{

    // TODO : Add proper await statements wherever required in each of the functions of this class
    // (mostly in the request.user and request.body properties)
    private _fileManager : NFileObjectManager.IFileObjectManager
    private static instance : null | FileObjectManagerMiddleware = null
    private static instanceKey : Symbol = Symbol("UniqueFileManagerMiddlewaresKey")
    private static _initialized : boolean
    constructor(instanceKey : Symbol, fileObjectManager : NFileObjectManager.IFileObjectManager ,mountPaths : Array<string>, database : IUserDiskStatsDatabase, workingDirName? : string){
        if(instanceKey !== FileObjectManagerMiddleware.instanceKey)
        {
            throw new Error("Please use FileObjectManagerMiddleware.getInstance() to create an instance of this class")
        }
        if(!mountPaths || !database || !fileObjectManager)
        {
            throw new Error("File manager / database object / mountPaths missing")
        }
        FileObjectManagerMiddleware.initialized = true
        this._fileManager = fileObjectManager
        this.copyMiddleware = this.copyMiddleware.bind(this)
        this.deleteMiddleware = this.deleteMiddleware.bind(this)
        this.moveMiddleware = this.moveMiddleware.bind(this)
        this.getResourceStatsInDirectoryMiddleware = this.getResourceStatsInDirectoryMiddleware.bind(this)
        this.addNewUserMiddleware = this.addNewUserMiddleware.bind(this)
        this.getDiskStats = this.getDiskStats.bind(this)
    }

    public get fileManager()
    {
        return this._fileManager
    }

    private set fileManager(value : NFileObjectManager.IFileObjectManager)
    {
        this._fileManager = value
    }

    public static get initialized() : boolean
    {
        return FileObjectManagerMiddleware._initialized
    }
    private static set initialized(value : boolean)
    {
        this._initialized = value
    }

    public static async getInstance(mountPaths : Array<string>, database : IUserDiskStatsDatabase, workingDirName? : string)
    {
        if(!this.instance)
        {
            const fileObjectManagerInstance = await FileObjectManager.getInstance(mountPaths, database, workingDirName)
            this.instance = new FileObjectManagerMiddleware(this.instanceKey, fileObjectManagerInstance ,mountPaths, database, workingDirName)
        }
        return this.instance
    }

    async copyMiddleware(request : Request, response : Response, next : NextFunction)
    {
        if(!request.user)
        {
            return next()
        }
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        let destination = request.body.destination
        const user = request.user

        const result = await this.fileManager.copy(user.email, source, destination)
        
        response.locals.result = result
        return next()
    }

    async deleteMiddleware(request : Request, response : Response, next : NextFunction)
    {
        if(!request.user)
        {
            return next()
        }
        const targetPath = request.body.targetPath
        if(!targetPath)
        {
            return next()
        }
        let targetPathArray = Array.isArray(targetPath) ? targetPath : [targetPath]
        const result = await this.fileManager.delete(request.user.email, targetPathArray)

        response.locals.result = result
        return next()
    }

    async moveMiddleware(request : Request , response : Response, next : NextFunction)
    {
        if(!request.user)
        {
            return next()
        }
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        
        let destination = await request.body.destination
        const result = await this.fileManager.move(request.user.email, source, destination)

        response.locals.result = result
        return next()
    }

    async getResourceStatsInDirectoryMiddleware(request : Request ,response : Response, next : NextFunction)
    {
        if(!request.user)
        {
            return next()
        }
        const targetPath = await request.body.targetPath
        if(!targetPath)
        {
            return next()
        }

        const result = await this.fileManager.getResourceStatsInDirectory(request.user.email, targetPath)

        response.locals.result =  result
        return next()
    }

    async addNewUserMiddleware(request : Request, response : Response, next : NextFunction)
    {

        if(!request.user)
        {
            return next()
        }
        
        const userCreationResult = {
            alreadyExists : false,
            databaseError : false,
            success : false,
            allocatedSpace : 0
        }
        const userDiskStats = await this.fileManager.createNewUser(request.user.email, 1073741824)
        if(userDiskStats === null)
        {
            userCreationResult.alreadyExists = true
        }
        else if(userDiskStats === undefined)
        {
            userCreationResult.databaseError = true
        }
        else
        {
            userCreationResult.success = true
            userCreationResult.allocatedSpace = userDiskStats.totalSpace
        }
        response.locals.userDriveDetails = userCreationResult
        return next()
    }

    async getDiskStats(request : Request, response : Response, next : NextFunction)
    {
        if(!request.user)
        {
            return next()
        }
        const diskStats = await this.fileManager.getUserInfo(request.user.email)
        if(diskStats)
        {
            const res = {
                totalSpace : diskStats.totalUserSpaceInBytes,
                usedSpace : diskStats.usedSpaceInBytes                
            }
            response.locals.result = res
            return next()
        }
        return next()
    }

    async deleteUserMiddleware(request : Request, response : Response, next : NextFunction)
    {
        // TODO
    }

}