// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
import session from 'express-session'
import { Server } from 'socket.io'


// Import routes 

import { fileTransferRouter } from './routes/fileTransferRoutes.mjs'
import { ariaRouter } from './routes/aria2Routes.mjs'
import { filesystemRouter } from './routes/filesystemRoutes.mjs'
import { authenticationRouter } from './routes/authenticationRoutes.mjs'

// Import objects from lib directory

import { localStratergy } from './lib/authentication/stratergy.mjs'
import { mongoStore } from './lib/db/db.mjs'
import {session_configs} from "./configs/app_config.js"
import { authenticationMiddleware } from './lib/authentication/utils/userAuthUtilFunctions.mjs'
import { serialize, deserialize } from './lib/authentication/utils/userAuthDBUtils.mjs'
import { genKeyPair } from './lib/authentication/keyMgmt.mjs'
import {authenticate, updateDownloadStatus} from './lib/socketioMiddlewares/socketMiddlewares.mjs'

// Import passport object from authenticationRoutes.mjs

import { passport } from './routes/authenticationRoutes.mjs'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")
const keyPair = genKeyPair()


// Object creations and initializations

const app = express()

// App middleware configuration

app.disable('x-powered-by')
app.use(session({store : mongoStore, secret : session_configs.session_store_secret, saveUninitialized: false, resave : false, cookie : {secure : session_configs.cookie_configs.secure, maxAge : session_configs.cookie_configs.expire_time_ms}}))
app.use(express.json())
app.use(express.urlencoded())
app.use(passport.initialize())
app.use(passport.session())

// Passport middleware configuration 

passport.use('local', localStratergy)
passport.serializeUser(serialize)
passport.deserializeUser(deserialize)


// Routes

app.use('/api', authenticationRouter)
app.use("/api", authenticationMiddleware ,express.static(frontendApp))
app.use('/api/aria', authenticationMiddleware, ariaRouter)
app.use('/api/fs', authenticationMiddleware, filesystemRouter)
app.use('/api/fs', authenticationMiddleware,fileTransferRouter)
app.get('/', (request, response)=>{
    response.redirect('/api/login')
})



const port = process.env.NODE_ENV === 'test'? 8000 : 80
const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })
const io = new Server(server)

io.use(authenticate)
io.use(updateDownloadStatus)

export {server, app}