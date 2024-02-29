import { userCollection } from '../../db/models.mjs'
import { Types } from 'mongoose'
import bcrypt from 'bcrypt'
import { user_auth_db_configs } from '../../../configs/app_config.js'
import { generateRandomString, genPasswordHash } from './userAuthUtilFunctions.mjs'

const ObjectId = Types.ObjectId

const numberOfSaltRounds = user_auth_db_configs.number_of_salt_rounds

async function registerUser(userObject)
{
    const user = await userCollection.findOne({username : userObject.username})
    if(user)
    {
        return false
    }
    const pwHash = await genPasswordHash(userObject.password, numberOfSaltRounds)
    const userDir = "user_"+generateRandomString()
    const userDocument = {username : userObject.username, passwordHash : pwHash, userDir : userDir, fname : userObject.first_name, lname : userObject.last_name, hasAccess : false, admin : false}
    const result = await userCollection.create(userDocument)
    if(result)
    {
        return true
    }
    return false
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

export {registerUser, verifyCallback, serialize, deserialize}