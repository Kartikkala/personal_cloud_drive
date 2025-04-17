import { Types } from 'mongoose'
import { IUser } from '../../authentication/helper/types.js'

export interface IUserDocument{
    _id? : Types.ObjectId,
    name : string,
    email : string, 
    passwordHash : string,
    admin : boolean,
    subscriptionId : string | null
}

export interface IUserDocumentReduced{
    _id? : Types.ObjectId,
    name  : string,
    email : string,
    admin : boolean,
    subscriptionId : string | null
}

export interface IAuthenticationDatabase{
    addUser(userObject : IUser, admin? : boolean) : Promise <INewUserResult>,
    verifyUser(email : string, password : string) : Promise<IUserVerificationResult>,
}

export interface INewUserResult{
    success : boolean
    message : "UserAlreadyExists" | "DatabaseError" | "UserCreationSuccessful",
    user? : IUserDocument
}

export interface IUserVerificationResult{
    success : boolean,
    error : boolean,
    userDocument? : IUserDocumentReduced,
}
