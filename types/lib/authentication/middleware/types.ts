import { IUserDocument } from "../../db/Authentication/types.js"

export namespace Authenticator{
    export interface IAutheticator{
        genKeyPair(keyPairDirPath? : string, publicKeyFileName? : string, privateKeyFileName? : string) : void,
    }
}
