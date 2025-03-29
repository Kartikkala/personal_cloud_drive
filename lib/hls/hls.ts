import {IncomingHttpHeaders} from "http"
import { IVideoStreamResult } from "../../types/lib/http-streaming/types.js";
import { NFileObjectManager } from "../../types/lib/fileSystem/types.js";

export default class HLS
{
    private _fileManager
    constructor(fileManager : NFileObjectManager.IFileObjectManager)
    {
        this._fileManager = fileManager
    }


    public async convertToHls(email : string, targetPath : string)
    {
        if(await this._fileManager.checkPermission(email, targetPath)){
            
        }
    }
}