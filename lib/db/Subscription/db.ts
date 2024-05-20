import { ObjectId } from "mongodb"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { ISubscriptionDocument, ISubscriptionDatabase } from "../../../types/lib/db/subscription/types.js"
import { getSubscriptionCollection } from "./models.js"
import crypto from 'crypto'

export default class SubscriptionDatabase implements ISubscriptionDatabase{
    private database : IDatabase
    private subscriptionCollection 
    constructor(database : IDatabase, subscriptionCollectionName : string)
    {
        this.database = database
        this.subscriptionCollection = getSubscriptionCollection(database, subscriptionCollectionName)
    }
    public async getAllSubscriptions() : Promise<ISubscriptionDocument[]>
    {
        let result : ISubscriptionDocument[] = []
        if(await this.database.connectToDatabase()){
            try{
                result = await this.subscriptionCollection.find()
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }

    public async addNewSubscription(subscription_codename : string,
        subscription_duration_seconds : Number,
        subscription_price : Number,
        allocated_space_bytes : Number,
        streaming_support : Boolean,
        hls_support : Boolean): Promise<ISubscriptionDocument | undefined> {
        let result = undefined
        if(await this.database.connectToDatabase())
        {
            try{
                const subscription = {
                    'subscription_id' : new ObjectId(crypto.randomUUID()),
                    'subscription_codename' : subscription_codename,
                    'subscription_duration_seconds' : subscription_duration_seconds, 
                    'allocated_space_bytes' : allocated_space_bytes, 
                    'streaming_support' : streaming_support,
                    'hls_support' : hls_support
                }
                new this.subscriptionCollection(subscription).save().then((document)=>{
                    if(document.subscription_id === subscription.subscription_id)
                    {
                        result = document
                    }
                })

            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }

    public async removeSubscription(subscription_id: string): Promise<Boolean> {
        let result = false
        if(await this.database.connectToDatabase())
        {
            try{
                result = (await this.subscriptionCollection.deleteOne({subscription_id : new ObjectId(subscription_id)})).acknowledged
            }
            catch(e)
            {
                console.error(e)
            }
        }
        return result
    }

}