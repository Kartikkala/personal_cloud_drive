import { Strategy } from "passport-local"
import { verifyCallback } from "./utility.mjs"
import MongoStore from "connect-mongo"
import { mongodb } from "../db/db.mjs"
import {session_configs} from "../../configs/app_config.js"


const localStratergy = new Strategy({passReqToCallback : true}, verifyCallback)
const mongoStore = MongoStore.create({client: mongodb, dbName : session_configs.sessionDBname , collectionName: session_configs.session_collection_name})

export {mongoStore, localStratergy}

/*
TODO
1. Create a way by which only admin can access register route
 */
