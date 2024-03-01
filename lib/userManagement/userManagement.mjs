import { userCollection } from "../db/models.mjs"

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

export {getAllUsers, toggleAccess}