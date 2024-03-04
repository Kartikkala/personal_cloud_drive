import express from 'express'
import path from 'path'
import { FileManager } from '../lib/fileSystem/fileSystem.mjs'
import { app_configs } from '../configs/app_config.js'


const targetVolume = path.resolve(app_configs.rootPath)
const filesystemRouter = express.Router()
const fileObject = new FileManager({rootPath : targetVolume})

filesystemRouter.use("/ls", fileObject.getResourceStatsInDirectory)

filesystemRouter.post("/ls", (request, response) => {
    const content = response.locals.resourceInfo
    delete content.dirPath
    response.json(content)
})


export {filesystemRouter, fileObject}
