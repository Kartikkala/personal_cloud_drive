import { NFileObjectManager } from "../../types/lib/fileSystem/types.js"
import { ClientFileTransfer } from "./clientTransfer/clientTransfer.js"
import { aria2c } from "./serverTransfer/serverDownload.js"
import { aria2_configs } from "../../configs/app_config.js"
import { InactiveDowloadsDb } from "../../types/lib/db/Downloads/types.js"
import { IAria2Helper } from "../../types/lib/fileTransfer/serverFileTransfer/types.js"


export class FileTransferFactory{
    private static instance : undefined | FileTransferFactory
    private static instanceKey : Symbol = Symbol("UniqueFileTransferFactoryKey")
    public server
    public client
    constructor(instanceKey : Symbol, aria2c : IAria2Helper ,fileManager : NFileObjectManager.IFileObjectManager)
    {
        if(instanceKey !== FileTransferFactory.instanceKey)
        {
            throw new Error("Please use FileTransferFactory.getInstance() to create an instance of this class")
        }
        const aria2Options = {
            host : aria2_configs.host, 
            path : aria2_configs.path, 
            port : aria2_configs.port,
            secret : aria2_configs.secret,
            secure : aria2_configs.secure
        }
        this.client = new ClientFileTransfer(fileManager)
        this.server = aria2c
    }

    public static async getInstance(database : InactiveDowloadsDb, fileManager : NFileObjectManager.IFileObjectManager)
    {
        const aria2 = await aria2c(database, fileManager, 3000)
        if(!this.instance)
        {
            this.instance = new FileTransferFactory(this.instanceKey, aria2 , fileManager)
        }
        return this.instance
    }
}