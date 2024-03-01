import {user_auth_db_configs, session_configs} from "../../configs/app_config.js" 
import dotenv from "dotenv"
import MongoStore from "connect-mongo"
import mongoose from "mongoose"

dotenv.config()

// Configuration

const userAuthDbName = user_auth_db_configs.user_auth_db_name
const userCollectionName = user_auth_db_configs.user_auth_db_collection_name
const inactiveDownloadsCollectionName = user_auth_db_configs.user_inactive_downloads_collection_name
const uri = process.env.MONGO_CONNECTION_STRING
const mongoOptions = {
    dbName: userAuthDbName,
    tls : true,
    compressors: "zstd",
    connectTimeoutMS : user_auth_db_configs.connection_timeout_ms,
}

// Instantiation

try{
    mongoose.connect(uri, mongoOptions)
    console.log("Connected to mongo db database!")
}
catch(exception)
{
    console.log("Error connecting mongo db database! Exiting...")
    console.log(exception)
    process.exit(-1)
}

const mongoStore = MongoStore.create({client: mongoose.connection.getClient(), dbName : session_configs.sessionDBname , collectionName: session_configs.session_collection_name})


export { mongoose, userCollectionName, inactiveDownloadsCollectionName, mongoStore }