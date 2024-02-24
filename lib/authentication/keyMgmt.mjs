import { generateKeyPairSync } from "crypto"
import { mkdir, writeFileSync, existsSync, mkdirSync } from "fs"
import path from "path"

import { keys_configs } from "../../configs/app_config.js"


function genKeyPair() {
    mkdirSync(keys_configs.keypair_directory, {recursive : true})
    const pubKeyPath = path.join(keys_configs.keypair_directory,keys_configs.publickey_filename )
    const privKeyPath = path.join(keys_configs.keypair_directory,keys_configs.privatekey_filename )
    const result = {
        message : "Generating new key pair!!!",
        path_pub : pubKeyPath,
        path_priv : privKeyPath,
        newCreated : true
    }

    const keyPair = generateKeyPairSync('rsa', {
        modulusLength: 4096, // bits - standard for RSA keys
        publicKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1" 
            format: 'pem' // Most common formatting choice
        },
        privateKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1"
            format: 'pem' // Most common formatting choice
        }
    });

    if(existsSync(pubKeyPath) && existsSync(privKeyPath))
    {
        result.message = "Key pair exists!!! Skipping key generation"
        result.newCreated = false
        console.log(result)
        return result
    }

    // Create the public and private key files

    writeFileSync(pubKeyPath, keyPair.publicKey) 
    writeFileSync(privKeyPath, keyPair.privateKey)

    console.log(result)

    return result
}

export {genKeyPair}
