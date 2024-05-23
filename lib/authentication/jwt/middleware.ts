// Types

import { Request, Response, NextFunction } from "express"
import { IJwtOptions } from "../../../types/lib/authentication/jwt/helper/types.js"
import { IAuthenticationDatabase } from "../../../types/lib/db/Authentication/types.js"
import { IJwtAuthenticator } from "../../../types/lib/authentication/jwt/middleware/types.js"

// Dependencies

import { JwtAuthentication } from "./helper/jwtAuthentication.js"
import { Socket } from "socket.io"


export default class JwtAuthenticator extends JwtAuthentication implements IJwtAuthenticator{
    constructor(database : IAuthenticationDatabase,privateKey : string | Buffer, publicKey : string | Buffer, options? : IJwtOptions)
    {
        super(database ,privateKey, publicKey, options)
        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
        this.authenticate = this.authenticate.bind(this)
        this.isAuthenticated = this.isAuthenticated.bind(this)
        this.authenticateSocketIo = this.authenticateSocketIo.bind(this)
    }

    public async login(request: Request, response: Response): Promise<void> {
        const email : string = request.body.email
        const password : string = request.body.password

        const user = await this.logIn(email, password)
        if(user.userDocument)
        {
            const res = {success : user.success, error : user.error, token : await this.issueJwt(user.userDocument)}
            response.status(200).json(res)
        }
        else
        {
            response.status(500).json({success : user.success, error : user.error})
        }
    }

    public async register(request: Request, response: Response, next: NextFunction): Promise<void> {
        const name = request.body.name
        const email = request.body.email
        const password = request.body.password
        const user = {
            name : name,
            email : email,
            password : password
        }
        const result = await this.registration(user)
        request.user = result.user
        response.locals.registrationResult = result
        next()
    }

    public async authenticate(request: Request, response: Response, next: NextFunction): Promise<void> {
        const token = request.header("Authorization")
        try{
            const payload = token ? await this.verifyJwt(token) : undefined
            const user = payload ? payload : undefined
            request.user = user
        }
        catch(e)
        {
            console.error(e)
            return next(e)
        }
        return next()
    }

    public isAuthenticated(request: Request, response: Response, next: NextFunction): void{
        if(request.user)
        {
            return next()
        }
        response.status(401).json({success : false, message : " Unauthorized!"})
    }

    public async authenticateSocketIo(socket : Socket, next : Function)
    {
        try{
            const token = socket.handshake.headers.authorization
            if(token)
            {
                const payload = await this.verifyJwt(token)
                if(payload)
                {
                    socket.handshake.auth = payload
                    return next()
                }
            }
        }
        catch(e)
        {
            console.error(e)
            next(e)
        }
    }
}