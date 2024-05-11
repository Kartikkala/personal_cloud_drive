import { Schema } from "mongoose"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"

interface IInactiveDownloads{
    email : string, 
    downloads : Array<string>
}

export function inactiveDownloadsSchema(mongoose : IDatabase) : Schema<IInactiveDownloads>
{
    return new mongoose.Schema<IInactiveDownloads>({
        email : String,
        downloads : Array
    })
}
