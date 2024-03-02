import { verifyJwt } from "../authentication/utils/userAuthUtilFunctions.mjs"
import { aria2c } from "../../routes/aria2Routes.mjs"


async function authenticate(socket, next)
{
    try{
        const payload = await verifyJwt(socket.handshake.headers.token)
        if(payload)
        {
            socket.payload = payload
            next()
        }
    }
    catch(exception)
    {
        next(exception)
    }
}

async function updateDownloadStatus(socket, next){
    aria2c.on("statusUpdate_"+socket.payload.sub, (downloadStatus)=>{
        socket.emit("statusUpdate",downloadStatus)
    })
    next()
}

export {authenticate, updateDownloadStatus}