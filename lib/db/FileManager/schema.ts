import { Schema, Types } from "mongoose"
import { IUserDiskStats } from "../../../types/lib/db/FileManager/types.js"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"



export function userDiskStatsSchema(mongoose : IDatabase) : Schema
{
    return new mongoose.Schema<IUserDiskStats>({
        email : String,
        userDirName : String,
        userDirMountPath : String,
        totalSpace : Number
    })
}

