import express from 'express'
import passport from 'passport'
import { issueJwt } from '../lib/authentication/utils/userAuthUtilFunctions.mjs'
import { registerUser } from '../lib/authentication/utils/userAuthDBUtils.mjs'


const authenticationRouter = express.Router()

authenticationRouter.use(express.json())
authenticationRouter.use(express.urlencoded({extended : true}))


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
        req.logIn(user, async (err)=>{
            if(err){
                console.log("Login error -" + err)
                return res.status(500).json({"message" : "Internal server error"})
            }
            const signedJwt = await issueJwt(user)
            res.cookie("jwt", signedJwt, {httpOnly : true, expires : new Date(Date.now() + 24 * 60 * 60 * 1000)})
            return res.redirect('/api')
        })
    })(req, res)
})

authenticationRouter.post('/register', async (request, response)=>{
    const userObject = {
        first_name : request.body.fname,
        last_name : request.body.lname,
        username : request.body.username,
        password : request.body.password
    }
    const result = await registerUser(userObject)
    response.json(result)
})

export {authenticationRouter, passport}
