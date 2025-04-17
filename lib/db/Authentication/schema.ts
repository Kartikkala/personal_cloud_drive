import { Schema } from "mongoose"
import { IUserDocument } from "../../../types/lib/db/Authentication/types.js"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"



export function userSchema(mongoose : IDatabase) : Schema<IUserDocument>
{
    return new mongoose.Schema<IUserDocument>({
        name : String,
        email : {
            type : String,
            required : true,
            unique : true,
            index : true
        }, 
        passwordHash : String,
        admin : Boolean,
        subscriptionId : String
    })
}

