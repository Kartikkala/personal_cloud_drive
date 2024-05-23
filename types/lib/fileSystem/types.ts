// Type specification for fileObject.js
import { ReadStream, WriteStream } from "fs"
import { IUserDiskStats } from "../db/FileManager/types.js"

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
        getResourceStats(targetPath : string)                       : Promise<NFileObject.IFileStats | null>,
        getDirectoryContents(targetPath: string)                    : Promise<IContentObject>,
        getResourceStatsInDirectory(targetPath:string)              : Promise<IContentStatsObject>,
        changeTotalUserSpace(updatedTotalUserSpaceInBytes : number) : number,
        copy(source:ReadonlyArray<string>, destination:string)      : Promise<Array<ICopyStatus>>,
        delete(target : ReadonlyArray<string>)                      : Promise<Array<IDeleteStatus>>,
        move(source : Array<string>, destination: string)           : Promise<Array<IMoveStatus>>,
        getUserInfo()                                               : IUserDiskStats,
        updateUsedDiskSpace(spaceToAddInBytes : number)             : boolean,
        getCurrentUserDirSize()                                     : Promise<number>,
        getReadStream(targetPath : string, start? : number, end? : number) : Promise<ReadStream | null>,
        getWriteStream(targetPath : string, resourceSize : number)  : Promise<WriteStream | null>
    }

    export interface IUserDiskStats{
        USER_HOME             : string,
        totalUserSpaceInBytes : number,
        usedSpaceInBytes      : number
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
        serviceStatus                                                                    : boolean,
        addNewMountPaths(mountPaths: Array<string>)                                      : boolean,
        refreshMountedDiskStats()                                                        : boolean,
        createAndMountFileObjects(userDiskStats : Array<IUserDiskStats>)                 : boolean,
        createNewUser(email : string, storageSpaceinBytes : number)                      : Promise<IUserDiskStats | undefined | null>,
        changeTotalUserSpace(email : string, newTotalUserSpaceInBytes : number)          : Promise<number | undefined>,
        checkPermission(email : string, targetPath : string)                            : Promise<NFileObject.IPermissionObject | undefined>,
        getResourceStats(email : string, targetPath : string)                           : Promise<NFileObject.IFileStats | undefined | null>,
        getResourceStatsInDirectory(email : string, targetPath:string)                  : Promise<NFileObject.IContentStatsObject | undefined>,
        copy(email : string, source:ReadonlyArray<string>, destination:string)          : Promise<Array<NFileObject.ICopyStatus> | undefined>,
        delete(email : string, target : ReadonlyArray<string>)                          : Promise<Array<NFileObject.IDeleteStatus> | undefined>,
        move(email : string, source : Array<string>, destination: string)               : Promise<Array<NFileObject.IMoveStatus> | undefined>,
        updateUsedDiskSpace(email : string, spaceToAddInBytes : number)                 : boolean | undefined,
        getReadStream(email : string, targetPath : string, start? : number, end? : number) : Promise<ReadStream | undefined | null>,
        getWriteStream(email : string, targetPath : string, resourceSize : number)      : Promise<WriteStream | undefined | null>,
        getUserInfo(email : string)                                                     : NFileObject.IUserDiskStats | undefined
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

