import { Types } from "mongoose"

export interface ISubscriptionDocument{
    _id? : Types.ObjectId,
    subscription_id : Types.ObjectId,
    subscription_price : Number,
    subscription_codename : string,
    subscription_duration_seconds : Number,
    allocated_space_bytes : Number,
    streaming_support : Boolean,
    hls_support : Boolean
}

export interface ISubscriptionDatabase{
    getAllSubscriptions() : Promise<ISubscriptionDocument[]>,
    addNewSubscription(
        subscription_codename : string,
        subscription_duration_seconds : Number,
        subscription_price : Number,
        allocated_space_bytes : Number,
        streaming_support : Boolean,
        hls_support : Boolean)  : Promise<undefined | ISubscriptionDocument>,
    removeSubscription(subscription_id : string)  : Promise<Boolean>
}
