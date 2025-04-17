import express from 'express'
import AuthenticationFactory from '../lib/authentication/authenticator.js'
import AuthorisationMiddlewareFactory from '../lib/authorisation/index.js'
import { FileObjectManagerMiddleware } from '../lib/fileSystem/middlewares.js'
import { IRegistrationResult } from '../types/lib/authentication/helper/types.js'

export default function getAuthenticationRouter(authenticationFactory : AuthenticationFactory, authorization : AuthorisationMiddlewareFactory, fileObjectManager : FileObjectManagerMiddleware)
{
    const authenticationRouter = express.Router()
    const jwtAuthenticator = authenticationFactory.jwtAuthenticator
    authenticationRouter.post('/otp', authorization.generateAndSendRegistrationOtpMiddleware)
    authenticationRouter.post('/login', jwtAuthenticator.login)
    authenticationRouter.post('/register', authorization.verifyOtpMiddleware ,jwtAuthenticator.register, fileObjectManager.addNewUserMiddleware, (request, response)=>{
        const registrationResult : IRegistrationResult = response.locals.registrationResult
        // Maybe make use of this
        const userDriveDetails = response.locals.userDriveDetails

        registrationResult.user = undefined
        switch (registrationResult.message){
            case 'UserCreationSuccessful':
                return response.status(200).send(registrationResult)
            case 'UserAlreadyExists':
                return response.status(400).send(registrationResult)
            default:
                return ~response.status(500).send(registrationResult)
        }
    })
    return authenticationRouter
}

