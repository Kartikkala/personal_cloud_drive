import { userCollection } from "../db/models.mjs"
import disk from "diskusage"
import os from 'os'

const diskRootPath = os.platform() === 'win32' ? 'c:' : '/'

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

export {getAllUsers, toggleAccess, totalDiskSpace, totalUsedSpace ,changeTotalUserSpace, getTotalSpaceForUser}