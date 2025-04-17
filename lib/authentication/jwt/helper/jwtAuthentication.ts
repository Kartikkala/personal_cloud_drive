// Types

import { IAuthenticationDatabase, IUserDocumentReduced } from "../../../../types/lib/db/Authentication/types.js"
import { IJwtOptions , IJwtPayload} from "../../../../types/lib/authentication/jwt/helper/types.js"

// Dependencies

import jwt from "jsonwebtoken"
import { Authentication } from "../../helper/authentication.js"

export class JwtAuthentication extends Authentication{
    private secretPrivateKey : string | Buffer
    private secretPublicKey : string | Buffer
    constructor(database : IAuthenticationDatabase, privateKey : string | Buffer, publicKey : string | Buffer, options? : IJwtOptions)
    {
        super(database)
        this.secretPrivateKey = privateKey
        this.secretPublicKey = publicKey
        this.issueJwt = this.issueJwt.bind(this)
        this.verifyJwt = this.verifyJwt.bind(this)
    }


    protected async issueJwt(user : IUserDocumentReduced) : Promise<string>
    {
        const payload : IJwtPayload = {
            sub : user._id?.toString(),
            email : user.email,
            admin : user.admin,
            name : user.name,
            subscriptionId : user.subscriptionId
        }
        const signedJwt = new Promise <string>((resolve, reject)=>{
            jwt.sign(payload, this.secretPrivateKey, {algorithm : "RS256", expiresIn : "10h"}, (error, signature)=>{
                if(error)
                {
                    return reject(error)
                }    
                if(signature)
                {
                    return resolve(signature)
                }
            })
        })
        return signedJwt
    }

    protected async verifyJwt(token: string): Promise<IJwtPayload> {
        return new Promise <IJwtPayload>((resolve, reject)=>{
            jwt.verify(token, this.secretPublicKey, (error, payload)=>{
                if(error)
                {
                    return reject(error)
                }
                if(payload)
                {
                    payload
                    resolve(payload as IJwtPayload)
                }
            })
        })
    }
}