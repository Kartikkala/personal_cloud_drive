import { newInactiveDownload, verifyJwt } from "../authentication/utility.mjs"
import { socketio_configs } from "../../configs/app_config.js"
import { aria2c } from "../../routes/aria2Routes.mjs"


const downloadStatusUpdateDuration = socketio_configs.downloadStatusUpdateDurationInSeconds * 1000

async function authenticate(socket, next)
{
    const payload = await verifyJwt(socket.handshake.headers.token)
    if(payload)
    {
        socket.payload = payload
        next()
    }
    else{
        socket.emit("message", {"status" : 401, "content" : "Not authenticated!"})
    }
}

async function updateDownloadStatus(socket, next){
    aria2c.on("newDownload", (userId)=>{

        // If the new download is started by currently logged in user
        // then proceed to emit download status updates for that user

        if(userId === socket.payload.sub)
        {
            const statusUpdateInterval = setInterval(async ()=>{
                const downloads = aria2c.getUserDownloads(userId)
                const downloadStatus = await aria2c.getUserDownloadStatus(downloads, ["totalLength", "completedLength", "downloadSpeed", "status", "gid", "files"])
                for(let download in downloadStatus)
                {
                    if(downloadStatus[download].status === "complete" || downloadStatus[download].status === "error")
                    {
                        const guid = downloadStatus[download].gid
                        aria2c.removeUserDownload(userId, guid)
                        newInactiveDownload(userId, guid)
                    }
                }
                socket.emit('statusUpdate',  downloadStatus)
                if(downloads.length === 0)
                {
                    clearInterval(statusUpdateInterval)
                }
            }, downloadStatusUpdateDuration)
        }
    })
    next()
}

export {authenticate, updateDownloadStatus}