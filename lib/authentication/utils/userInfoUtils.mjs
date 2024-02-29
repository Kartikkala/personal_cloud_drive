import { inactiveDownloadsCollection ,userCollection } from '../../db/models.mjs'
import { Types } from 'mongoose'

const ObjectId = Types.ObjectId

async function getUserDir(userId)
{
    const user = await userCollection.findOne({_id : new ObjectId(userId)})
    if(!user)
    {
        return false
    }
    return user.userDir
}

async function getInactiveDownloads(userId)
{
    const user = await inactiveDownloadsCollection.findOne({user_id : new ObjectId(userId)})
    if(!user)
    {
        return false
    }
    return user.downloads
}

async function newInactiveDownload(userId, newDownload)
{
    const user = await inactiveDownloadsCollection.findOne({user_id : new ObjectId(userId)})
    let update = false
    let inactiveDownload = {user_id : new ObjectId(userId), $push : {downloads : newDownload}}
    if(!user)
    {
        inactiveDownload = await inactiveDownloadsCollection.create({user_id : new ObjectId(userId), downloads : [newDownload]})
    }
    else{
        inactiveDownload = await inactiveDownloadsCollection.updateOne(inactiveDownload)
        update = true
    }
    if(update){
        if(inactiveDownload.acknowledged ===  true)
        {
            return true
        }
        else
        {
            throw new Error("Update error in newInactiveDownload")
        }
    }
    if(!inactiveDownload)
    {
        throw new Error("Update error in newInactiveDownload")
    }
}

async function removeInactiveDownload(userId, downloadsToRemove)
{
    const user = await inactiveDownloadsCollection.updateOne({user_id : new ObjectId(userId)}, { $pull: { downloads: { $in: downloadsToRemove } }})
    if(user.matchedCount > 0 && user.modifiedCount > 0 && user.acknowledged ===  true)
    {
        return true
    }
    throw new Error("Update error in removeInactiveDownloads")
}

export {getUserDir, getInactiveDownloads, newInactiveDownload, removeInactiveDownload}