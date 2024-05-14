import { Socket } from "socket.io"
import { fileTransfer } from "../../routes/fileTransferRoutes.mjs"

async function updateDownloadStatus(socket : Socket, next : Function ){
    fileTransfer.server.on("statusUpdate_"+socket.handshake.auth.email, (downloadStatus)=>{
        socket.emit("statusUpdate",downloadStatus)
    })
    next()
}

export { updateDownloadStatus}