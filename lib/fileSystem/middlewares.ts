import { IFileObjectManager } from "../../types/lib/fileSystem/types.js"
import { Request, Response, NextFunction } from "express"

export class FileObjectManagerMiddleware{

    // TODO : Add proper await statements wherever required in each of the functions of this class
    // (mostly in the request.user and request.body properties)
    private fileObjectManager : IFileObjectManager
    constructor(fileObjectManager : IFileObjectManager, mongoDbUserDiskStatsCollection){
        if(!fileObjectManager || !mongoDbUserDiskStatsCollection)
        {
            throw new Error("File manager / mongo db user disk stats collection object missing")
        }
        this.fileObjectManager = fileObjectManager
        this.copyMiddleware = this.copyMiddleware.bind(this)
        this.deleteMiddleware = this.deleteMiddleware.bind(this)
        this.moveMiddleware = this.moveMiddleware.bind(this)
        this.getResourceStatsInDirectoryMiddleware = this.getResourceStatsInDirectoryMiddleware.bind(this)
        this.addNewUserMiddleware = this.addNewUserMiddleware.bind(this)
    }
    async copyMiddleware(request : Request, response : Response, next : NextFunction)
    {
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        let destination = request.body.destination

        const fileObject = this.fileObjectManager.getFileObject(request.user._id.toString())
        
        response.locals.result = await fileObject.copy(source, destination)
        return next()
    }

    async deleteMiddleware(request : Request, response : Response, next : NextFunction)
    {
        const targetPath = request.body.targetPath
        if(!targetPath)
        {
            return next()
        }
        let targetPathArray = Array.isArray(targetPath) ? targetPath : [targetPath]
        const fileObject = this.fileObjectManager.getFileObject(request.user._id.toString())

        response.locals.result = await fileObject.delete(targetPathArray)
        return next()
    }

    async moveMiddleware(request : Request & , response : Response, next : NextFunction)
    {
        let source = Array.isArray(request.body.source) ? request.body.source : [request.body.source]
        
        let destination = await request.body.destination
        const userId = await request.user._id.toString()
        const fileObject = this.fileObjectManager.getFileObject(request.user._id.toString())

        response.locals.result = await fileObject.move(source, destination)
        return next()
    }

    async getResourceStatsInDirectoryMiddleware(request : Request,response : Response, next : NextFunction)
    {
        const targetPath = await request.body.targetPath
        if(!targetPath)
        {
            return next()
        }

        const userId = await request.user._id.toString()
        const fileObject = this.fileObjectManager.getFileObject(userId)

        response.locals.result =  await fileObject.getResourceStatsInDirectory(targetPath)
        return next()
    }

    async addNewUserMiddleware(request : Request, response : Response, next : NextFunction)
    {
        // TODO : Create a condition that checks if the app is using subscription system
        // or is using an admin system. For now, any user can allow access to himself by
        // just calling this middleware

        const userId = await request.user._id
        const userDiskStats = await this.fileObjectManager.allocateSpace(userId.toString(), 1073741824)
        response.locals.result = userDiskStats
        return next()
    }

    async deleteUserMiddleware(request : Request, response : Response, next : NextFunction)
    {

    }

}