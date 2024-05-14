import {IncomingHttpHeaders} from "http"
import { fileManagerMiddleware } from "../../routes/filesystemRoutes.mjs"
import { Readable } from "stream";

interface IVideoStreamResult{
    stream : Readable | undefined,
    size : number | undefined,
    start : number | undefined,
    end : number | undefined
}
function parseRangeHeader(rangeHeader : string | undefined | null) {
    // Check if header is valid and starts with "bytes="
    if (!rangeHeader || !rangeHeader.startsWith("bytes=")) {
      return null;
    }
  
    // Remove unnecessary characters using slice and trim
    const rangeString = rangeHeader.slice(6).trim();
  
    // Split the range on '-' (hyphen)
    const parts = rangeString.split("-");
      try {
        const start = parseInt(parts[0], 10);
        let end = null
        if(parts[1].length > 0)
        {
            end = parseInt(parts[1], 10)
        }
        return { start : start, end: end }
      } 
      catch (error) {
            return null; // Invalid format
      }
}
export async function videoStream(email : string, filepath : string, headers : IncomingHttpHeaders) : Promise<IVideoStreamResult | undefined> {
    const range = headers.range
    const parsedRange = parseRangeHeader(range)
    if(parsedRange)
    {
        const result : IVideoStreamResult = {
            stream : undefined,
            size : undefined,
            start : undefined,
            end : undefined
        }
        let {start, end} = parsedRange
        const CHUNK_SIZE = 10 ** 6
        if(start === null)
        {
            return result
        }
        end = end || start+CHUNK_SIZE
        if(start>end)
        {
            return undefined
        }
        result.start = start
        result.end = end
        const resourceStats = await fileManagerMiddleware.fileManager.getResourceStats(email, filepath)
        if(resourceStats && resourceStats.isFile)
        {
            result.size = resourceStats.size
            result.stream = await fileManagerMiddleware.fileManager.getReadStream(email, filepath, start, end)
        }
        return result
    }
    return undefined
}