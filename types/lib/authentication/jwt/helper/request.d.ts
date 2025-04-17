import { IJwtPayload } from "./types.ts"

global {
    export namespace Express {
        export interface Request {
            user?: IJwtPayload
        }
    }
}