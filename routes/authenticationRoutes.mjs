import express from 'express'
import passport from 'passport'
import { registerUser } from '../lib/authentication/utility.mjs'


const authenticationRouter = express.Router()

authenticationRouter.use(express.json())
authenticationRouter.use(express.urlencoded())


// Using an anonymous wrapper function to access request and response objects inside the
// callback for passport.authenticate

authenticationRouter.post('/login', (req, res)=>{
    passport.authenticate('local', (err, user, info)=>{
        if(err)
        {
            console.log("Some error occured in post login route - "+err)
            return res.status(500).json({"message" : "Internal server error"})
        }
        if(!user)
        {
            return res.status(401).json({"message": "Invalid login credentials!"})
        }
        req.logIn(user, (err)=>{
            if(err){
                console.log("Login error -" + err)
                return res.status(500).json({"message" : "Internal server error"})
            }
            return res.redirect('/api')
        })
    })(req, res)
})

authenticationRouter.post('/register', async (request, response)=>{
    const userObject = {
        username : request.body.username,
        password : request.body.password
    }
    const result = await registerUser(userObject)
    if(result){
        response.status(200).json({"message": "Registration successful!!!"})
    }
    else
    {
        response.status(200).json({"message" : "Failed to register user!!!"})
    }
})

export {authenticationRouter, passport}
