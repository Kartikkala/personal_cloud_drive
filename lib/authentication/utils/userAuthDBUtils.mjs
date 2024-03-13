import { userCollection } from '../../db/models.mjs'
import { Types } from 'mongoose'
import bcrypt from 'bcrypt'
import { user_auth_db_configs } from '../../../configs/app_config.js'
import { generateRandomString, genPasswordHash } from './userAuthUtilFunctions.mjs'
import { passwordSchema, usernameSchema } from './credentialsSchema.mjs'
import disk from 'diskusage'
import os from 'os'

const path = os.platform() === 'win32' ? 'c:' : '/'
const ObjectId = Types.ObjectId

const numberOfSaltRounds = user_auth_db_configs.number_of_salt_rounds

async function registerUser(userObject)
{
    const result = {missingCredentials : false,userAlreadyExists : false, validCredentials: false, creationError : false, message : "Error creating user"}
    let user = undefined
    if(!userObject.first_name || !userObject.last_name|| !userObject.username || !userObject.password)
    {
        result.missingCredentials = true
        return result
    }
    user = await userCollection.findOne({username : userObject.username})
    if(user)
    {
        result.userAlreadyExists = true
        return result
    }
    if(!usernameSchema.validate(userObject.username) && !passwordSchema.validate(userObject.password))
    {
        return result
    }
    result.validCredentials = true
    const pwHash = await genPasswordHash(userObject.password, numberOfSaltRounds)
    const userDir = "user_"+generateRandomString()
    const userDocument = {username : userObject.username, passwordHash : pwHash, userDir : userDir, fname : userObject.first_name, lname : userObject.last_name, totalSpace : 0 ,hasAccess : false, admin : false}
    const operation = await userCollection.create(userDocument)
    if(operation)
    {
        result.message = "User successully created"
        return result
    }
    result.creationError = true
    return result
}

async function checkAndCreateAdmin()
{
    const username = process.env.PERSONAL_DRIVE_ADMIN_USERNAME
    const password = process.env.PERSONAL_DRIVE_ADMIN_PASSWORD
    const firstName = process.env.PERSONAL_DRIVE_ADMIN_FNAME
    const lastName = process.env.PERSONAL_DRIVE_ADMIN_LNAME
    const totalDiskSpace = (await disk.check(path)).total

    if(!username || !password || !firstName || !lastName){
        throw new Error("Error retrieving admin credentials from environment variables. Please set environment variables correctly")
    }
    if(!usernameSchema.validate(username) && !passwordSchema.validate(password))
    {
        console.log("\n\n-----------------Credentials Rules-----------------------")
        console.log("\n\n\n1. Username or password must not contain spaces")
        console.log("2. Username can be greater than or equal to 2 and less than or equal to 20")
        console.log("3. Password can be greater than or equal to 8 and less than or equal to 24. Password should contain atleast one uppercase and lowercase character and should contain at least 2 numbers.\n")
        throw new Error("Invalid admin credentials, please set user credentials according to above rules")
    }
    const user = await userCollection.findOne({username : username})
    if(!user)
    {
        if(totalDiskSpace - user_auth_db_configs.admin_storage_space <=0)
        {
            throw new Error("Not enough storage space left on device for admin user. Admin user creation aborted!")
        }
        const pwHash = await genPasswordHash(password, numberOfSaltRounds)
        const userDir = "user_"+generateRandomString()
        const userDocument = {username : username, passwordHash : pwHash, userDir : userDir, fname : firstName, lname : lastName, totalSpace : user_auth_db_configs.admin_storage_space ,hasAccess : true, admin : true}
        const result = await userCollection.create(userDocument)
        if(result)
        {
            console.log("New admin user created!")
            return true
        }
        else
        {
            console.log("Error creating admin user!")
        }
    }
    console.log("Admin user already present...")
}


async function verifyCallback(req ,username, password, done)
{
    let error = null
    let user = undefined
    try{
        user = await userCollection.findOne({ username : username })
    }
    catch(err)
    {
        error = err
    }
    if(user){
        const validPass = await bcrypt.compare(password, user.passwordHash)
        if(validPass){
            return done(null, user)
        }
    }
    if(error)
    {
        return done(error, false) 
    }
    return done(null, false)
}

async function serialize(user, done){
    done(null, user._id)
}

async function deserialize(userid, done){
    try{
        const user = await userCollection.findOne({_id: new ObjectId(userid)})
        done(null, user)
    }
    catch(e){
        done(e)
    }
}

export {registerUser, verifyCallback, checkAndCreateAdmin ,serialize, deserialize}