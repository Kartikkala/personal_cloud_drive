import express from 'express'
import VideoStreaming from '../lib/http-streaming/streaming.js'
import { NFileObjectManager } from '../types/lib/fileSystem/types.js'

export default function getVideoStreamingRouter(fileManager : NFileObjectManager.IFileObjectManager)
{
    const router = express.Router()
    const streamer = new VideoStreaming(fileManager)
    router.get("/stream", async (request, response) => {
        const user = request.user
        if (user) {
            const filepath = request.query.filepath
            if(!filepath || typeof filepath !== 'string')
            {
                response.status(405).json("Malformed")
                return
            }
            const streamObject = await streamer.stream(user.email, filepath, request.headers)
            if (streamObject) {
                if (streamObject.start !== undefined && streamObject.end !== undefined) {
                    if (streamObject.size && streamObject.stream) {
                        const start = streamObject.start
                        const end = Math.min(streamObject.end, streamObject.size - 1)
                        const headers = {
                            "Content-Range": `bytes ${start}-${end}/${streamObject.size}`,
                            "Accept-Ranges": "bytes",
                            "Content-Length": end - start + 1,
                            "Content-Type": "video/mp4",
                        }
                        response.writeHead(206, headers)
                        streamObject.stream.pipe(response)
                    }
                    else {
                        return response.status(404).send("The requested resource was not found")
                    }
                }
                else {
                    return response.status(400).send("Incorrect range headers syntax")
                }
            }
            else {
                return response.status(400).send("Range headers not present")
            }
        }
        else {
            return response.status(401).send("Unauthorized")
        }
    })
    return router
}