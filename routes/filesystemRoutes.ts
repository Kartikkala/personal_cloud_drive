import express from 'express'
import { FileObjectManagerMiddleware } from '../lib/fileSystem/middlewares.js'

export default function getFileSystemRouter(fileManagerMiddleware: FileObjectManagerMiddleware) {
    const filesystemRouter = express.Router()
    filesystemRouter.use("/ls", fileManagerMiddleware.getResourceStatsInDirectoryMiddleware)
    filesystemRouter.use("/copy", fileManagerMiddleware.copyMiddleware)
    filesystemRouter.use("/delete", fileManagerMiddleware.deleteMiddleware)
    filesystemRouter.use("/move", fileManagerMiddleware.moveMiddleware)

    filesystemRouter.post("/ls", (request, response) => {
        const content = response.locals.result
        if (!content) {
            return response.status(401).send("Unauthorized!")
        }
        delete content.dirPath
        response.json(content)
    })

    filesystemRouter.post("/copy", (request, response) => {
        const result = response.locals.result
        if (!result) {
            return response.status(401).send("Unauthorized!")
        }
        return response.json(result)
    })

    filesystemRouter.post("/delete", (request, response) => {
        const result = response.locals.result
        if (!result) {
            return response.status(401).send("Unauthorized!")
        }
        return response.json(result)
    })

    filesystemRouter.post("/move", (request, response) => {
        const result = response.locals.result
        if (!result) {
            return response.status(401).send("Unauthorized!")
        }
        return response.json(result)
    })
    return filesystemRouter
}

