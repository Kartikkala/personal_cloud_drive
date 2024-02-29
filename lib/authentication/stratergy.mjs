import { Strategy } from "passport-local"
import { verifyCallback } from "./utils/userAuthDBUtils.mjs"


const localStratergy = new Strategy({passReqToCallback : true}, verifyCallback)

export { localStratergy}

/*
TODO
1. Create a way by which only admin can access register route
 */
