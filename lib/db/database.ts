import AuthenticationDatabase from "./Authentication/db.js"
import UserDiskStatsDatabase from "./FileManager/db.js"
import Database from "./helper/db.js"
import { db_configs } from "../../configs/app_config.js"
import { IAuthenticationDatabase } from "../../types/lib/db/Authentication/types.js"
import { IUserDiskStatsDatabase } from "../../types/lib/db/FileManager/types.js"


export default class DatabaseFactory{
    private static instance : DatabaseFactory | null = null
    private static instanceKey = Symbol("uniqueInstanceKey")
    private database
    private readonly AuthenticationDatabase : IAuthenticationDatabase
    private readonly UsersDiskStatsDatabase : IUserDiskStatsDatabase
    constructor(instance_key : Symbol)
    {
        if(instance_key !== DatabaseFactory.instanceKey)
        {
            throw new Error("Please use DatabaseFactory.getInstance method to create an instance")
        }
        const dbConnectionString = process.env.MONGO_CONNECTION_STRING
        const dbName = db_configs.user_auth_db_name
        const connectionTimeoutDurationMs = db_configs.connection_timeout_ms || 12000
        const userCollectionName = db_configs.user_auth_db_collection_name || "users"
        const saltRounds = db_configs.number_of_salt_rounds || 12
        if(!dbConnectionString || !dbName)
        {
            throw new Error("Invalid database configs")
        }
        this.database = new Database(dbName, dbConnectionString, connectionTimeoutDurationMs)
        this.AuthenticationDatabase = new AuthenticationDatabase(this.database, userCollectionName, saltRounds)
        this.UsersDiskStatsDatabase = new UserDiskStatsDatabase(this.database, "UserDiskStats")
    }    
    public static getInstance()
    {
        if(!this.instance)
        {
            this.instance = new DatabaseFactory(this.instanceKey)
        }
        return this.instance
    }
    getAuthenticationDatabase()
    {
        return this.AuthenticationDatabase
    }
    getUserDiskStatsDatabase()
    {
        return this.UsersDiskStatsDatabase
    }
}