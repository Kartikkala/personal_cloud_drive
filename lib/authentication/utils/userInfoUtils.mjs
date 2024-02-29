import { inactiveDownloadsCollection ,userCollection } from '../../db/db.mjs'
import { ObjectId } from 'mongodb'

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
    let inactiveDownload = undefined
    if(!user)
    {
        inactiveDownload = await inactiveDownloadsCollection.insertOne({user_id : new ObjectId(userId)},  {$push: {downloads: newDownload }})
    }
    else{
        inactiveDownload = await inactiveDownloadsCollection.updateOne({user_id : new ObjectId(userId)},  {$push: {downloads: newDownload }})
    }
    if(inactiveDownload.acknowledged ===  true)
    {
        return true
    }
    throw new Error("Update error in newInactiveDownload")
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