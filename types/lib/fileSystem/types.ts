// Type specification for fileObject.js

export namespace NFileObject {
    interface PartialPermissionObject{
    permission : boolean,
    exception  : boolean,
    pathExists : boolean,
    }

    export interface IPermissionObject extends PartialPermissionObject{
        dirName    : string,
        fileName   : string | undefined
    }

    export interface IFileObject{
        checkPermission(targetPath : string)                        : Promise<IPermissionObject>,
        getDirectoryContents(targetPath: string)                    : Promise<IContentObject>,
        getResourceStatsInDirectory(targetPath:string)              : Promise<IContentStatsObject>,
        changeTotalUserSpace(updatedTotalUserSpaceInBytes : number) : number,
        copy(source:ReadonlyArray<string>, destination:string)      : Promise<Array<ICopyStatus>>,
        delete(target : ReadonlyArray<string>)                      : Promise<Array<IDeleteStatus>>,
        move(source : Array<string>, destination: string)           : Promise<Array<IMoveStatus>>,
        getUserInfo()                                               : IPartialUserDiskStats
    }

    export interface IPartialUserDiskStats{
        userDirName           : string,
        userDirMountPath      : string,
        totalUserSpaceInBytes : number
    }

    export interface IContentObject extends IPermissionObject{
        content : Array<string>
    }

    export interface IContentStatsObject extends IPermissionObject{
        content : Array<IFileStats>
    }

    export interface IFileStats{
        name : string,
        size : number,
        birthtime : Date,
        isDirectory : boolean,
        isFile : boolean
    }

    export interface ICopyStatus extends PartialPermissionObject{
        target  : string,
        copied  : boolean,
        error   : string
    }

    export interface IDeleteStatus extends PartialPermissionObject{
        target  : string,
        deleted : boolean,
        error   : string
    }

    export interface IMoveStatus extends PartialPermissionObject{
        target  : string,
        moved   : boolean,
        error   : string
    }
}


// Type specification for fileObjectManager.js

export namespace NFileObjectManager{
    export interface IFileObjectManager{
        serviceStatus                                                       : boolean,
        addNewMountPaths(mountPaths: Array<string>)                         : boolean,
        refreshMountedDiskStats()                                           : boolean,
        createAndRegisterFileObjects(userDiskStats : Array<IUserDiskStats>) : boolean,
        getFileObject(id : string)                                          : NFileObject.IFileObject,
        allocateSpace(id : string ,storageSpaceinBytes : number)            : Promise<IUserDiskStats | undefined>,
        
    }

    export interface IFileObjectMap{
        [id : string] : NFileObject.IFileObject
    }

    export interface IUserDiskStats extends NFileObject.IPartialUserDiskStats{
        id : string,
    }

    export interface DiskStats{
        available : number,
        total     : number,
        free      : number
    }

    export interface IDiskStatsByMountPath{
        [mountedPath : string] : DiskStats
    }

    export interface IProvisionedDiskUsageByMountPath{
        [mountPath : string] :  number
    }
}

// Type Specification for middlewares

