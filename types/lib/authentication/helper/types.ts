import { IUserDocument } from "../../db/Authentication/types.js"

export interface IUser{
    email : string,
    name : string,
    password : string
}
export interface IRegistrationResult{
    success            : boolean,
    validCredentials   : boolean,
    user?              : IUserDocument
    message?           : "UserAlreadyExists" | "DatabaseError" | "UserCreationSuccessful"
}
