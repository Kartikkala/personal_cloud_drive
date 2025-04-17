import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { inactiveDownloadsSchema } from "./schema.js"

export default function inactiveDownloads(mongoose : IDatabase, inactiveDownloadsCollectionName : string)
{
    return mongoose.model("inactiveDownloads", inactiveDownloadsSchema(mongoose), inactiveDownloadsCollectionName)
}
