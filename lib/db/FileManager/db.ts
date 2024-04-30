import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { userDiskStatsCollection } from "./models.js"
import { IUserDiskStats, IUserDiskStatsDatabase } from "../../../types/lib/db/FileManager/types.js"

export default class UserDiskStatsDatabase implements IUserDiskStatsDatabase{
    private database : IDatabase
    private userDiskStatsCollection
    constructor(database : IDatabase, userDiskStatsCollectionName : string)
    {
        if(!database || !userDiskStatsCollectionName)
        {
            throw new Error("Database object/ userDiskStatsCollectionName missing!")
        }
        this.database = database
        this.userDiskStatsCollection = userDiskStatsCollection(database, userDiskStatsCollectionName)
    }

    public async createNewUser(email: String, totalUserSpace: number, userDirName: string, userDirMountPath: string): Promise<boolean> {
        const connectionStatus = await this.database.connectToDatabase()
        let result = false
        if(connectionStatus)
        {
            try{
                const oldUser = await this.userDiskStatsCollection.findOne({email : email})
                if(!oldUser)
                {
                    await this.userDiskStatsCollection.create
                        ({
                            "email" : email,
                            "totalSpace" : totalUserSpace,
                            "userDirName" : userDirName,
                            "userDirMountPath" : userDirMountPath
                        })
                    result = true
                }
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }
        
    public async getDiskStatsForAllUsers(): Promise<IUserDiskStats[]> {
        const connectionStatus = await this.database.connectToDatabase()
        let result : IUserDiskStats[] = []
        if(connectionStatus)
        {
            try{
                result = await this.userDiskStatsCollection.find()
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }

    public async modifyTotalUserSpace(email: String, newTotalUserSpace: number): Promise<boolean> {
        const connectionStatus = await this.database.connectToDatabase()
        let result = false
        if(connectionStatus)
        {
            try{
                const update = await this.userDiskStatsCollection.findOneAndUpdate({email : email}, {totalSpace : newTotalUserSpace})
                console.log(update)
                result = true
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }

    public async deleteUser(email: string): Promise<boolean> {
        const connectionStatus = await this.database.connectToDatabase()
        let result = false
        if(connectionStatus)
        {
            try{
                const deleteStatus = await this.userDiskStatsCollection.findOneAndDelete({email : email})
                console.log(deleteStatus)
                result = true
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }
}