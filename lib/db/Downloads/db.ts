import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import inactiveDownloads from "./models.js"
import { InactiveDowloadsDb } from "../../../types/lib/db/Downloads/types.js"

export default class InactiveDownloadsDatabase implements InactiveDowloadsDb{
    private database : IDatabase
    private inactiveDownloads
    constructor(database : IDatabase, inactiveDownloadsCollectionName : string)
    {
        if(!database)
        {
            throw new Error("Database object missing from InactiveDownloads")
        }
        this.database = database
        this.inactiveDownloads = inactiveDownloads(database, inactiveDownloadsCollectionName)
    }
    public async addInactiveDownload(email : string, downloadGid : string, upsert : boolean) : Promise<Boolean>
    {
        const connectionStatus = await this.database.connectToDatabase()
        if(connectionStatus)
        {
            try{
                const insertOrUpdate = 
                await this.inactiveDownloads.findOneAndUpdate({email : email},
                    {$push : {"downloads" : downloadGid}}, 
                    {upsert : upsert, new : true})
                if(insertOrUpdate)
                { 
                    return true
                }
            }
            catch(e)
            {
                console.error(e)
                console.error("Error while inserting new inactive download")
            }
        }
        return false
    }

    public async getInactiveDownloads(email : string) : Promise<Array<string> | undefined>
    {
        const connectionStatus = await this.database.connectToDatabase()
        if(connectionStatus)
        {
            try{
                const document = await this.inactiveDownloads.findOne({email : email})
                if(document)
                {
                    return document.downloads
                }
            }
            catch(e)
            {
                console.error(e)
                console.error("Error while getting inactive downloads")
            }
        }
        return undefined
    }

    public async removeInactiveDownloads(email : string)
    {
        const connectionStatus = await this.database.connectToDatabase()
        if(connectionStatus)
        {
            try{
                // TODO : Implement the functionality
            }
            catch(e)
            {
                console.error(e)
                console.error("Error while removing inactive download")
            }
        }
    }

}