import userCollection from "./models.js"
import bcrypt from "bcrypt"

// Types import 

import { IUser } from "../../../types/lib/authentication/helper/types.js"
import { IUserDocument } from "../../../types/lib/db/Authentication/types.js"
import { IAuthenticationDatabase, INewUserResult, IUserVerificationResult } from "../../../types/lib/db/Authentication/types.js"
import { IDatabase } from "../../../types/lib/db/UserMangement/types.js"

export default class AuthenticationDatabase implements IAuthenticationDatabase{
    private userCollection 
    private database : IDatabase
    private saltRounds
    constructor(database : IDatabase, userCollectionName : string, saltRounds? : number)
    {
        if(!database)
        {
            throw new Error("Mongoose database object missing")
        }
        this.database = database
        this.saltRounds = saltRounds || 12
        this.userCollection = userCollection(database, userCollectionName)
        this.addUser = this.addUser.bind(this)
        this.verifyUser = this.verifyUser.bind(this)
    }

    public async addUser(user: IUser, admin? : boolean): Promise<INewUserResult>{
        const result : INewUserResult = {success : false, message : "DatabaseError"}
        const connectionStatus = await this.database.connectToDatabase()
        if(connectionStatus){
            try{
                if(!admin)
                {
                    admin = false
                }
                const passHash = await bcrypt.hash(user.password, this.saltRounds)
                const newUser : IUserDocument = {
                    email : user.email,
                    name :  user.name,
                    subscriptionId : null,
                    passwordHash : passHash,
                    admin : admin
                }
                result.user = await this.userCollection.create(newUser)
                result.success = true
                result.message = "UserCreationSuccessful"
            }
            catch(e : any){   
                result.message  = "UserAlreadyExists"
                console.error(e)
            }
        }
        return result
    }

    public async verifyUser(email: string, password: string): Promise<IUserVerificationResult>{
        let result : IUserVerificationResult = {success : false, error : false, userDocument : undefined}
        if(await this.database.connectToDatabase())
        {   
            try{
                const userDocument : any = await this.userCollection.findOne({email : email})
                const validPassword = userDocument.passwordHash ? await bcrypt.compare(password, userDocument.passwordHash) : false
                if(userDocument && validPassword)
                {
                   result.userDocument = {
                    _id : userDocument._id,
                    email : userDocument.email,
                    admin : userDocument.admin,
                    name : userDocument.name,
                    subscriptionId : userDocument.subscriptionId
                   }
                   result.success = true
                }
            }
            catch(e)
            {
                result.error = true
                console.error(e)
            }
        }
        return result
    }
    
}