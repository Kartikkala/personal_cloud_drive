import JwtAuthenticator from "./jwt/middleware.js"
import { IAuthenticationDatabase } from "../../types/lib/db/Authentication/types.js"
import path from "path"
import {mkdirSync, existsSync, writeFileSync, readFileSync} from "fs"
import {generateKeyPairSync} from "crypto"

export default class AuthenticationFactory{
    private static instance : AuthenticationFactory | null = null
    private jwtAuthInstance
    private static instanceKey = Symbol("UniqueAuthenticationFactoryInstanceKey")

    constructor(database : IAuthenticationDatabase, privateKey : string, publicKey: string, instanceKey : symbol)
    {
        if(instanceKey !== AuthenticationFactory.instanceKey)
        {
            throw new Error("Please use AuthenticationFactory.getInstance method to create an instance")
        }
        this.jwtAuthInstance = new JwtAuthenticator(database, privateKey, publicKey)
    }
    public static getInstance(database? : IAuthenticationDatabase, keysConfigs? : any)
    {
        if(!this.instance)
        {
            if(!database || !keysConfigs)
            {
                throw new Error("No instance of AuthenticationFactory exists. Please pass database and keys configs")
            }
            const keys = this.genKeyPair(keysConfigs)
            const publicKey = readFileSync(keys.path_pub).toString()
            const privateKey = readFileSync(keys.path_priv).toString()
            this.instance = new AuthenticationFactory(database, privateKey, publicKey, this.instanceKey)
        }
        return this.instance
    }
    public get jwtAuthenticator() : JwtAuthenticator
    {
        return this.jwtAuthInstance
    }

    private static genKeyPair(keysConfigs : any) {
        mkdirSync(keysConfigs.keypair_directory, {recursive : true})
        const pubKeyPath = path.join(keysConfigs.keypair_directory,keysConfigs.publickey_filename )
        const privKeyPath = path.join(keysConfigs.keypair_directory,keysConfigs.privatekey_filename )
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
}