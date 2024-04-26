import express from 'express'
import DatabaseFactory from '../lib/db/database.js'
import AuthenticationFactory from '../lib/authentication/authenticator.js'
import { keys_configs } from '../configs/app_config.js'

const authenticationDatabase = DatabaseFactory.getInstance().getAuthenticationDatabase()
const authenticationFactory = AuthenticationFactory.getInstance(authenticationDatabase, keys_configs)
const jwtAuthenticator = authenticationFactory.getJwtAuthenticator()


const authenticationRouter = express.Router()

authenticationRouter.post('/login', jwtAuthenticator.login)
authenticationRouter.post('/register', jwtAuthenticator.register)

export {authenticationRouter, jwtAuthenticator}
