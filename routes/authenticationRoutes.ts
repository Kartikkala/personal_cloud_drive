import express from 'express'
import AuthenticationFactory from '../lib/authentication/authenticator.js'

export default function getAuthenticationRouter(authenticationFactory : AuthenticationFactory)
{
    const authenticationRouter = express.Router()
    const jwtAuthenticator = authenticationFactory.jwtAuthenticator
    authenticationRouter.post('/login', jwtAuthenticator.login)
    authenticationRouter.post('/register', jwtAuthenticator.register)
    return authenticationRouter
}

