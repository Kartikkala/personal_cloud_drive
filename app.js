// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import {config} from 'dotenv'
import cors from 'cors'


// Import routes 

import getFileTransferRouter from './routes/fileTransferRoutes.js'
import getAria2Router from './routes/aria2Routes.js'
import getFileSystemRouter from './routes/filesystemRoutes.js'
import getAuthenticationRouter from './routes/authenticationRoutes.js'
// import {userManagementRouter} from './routes/userManagementRoutes.js'

// Import objects from lib directory

import { updateDownloadStatus } from './lib/socketioMiddlewares/socketMiddlewares.js'
import AuthenticationFactory from './lib/authentication/authenticator.js'
import DatabaseFactory from './lib/db/database.js'
import { FileObjectManagerMiddleware } from './lib/fileSystem/middlewares.js'
import { FileTransferFactory } from './lib/fileTransfer/transfer.js'
import Mp4Box from './lib/hls/mp4boxHelper.js'

// Import configs

import { app_configs, keys_configs, db_configs, aria2_configs } from './configs/app_config.js'
import AuthorisationMiddlewareFactory from './lib/authorisation/index.js'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")

// Environment variables and configuration
config({path : './.env'})
const dbConnectionString = process.env.MONGO_CONNECTION_STRING
const senderEmail = process.env.USER_EMAIL_ADDRESS
const senderEmailPassword = process.env.USER_EMAIL_PASSWORD
const emailServiceName = app_configs.emailServiceName
const emailServicHostAddress = app_configs.emailServiceHostAddress
const emailServicePortNumber = app_configs.emailServicePort
const secure = app_configs.emailServiceSSLEnable


// Object creations and initializations

const app = express()

// Lib object creations

const database =  DatabaseFactory.getInstance(dbConnectionString, db_configs)
const authenticationFactory = AuthenticationFactory.getInstance(database.getAuthenticationDatabase(), keys_configs)
const authorizationFactory = AuthorisationMiddlewareFactory.getInstance(emailServiceName, emailServicHostAddress, emailServicePortNumber, secure, senderEmail, senderEmailPassword)
const fileObjectManagerMiddleware = await FileObjectManagerMiddleware.getInstance(app_configs.mountPaths, database.getUserDiskStatsDatabase())
const fileTransferFactory = await FileTransferFactory.getInstance(database.getInactiveDownloadsDatabase(), fileObjectManagerMiddleware.fileManager, aria2_configs, new Mp4Box(4))
const jwtAuthenticator = authenticationFactory.jwtAuthenticator

// Router creations

const authenticationRouter = getAuthenticationRouter(authenticationFactory, authorizationFactory, fileObjectManagerMiddleware)
const filesystemRouter = getFileSystemRouter(fileObjectManagerMiddleware)
const fileTransferRouter = getFileTransferRouter(fileTransferFactory, fileObjectManagerMiddleware.fileManager, new Mp4Box(4),8e+7)
const aria2Router = getAria2Router(fileTransferFactory.server)

// App middleware configuration

app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())


// Routes

app.use('/api', authenticationRouter)
app.use("/api", jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated, express.static(frontendApp))
app.use('/api/aria', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,aria2Router)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated,filesystemRouter)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,fileTransferRouter)
// app.use('/api/usermanagement', jwtAuthenticator.authenticate, jwtAuthenticator.isAuthenticated, userManagementRouter)
app.get('/', (request, response)=>{
    response.redirect('/api/login')
})



const port = process.env.NODE_ENV === 'test'? 8000 : 5000
const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })
const io = new Server(server, {
    cors: {
        origin: "*", // Allow frontend origin
        methods: ["GET", "POST"], // Allowed methods
        credentials: true, // Allow cookies and authentication headers
      },
})

io.use(jwtAuthenticator.authenticateSocketIo)
io.use(updateDownloadStatus(fileTransferFactory))

export {server, app}