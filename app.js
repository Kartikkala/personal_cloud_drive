// Built in modules
import express from 'express'
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'


// Import routes 

import { fileTransferRouter } from './routes/fileTransferRoutes.mjs'
import { ariaRouter } from './routes/aria2Routes.mjs'
import { filesystemRouter } from './routes/filesystemRoutes.mjs'
import { authenticationRouter } from './routes/authenticationRoutes.mjs'

// Configurations

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendApp = path.join(__dirname, "/static/", "/downloadingWebsite/")


// Object creations and initializations

const app = express()


app.disable('x-powered-by')
app.use(express.json())

// Route handling

app.use('/api', authenticationRouter)
app.use("/", express.static(frontendApp))
app.use('/aria', ariaRouter)
app.use('/fs', filesystemRouter)
app.use('/fs', fileTransferRouter)



const port = process.env.NODE_ENV === 'test'? 8000 : 80
const server = app.listen(port, '0.0.0.0', () => { console.log("Listening on port "+port+"...") })

export {server, app}