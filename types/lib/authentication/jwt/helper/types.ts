import { JwtPayload } from "jsonwebtoken"

export interface IJwtOptions{
    algorithms? : Array<string>,
}

export interface IJwtPayload extends JwtPayload{
    email : string,
    admin : boolean,
    name : string,
    subscriptionId : string | null
}

