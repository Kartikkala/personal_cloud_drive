import { Socket } from "socket.io"
import { FileTransferFactory } from "../fileTransfer/transfer.js"


export function updateDownloadStatus(fileTransfer : FileTransferFactory){
    return (socket : Socket, next : Function)=>{
        fileTransfer.server.on("statusUpdate_"+socket.handshake.auth.email, (downloadStatus)=>{
            socket.emit("statusUpdate",downloadStatus)
        })
        next()
    }
}