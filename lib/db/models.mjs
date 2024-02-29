import { userSchema, inactiveDownloadsSchema } from "./schema.mjs"
import { userCollectionName, inactiveDownloadsCollectionName, mongoose } from "./db.mjs"

const userCollection = mongoose.model("user", userSchema, userCollectionName)
const inactiveDownloadsCollection = mongoose.model("inactiveDownload", inactiveDownloadsSchema, inactiveDownloadsCollectionName)

export {userCollection, inactiveDownloadsCollection }