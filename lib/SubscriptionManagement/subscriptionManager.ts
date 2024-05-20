import { ISubscriptionDocument, ISubscriptionDatabase } from "../../types/lib/db/subscription/types.js"
import { ISubscription } from "../../types/lib/subscription/types.js"

export default async function subscriptionManager(database : ISubscriptionDatabase)
{
    const subscriptions = await database.getAllSubscriptions()
    return new SubscriptionManager(database, subscriptions)
}

export class SubscriptionManager {
    private _database
    private _availableSubscriptionsDetails = new Map<string, ISubscriptionDocument>()
    constructor(database: ISubscriptionDatabase, subscriptions: ISubscriptionDocument[]) {
        this._database = database
        for (let i = 0; i < subscriptions.length; i++) {
            this._availableSubscriptionsDetails.set(subscriptions[i].subscription_id.toString(), subscriptions[i])
        }
    }
    public getAllSubscriptions(): ISubscription[] {
        const subscriptions : ISubscription[] = []
        for(const [key, value] of this._availableSubscriptionsDetails)
        {
            subscriptions.push(value)
        }   
        return subscriptions
    }

    public getSubscriptionInfo(subscription_id : string) : ISubscriptionDocument | undefined{
        return this._availableSubscriptionsDetails.get(subscription_id)
    }

    public async addNewSubscription(subscription_codename: string,
        subscription_duration_seconds: Number,
        subscription_price : Number,
        allocated_space_bytes: Number,
        streaming_support: Boolean,
        hls_support: Boolean): Promise<Boolean> {
        const subscription = await this._database.addNewSubscription(subscription_codename,
            subscription_duration_seconds, subscription_price, allocated_space_bytes, streaming_support, hls_support)
        if (subscription) {
            this._availableSubscriptionsDetails.set(subscription.subscription_id.toString(), subscription)
            return true
        }
        return false
    }

    public async deleteSubscription(subscription_id : string)
    {
        const deletion = await this._database.removeSubscription(subscription_id)
        if(deletion)
        {
            return this._availableSubscriptionsDetails.delete(subscription_id)
        }
        return false
    }
}