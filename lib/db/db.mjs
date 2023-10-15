import { MongoClient, ServerApiVersion } from "mongodb"
import {user_auth_db_configs} from "../../configs/app_config.js" 
import dotenv from "dotenv"

dotenv.config()

const dbName = user_auth_db_configs.user_auth_db_name
const collectionName = user_auth_db_configs.user_auth_db_collection_name
const uri = process.env.MONGO_CONNECTION_STRING
const mongoOptions = {
    appName: user_auth_db_configs.app_name,
    serverApi : ServerApiVersion.v1,
    tls : true,
    compressors: "zstd",
    connectTimeoutMS : user_auth_db_configs.connection_timeout_ms,
}
const mongodb = new MongoClient(uri, mongoOptions)
const db = mongodb.db(dbName)
const userCollection = db.collection(collectionName)

export { mongodb, db, userCollection }