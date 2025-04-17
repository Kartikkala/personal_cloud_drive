import { getSubscriptionSchema } from "./schema.js"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"
import { Model } from "mongoose"
import { ISubscriptionDocument } from "../../../types/lib/db/subscription/types.js"

export function getSubscriptionCollection(mongoose : IDatabase, subscriptionCollectionName : string) : Model<ISubscriptionDocument>
{
    return mongoose.model('subscriptions', getSubscriptionSchema(mongoose), subscriptionCollectionName)
}