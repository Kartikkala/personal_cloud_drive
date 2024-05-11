// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'


// Import routes 

import { fileTransferRouter } from './routes/fileTransferRoutes.mjs'
import { ariaRouter } from './routes/aria2Routes.mjs'
import { filesystemRouter } from './routes/filesystemRoutes.mjs'
import { authenticationRouter, jwtAuthenticator } from './routes/authenticationRoutes.mjs'
// import {userManagementRouter} from './routes/userManagementRoutes.mjs'

// Import objects from lib directory

// import {authenticate, updateDownloadStatus} from './lib/socketioMiddlewares/socketMiddlewares.mjs'


// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")


// Check if admin user exists in database and create
// admin user if not present


// Object creations and initializations

const app = express()

// App middleware configuration

app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({extended : true}))
// app.use()


// Routes

app.use('/api', authenticationRouter)
app.use("/api", jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated, express.static(frontendApp))
app.use('/api/aria', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,ariaRouter)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated,filesystemRouter)
app.use('/api/fs', jwtAuthenticator.authenticate , jwtAuthenticator.isAuthenticated ,fileTransferRouter)
// app.use('/api/usermanagement', authenticationMiddleware, checkAdmin, userManagementRouter)
app.get('/', (request, response)=>{
    response.redirect('/api/login')
})



const port = process.env.NODE_ENV === 'test'? 8000 : 80
const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })
const io = new Server(server)

// io.use(authenticate)
// io.use(updateDownloadStatus)

export {server, app}