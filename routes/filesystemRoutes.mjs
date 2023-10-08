import express from 'express'
import path from 'path'
import { FileManager } from '../lib/fileSystem/fileSystem.mjs'

const targetVolume = path.resolve("../downloadables")
const filesystemRouter = express.Router()
const fileObject = new FileManager({rootPath : targetVolume})

filesystemRouter.use("/ls", fileObject.getResourceStatsInDirectory)

filesystemRouter.post("/ls", (request, response) => {
    const content = response.locals.resourceInfo
    delete content.dirPath
    response.json(content)
})


export {filesystemRouter, fileObject}
