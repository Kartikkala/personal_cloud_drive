import { FileObjectManager } from "./functionality/fileManager.mjs"
import { FileObjectManagerMiddleware } from "./middlewares.js"


export default class FileManager extends FileObjectManagerMiddleware
{
    constructor(workingDirName, mountPaths, mongoDbUserDiskStatsCollection){
        const userDiskStats = [] // TODO fetch older disk stats using mongo db disk stats object
        const fileManager = new FileObjectManager(workingDirName, mountPaths, userDiskStats)
        super(fileManager, mongoDbUserDiskStatsCollection)
    }
}
