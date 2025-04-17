import { Types } from "mongoose"

export interface IUserDiskStatsDatabase{
    createNewUser(email : String, totalUserSpace : number, userDirName : string, userDirMountPath : string) : Promise<boolean>,
    getDiskStatsForAllUsers() : Promise<Array<IUserDiskStats>>,
    modifyTotalUserSpace(email : String, newTotalUserSpace : number) : Promise<boolean>,
    deleteUser(email : string) : Promise<boolean>
}

export interface IUserDiskStats{
    _id? : Types.ObjectId,
    email : string,
    userDirName : string,
    userDirMountPath : string,
    totalSpace : number
}