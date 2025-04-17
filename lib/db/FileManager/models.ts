import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { userDiskStatsSchema } from "./schema.js"

export function userDiskStatsCollection(mongoose : IDatabase, userDiskStatsCollectionName : string)
{
    return mongoose.model("userDiskStats", userDiskStatsSchema(mongoose), userDiskStatsCollectionName)
}