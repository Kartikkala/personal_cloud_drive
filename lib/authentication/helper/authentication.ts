import { IRegistrationResult, IUser } from "../../../types/lib/authentication/helper/types.js"
import { IAuthenticationDatabase, IUserVerificationResult } from "../../../types/lib/db/Authentication/types.js"
import PasswordValidator from "password-validator"


export class Authentication{
    protected database : IAuthenticationDatabase
    private passwordSchema = new PasswordValidator()
    private emailSchema = new PasswordValidator()
    constructor(database : IAuthenticationDatabase)
    {
        if(!database)
        {
            throw new Error("Database not passed in Authnetication class")
        }
        this.database = database

        // TODO : Add options to change these validation options
        this.passwordSchema
        .is().min(8)
        .is().max(24)
        .has().uppercase()
        .has().lowercase()
        .has().digits(2)
        .has().not().spaces()

        this.emailSchema
        .is().min(2)
        .is().max(50)
        .has().not().spaces()
        this.logIn = this.logIn.bind(this)
        this.registration = this.registration.bind(this)
    }

    protected async registration(user : IUser) : Promise<IRegistrationResult>
    {
        const result : IRegistrationResult = {
            success                 : false,
            validCredentials        : false, 
            user                    : undefined
        }

        if(!user.name || !user.email || !user.password)
        {
            return result
        }
        if(!this.emailSchema.validate(user.email) && !this.passwordSchema.validate(user.password))
        {
            return result
        }

        result.validCredentials = true
        const registrationResult = await this.database.addUser(user, false)
        result.success = registrationResult.success
        result.message = registrationResult.message
        result.user = registrationResult.user
        return result
    }

    protected async logIn(email : string, password : string) : Promise <IUserVerificationResult>
    {
        const user : IUserVerificationResult = await this.database.verifyUser(email, password)
        return user
    }
}