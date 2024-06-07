import Authorisation from "./authorisation.js"
import { Request, Response, NextFunction } from "express"

export default class AuthorisationMiddlewareFactory{
    private _authorizer
    private otpLength : number
    private senderName : string
    private static instanceKey = Symbol('UniqueAuthorisationInstanceKey')
    private static instance : AuthorisationMiddlewareFactory | undefined
    constructor(instanceKey : Symbol, serviceName : string, serviceHostAddress : string, servicePortNumber : number, secure : boolean, email? : string, password? : string, senderName?: string, otpLength? : number)
    {
        if(!(instanceKey === AuthorisationMiddlewareFactory.instanceKey))
        {
            throw new Error("Please use AuthorisationMiddlewareFactory.getInstance() to get an instance of this class")
        }
        this._authorizer = new Authorisation(serviceName, serviceHostAddress, servicePortNumber, secure, email, password)
        this.otpLength = otpLength || 3
        this.senderName = senderName || 'Cloud Drive'

        this.generateAndSendRegistrationOtpMiddleware = this.generateAndSendRegistrationOtpMiddleware.bind(this)
        this.verifyOtpMiddleware = this.verifyOtpMiddleware.bind(this)
    }
    public static getInstance(serviceName : string, serviceHostAddress : string, servicePortNumber : number, secure : boolean, email? : string, password? : string, senderName? : string, otpLength? : number)
    {
        if(!this.instance)
        {
            this.instance = new AuthorisationMiddlewareFactory(this.instanceKey, serviceName, serviceHostAddress, servicePortNumber, secure, email, password, senderName, otpLength)
        }
        return this.instance
    }

    public async generateAndSendRegistrationOtpMiddleware(request : Request, response : Response, next : NextFunction)
    {
        if(!request.body.email)
        {
            return response.status(400).json({message : "Email is required"})
        }
        const result = await this._authorizer.generateAndSendOtp(request.body.email, this.senderName, this.otpLength)
        return response.status(200).json(result)
    }   

    public async verifyOtpMiddleware(request : Request, response : Response, next : NextFunction)
    {
        if(!request.body.email || !request.body.otp)
        {
            return response.status(400).json({message : "Email and OTP are required!"})
        }
        if(this._authorizer.verifyOtp(request.body.email, request.body.otp))
        {
            return next()
        }
        return response.status(401).json({message : "Invalid OTP"})
    }
}