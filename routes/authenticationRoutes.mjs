import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { localStratergy, mongoStore } from '../lib/authentication/authentication.mjs'
import { serialize, deserialize, registerUser } from '../lib/authentication/utility.mjs'
import {session_configs} from "../configs/app_config.js"

const authenticationRouter = express.Router()

authenticationRouter.use(session({store : mongoStore, secret : session_configs.session_store_secret, saveUninitialized: false, resave : false, cookie : {secure : session_configs.cookie_configs.secure, maxAge : session_configs.cookie_configs.expire_time_ms}}))
authenticationRouter.use(express.json())
authenticationRouter.use(express.urlencoded())
authenticationRouter.use(passport.initialize())
authenticationRouter.use(passport.session())

passport.use('local', localStratergy)
passport.serializeUser(serialize)
passport.deserializeUser(deserialize)

authenticationRouter.get("/failed", (req, res)=>{
    res.send("<h1>Failed to login</h1>")
})

authenticationRouter.post('/login',  passport.authenticate('local', {successRedirect : '/', failureRedirect: '/api/failed', session: true}))
authenticationRouter.post('/register', async (request, response)=>{
    const userObject = {
        username : request.body.username,
        password : request.body.password
    }
    const result = await registerUser(userObject)
    if(result){
        response.send("Registration successful!!!")
    }
    else
    {
        response.send("Failed to register user!!!")
    }
})

export {authenticationRouter}
