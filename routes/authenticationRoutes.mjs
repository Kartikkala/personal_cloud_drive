import express from 'express'
import passport from 'passport'
import { registerUser } from '../lib/authentication/utility.mjs'


const authenticationRouter = express.Router()

authenticationRouter.use(express.json())
authenticationRouter.use(express.urlencoded())

authenticationRouter.get("/failed", (req, res)=>{
    res.send("<h1>Failed to login</h1>")
})

authenticationRouter.post('/login',  passport.authenticate('local', {successRedirect : '/api', failureRedirect: '/api/failed', session: true}))
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

export {authenticationRouter, passport}
