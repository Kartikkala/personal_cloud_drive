import { Readable } from "stream"

export interface IVideoStreamResult{
    stream : Readable | undefined,
    size : number | undefined,
    start : number | undefined,
    end : number | undefined
}