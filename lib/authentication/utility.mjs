import { userCollection, db } from '../db/db.mjs'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import { user_auth_db_configs } from '../../configs/app_config.js'


const numberOfSaltRounds = 12

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

export { registerUser, getUserDir ,verifyCallback, serialize, deserialize, authenticationMiddleware }