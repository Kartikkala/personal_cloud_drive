import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { keys_configs } from '../../../configs/app_config.js'
import fs from "fs/promises"
import path from 'path'



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

export {generateRandomString, authenticationMiddleware, genPasswordHash, issueJwt, verifyJwt}