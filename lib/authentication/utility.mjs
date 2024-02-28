import { inactiveDownloadsCollection ,userCollection, db } from '../db/db.mjs'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { user_auth_db_configs, keys_configs } from '../../configs/app_config.js'
import fs from "fs/promises"
import path from 'path'

const numberOfSaltRounds = 12

async function issueJwt(userObject)
{
    const private_key =  await fs.readFile(path.join(keys_configs.keypair_directory, keys_configs.privatekey_filename))
    const payload = {
        sub : userObject._id,
        name : userObject.user
    }
    const signedJwt = jwt.sign(payload, private_key, {algorithm : "RS256", expiresIn : "10h"})
    return signedJwt
}
async function verifyJwt(token)
{
    const public_key =  await fs.readFile(path.join(keys_configs.keypair_directory, keys_configs.publickey_filename))
    const payload = jwt.verify(token, public_key)
    return payload
}

function generateRandomString(length = 16) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function authenticationMiddleware(request, response, next){
    if(request.isAuthenticated()){
        next()
    }
    else{
        response.status(401).json({"error" : true, "reason" : "Authentication failed!!!"})
    }
}

async function getUserDir(userId)
{
    const user = await userCollection.findOne({_id : userId})
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

async function registerUser(userObject)
{
    const user = await userCollection.findOne({user : userObject.username})
    if(user)
    {
        return false
    }
    const pwHash = await genPasswordHash(userObject.password, numberOfSaltRounds)
    const userDir = "user_"+generateRandomString()
    const userDocument = {user : userObject.username, passwordHash : pwHash, userDir : userDir}
    const result = await userCollection.insertOne(userDocument)
    if(result)
    {
        return true
    }
    return false
}
async function genPasswordHash(password, saltRounds)
{
    const passHash = await bcrypt.hash(password, saltRounds)
    return passHash
}

async function verifyCallback(req ,username, password, done)
{
    let error = null
    let user = undefined
    try{
        user = await userCollection.findOne({ user : username })
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
        const user = await db.collection(user_auth_db_configs.user_auth_db_collection_name).findOne({_id: new ObjectId(userid)})
        done(null, user)
    }
    catch(e){
        done(e)
    }
}

export { registerUser, getUserDir, newInactiveDownload, getInactiveDownloads, removeInactiveDownload ,verifyCallback, serialize, deserialize, authenticationMiddleware, issueJwt, verifyJwt }