import { ISubscriptionDatabase, ISubscriptionDocument } from "../../types/lib/db/subscription/types.js";
import { SubscriptionManager } from "./subscriptionManager.js";

export default class SubscriptionManagerFactory{
    private _subscriptionManager
    private static _instance : SubscriptionManagerFactory | undefined
    private static key = Symbol('uniqueSubscriptionManagerKey')
    constructor(key : Symbol, database : ISubscriptionDatabase, subscriptions : ISubscriptionDocument[])
    {
        if(key !== SubscriptionManagerFactory.key)
        {
            throw new Error('Use SubscriptionManagerFactory.getInstance() to get an instance of this class')
        }
        this._subscriptionManager = new SubscriptionManager(database, subscriptions)
    }
    public static getInstance(database : ISubscriptionDatabase, subscriptions : ISubscriptionDocument[])
    {
        if(!this._instance)
        {
            this._instance = new SubscriptionManagerFactory(this.key, database, subscriptions)
        }
        return this._instance
    }
    public get subscriptionManager()
    {
        return this._subscriptionManager
    }
}