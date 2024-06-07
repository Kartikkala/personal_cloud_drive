import { ConnectOptions } from "mongoose"
import {Mongoose} from "mongoose"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"

// Configuration

export default class Database extends Mongoose implements IDatabase{
    private mongoConnectionString : string = ''
    private connected : boolean = false
    private connectionOptionsForMongo : ConnectOptions
    constructor(databaseName : string | undefined, mongoConnectionString : string | undefined, connectionTimeoutDurationMs : number | undefined)
    {
        if(!mongoConnectionString)
        {
            throw new Error("Mongo connection string not present")
        }
        const connectionOptions : ConnectOptions = {
            dbName: databaseName,
            tls : true,
            compressors: "zstd",
            connectTimeoutMS : connectionTimeoutDurationMs
        }
        super(connectionOptions)
        this.connectionOptionsForMongo = connectionOptions
        this.mongoConnectionString = mongoConnectionString
        this.connectToDatabase = this.connectToDatabase.bind(this)
    }
    public async connectToDatabase() : Promise<boolean>
    {
        try{
            if(!this.connected)
            {
                await this.connect(this.mongoConnectionString, this.connectionOptionsForMongo)
                this.connected = true
                console.log("Connected to database!")
            }
            else {
                console.log("Executing database operation!")
            }
            return true
        }
        catch(e)
        {
            console.error("Error connecting to database")
            console.error(e)
            return false
        }
    }
}
