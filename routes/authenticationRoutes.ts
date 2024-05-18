import express from 'express'
import AuthenticationFactory from '../lib/authentication/authenticator.js'
import AuthorisationMiddlewareFactory from '../lib/authorisation/index.js'

export default function getAuthenticationRouter(authenticationFactory : AuthenticationFactory, authorization : AuthorisationMiddlewareFactory)
{
    const authenticationRouter = express.Router()
    const jwtAuthenticator = authenticationFactory.jwtAuthenticator
    authenticationRouter.post('/otp', authorization.generateAndSendRegistrationOtpMiddleware)
    authenticationRouter.post('/register', authorization.verifyOtpMiddleware ,jwtAuthenticator.register)
    authenticationRouter.post('/login', jwtAuthenticator.login)
    return authenticationRouter
}

