import { Request, Response, NextFunction } from "express"
export interface IJwtAuthenticator
{
    login(request : Request, response : Response, next : NextFunction) : void,
    register(request : Request, response : Response, next : NextFunction) : void,
    authenticate(request : Request, response : Response, next : NextFunction) : void
}