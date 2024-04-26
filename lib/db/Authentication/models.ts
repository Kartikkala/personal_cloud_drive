import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { userSchema } from "./schema.js"


export default function userCollection(mongoose : IDatabase, userCollectionName : string)
{
    return mongoose.model("user", userSchema(mongoose), userCollectionName)
}

