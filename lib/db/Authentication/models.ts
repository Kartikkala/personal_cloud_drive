import { Model } from "mongoose"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { userSchema } from "./schema.js"
import { IUserDocument } from "../../../types/lib/db/Authentication/types.js"


export default function userCollection(mongoose : IDatabase, userCollectionName : string) : Model<IUserDocument>
{
    return mongoose.model("user", userSchema(mongoose), userCollectionName)
}

