import { MongoClient, ServerApiVersion } from "mongodb"
import {user_auth_db_configs, session_configs} from "../../configs/app_config.js" 
import dotenv from "dotenv"
import MongoStore from "connect-mongo"

dotenv.config()

// Configuration

const dbName = user_auth_db_configs.user_auth_db_name
const userCollectionName = user_auth_db_configs.user_auth_db_collection_name
const uri = process.env.MONGO_CONNECTION_STRING
const mongoOptions = {
    appName: user_auth_db_configs.app_name,
    serverApi : ServerApiVersion.v1,
    tls : true,
    compressors: "zstd",
    connectTimeoutMS : user_auth_db_configs.connection_timeout_ms,
}

// Instantiation

const mongodb = new MongoClient(uri, mongoOptions)
const mongoStore = MongoStore.create({client: mongodb, dbName : session_configs.sessionDBname , collectionName: session_configs.session_collection_name})

// Usage

const db = mongodb.db(dbName)
const userCollection = db.collection(userCollectionName)
const inactiveDownloadsCollection = db.collection(user_auth_db_configs.user_inactive_downloads_collection_name)

export { mongodb, db, userCollection, inactiveDownloadsCollection, mongoStore }