export interface IUser{
    email : string,
    name : string,
    password : string
}
export interface IRegistrationResult{
    success            : boolean,
    validCredentials   : boolean,
    message?           : "UserAlreadyExists" | "DatabaseError" | "UserCreationSuccessful"
}
