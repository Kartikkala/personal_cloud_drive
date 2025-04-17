import { userCollection } from "../db/models.mjs"
import disk from "diskusage"

const diskRootPath = '/'

async function totalDiskSpace()
{
    const totalDiskSpace = (await disk.check(diskRootPath)).total
    return totalDiskSpace
}

async function totalUsedSpace()
{
    let result = null
    try{
        result = await userCollection.aggregate([{ $group : {_id : null, totalUsedStorage : {$sum : "$totalSpace"}}}])
    }
    catch(exception)
    {
        console.error(exception)
    }
    return result[0].totalUsedStorage
}

async function getTotalSpaceForUser(username)
{
    const result = {success : false, userPresent : false, totalSpace : 0}
    try{
        const queryResult = await userCollection.findOne({username : username}, {_id : false, totalSpace : true})

        // If response is not undefined and user is present

        if(queryResult)
        {
            result.success = true
            result.userPresent = true
            result.totalSpace = queryResult.totalSpace
        }
    }
    catch(exception)
    {
        console.log(exception)
    }
    return result
}

async function changeTotalUserSpace(username, storageSpaceInBytes)
{
    let result = {acknowledged : false, matchedCount : 0}
    try{
        result = await userCollection.updateOne({username : username}, {totalSpace: storageSpaceInBytes})
    }
    catch(exception)
    {
        console.error("Database connection issue occured!")
        console.log(exception)
    }
    if(result.acknowledged && result.matchedCount)
    {
        return true
    }
    return false
}

async function getAllUsers(skippedUsernames, page = 1)
{
    const skip = (page-1)*20
    if(!Array.isArray(skippedUsernames))
    {
        skippedUsernames = [skippedUsernames]
    }
    if (!skippedUsernames || skippedUsernames.length === 0) {
        skippedUsernames = []
    }
    try{
        return await userCollection.find({username : {$nin : skippedUsernames} }, {username : true, fname : true, lname : true, hasAccess : true, _id : false}, {limit: 20,skip : skip, sort : {username : 1}})
    }
    catch(exception)
    {
        console.error("Database connection issue occured!")
    }
}

async function toggleAccess(usernames)
{
    let result = {acknowledged : false, matchedCount : 0}
    if(!Array.isArray(usernames))
    {
        usernames = [usernames]
    }
    if (!usernames || usernames.length === 0) {
        usernames = []
    }
    try{
        result = await userCollection.updateMany({username : {$in : usernames}}, [{$set :{hasAccess : { $switch : { branches : [ {case : {$eq : ["$hasAccess", true]}, then : false}, {case : {$eq : ["$hasAccess", false]}, then : true} ]}}}}])
    }
    catch(exception)
    {
        console.error("Database connection issue occured!")
        console.log(exception)
    }
    if(result.acknowledged && result.matchedCount)
    {
        return true
    }
    return false
}

async function createAdmin()
    {
        const email = process.env.PERSONAL_DRIVE_ADMIN_EMAIL
        const password = process.env.PERSONAL_DRIVE_ADMIN_PASSWORD
        const name = process.env.PERSONAL_DRIVE_ADMIN_NAME
        const totalDiskSpace = (await disk.check(rootDiskPath)).total

        if(!email || !password || !name){
            throw new Error("Error retrieving admin credentials from environment variables. Please set environment variables correctly")
        }
        if(!this.emailSchema.validate(username) && !this.passwordSchema.validate(password))
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


export {getAllUsers, toggleAccess, totalDiskSpace, totalUsedSpace ,changeTotalUserSpace, getTotalSpaceForUser}