// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'


// Import routes 

import getFileTransferRouter from './routes/fileTransferRoutes.js'
import getAria2Router from './routes/aria2Routes.js'
import getFileSystemRouter from './routes/filesystemRoutes.js'
import getAuthenticationRouter from './routes/authenticationRoutes.js'

// Import objects from lib directory

import { updateDownloadStatus } from './lib/socketioMiddlewares/socketMiddlewares.js'
import AuthenticationFactory from './lib/authentication/authenticator.js'
import DatabaseFactory from './lib/db/database.js'
import { FileObjectManagerMiddleware } from './lib/fileSystem/middlewares.js'
import { FileTransferFactory } from './lib/fileTransfer/transfer.js'

// Import configs

import { app_configs, keys_configs, db_configs, aria2_configs } from './configs/app_config.js'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")

// Environment variables

const dbConnectionString = process.env.MONGO_CONNECTION_STRING



// Object creations and initializations

const app = express()

// Lib object creations

const database =  DatabaseFactory.getInstance(dbConnectionString, db_configs)
const authFactory = AuthenticationFactory.getInstance(database.getAuthenticationDatabase(), keys_configs)
const fileObjectManagerMiddleware = await FileObjectManagerMiddleware.getInstance(app_configs.mountPaths, database.getUserDiskStatsDatabase())
const fileTransferFactory = await FileTransferFactory.getInstance(database.getInactiveDownloadsDatabase(), fileObjectManagerMiddleware.fileManager, aria2_configs)
const jwtAuthenticator = authFactory.jwtAuthenticator

// Router creations

const authenticationRouter = getAuthenticationRouter(authFactory)
const filesystemRouter = getFileSystemRouter(fileObjectManagerMiddleware)
const fileTransferRouter = getFileTransferRouter(fileTransferFactory, fileObjectManagerMiddleware.fileManager, 8e+7)
const aria2Router = getAria2Router(fileTransferFactory.server)

// App middleware configuration

app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({extended : true}))


// Routes

app.use('/api', authenticationRouter)
app.use("/api", jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated, express.static(frontendApp))
app.use('/api/aria', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,aria2Router)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated,filesystemRouter)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,fileTransferRouter)
// app.use('/api/usermanagement', authenticationMiddleware, checkAdmin, userManagementRouter)
app.get('/', (request, response)=>{
    response.redirect('/api/login')
})



const port = process.env.NODE_ENV === 'test'? 8000 : 80
const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })
const io = new Server(server)

io.use(jwtAuthenticator.authenticateSocketIo)
io.use(updateDownloadStatus(fileTransferFactory))

export {server, app}