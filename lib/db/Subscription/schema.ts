import { ISubscriptionDocument } from '../../../types/lib/db/subscription/types.js'
import { ObjectId } from 'mongodb'
import { IDatabase } from '../../../types/lib/db/UserMangement/types.js'
import { Schema } from 'mongoose'


export function getSubscriptionSchema(mongoose : IDatabase) : Schema<ISubscriptionDocument>
{
    return new mongoose.Schema<ISubscriptionDocument>({
        subscription_id : ObjectId,
        subscription_codename : String,
        subscription_price : Number,
        subscription_duration_seconds : Number,
        allocated_space_bytes : Number,
        streaming_support : Boolean,
        hls_support : Boolean
    })
}