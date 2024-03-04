import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { keys_configs, app_configs } from '../../../configs/app_config.js'
import fileSystem from "fs"
import fs from "fs/promises"
import path from 'path'
import fastFolderSize from 'fast-folder-size'
import utils from "node:util"

const fastFolderSizePromisified = utils.promisify(fastFolderSize)


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

function checkAdmin(request, response, next)
{
    if(request.user.admin)
    {
        next()
    }
    else
    {
        response.status(401).json({"error": true, "reason" : "This is an admin route and requires admin previliges."})
    }
}

function checkAccess(request, response, next)
{
    if(request.user.hasAccess)
    {
        next()
    }
    else{
        response.status(401).json({"error": true, "reason" : "You don't have access to this route. Please contact the admin of this app."})
    }
}
  
  
async function genPasswordHash(password, saltRounds)
{
    const passHash = await bcrypt.hash(password, saltRounds)
    return passHash
}

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


async function availabeUserDirSpace(userObject)
{
    let availableSpace = 0
    const userDir = path.join(app_configs.rootPath, userObject.userDir)
    if(!fileSystem.existsSync(userDir))
    {
        await fs.mkdir(userDir)
    }
    if(userObject.totalSpace !=0)
    {
        availableSpace = await fastFolderSizePromisified(userDir)
        availableSpace = userObject.totalSpace - availableSpace
    }
    return availableSpace
}

async function postLoginJobs(request, response, next)
{
    const user = request.user
    if(request.isAuthenticated() && request.user.hasAccess)
    {
        request.user.availableSpace = await availabeUserDirSpace(user)
        const signedJwt = await issueJwt(user)
        response.cookie("jwt", signedJwt, {httpOnly : true, expires : new Date(Date.now() + 24 * 60 * 60 * 1000)})
    }
    next()
}



export {generateRandomString, authenticationMiddleware, checkAdmin, checkAccess, genPasswordHash, issueJwt, verifyJwt, availabeUserDirSpace, postLoginJobs}