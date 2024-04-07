import express, { response } from 'express'
import path from 'path'
import { FileManager } from '../lib/fileSystem/fileSystem.mjs'
import { app_configs } from '../configs/app_config.js'


const targetVolume = path.resolve(app_configs.rootPath)
const filesystemRouter = express.Router()
const fileObject = new FileManager({rootPath : targetVolume})

filesystemRouter.use("/ls", fileObject.getResourceStatsInDirectory)
filesystemRouter.use("/copy", fileObject.copyMiddleware)
filesystemRouter.use("/delete", fileObject.deleteMiddleware)
filesystemRouter.use("/move", fileObject.moveMiddleware)

filesystemRouter.post("/ls", (request, response) => {
    const content = response.locals.resourceInfo
    delete content.dirPath
    response.json(content)
})

filesystemRouter.post("/copy", (request, response)=>{
    const result = response.locals.result
    response.json(result)
})

filesystemRouter.post("/delete", (request, response)=>{
    const result = response.locals.result
    response.json(result)
})

filesystemRouter.post("/move", (request, response)=>{
    const result = response.locals.result
    response.json(result)
})


export {filesystemRouter, fileObject}
