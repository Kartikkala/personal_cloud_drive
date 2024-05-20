import { Types } from "mongoose"

export interface ISubscription{
    subscription_codename : string,
    subscription_duration_seconds : Number,
    allocated_space_bytes : Number,
    streaming_support : Boolean,
    hls_support : Boolean
}