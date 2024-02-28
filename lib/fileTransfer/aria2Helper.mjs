import Aria2 from 'aria2'
import EventEmitter from "node:events"
import path from 'node:path'


export class Aria2Helper extends EventEmitter{
    constructor(aria2Options){
        super()
        this._aria2c = new Aria2(aria2Options)
        this.userDownloads = {}
        // Try connecting to aria2 API in a 10 second interval

        this.connectToAria2()
        this._aria2c.on('onDownloadStop', (guid)=>{
            
        })
    }
    async connectToAria2(){
        try{
            await this._aria2c.open()
            console.log("Connection to aria2API successful!!!")
        }
        catch(err){
            console.log("Connection to aria2 API failed!!! Check if aria2 client is running with JSON RPC enabled. Retrying connection in 10 secs...\n")
            setTimeout(()=>this.connectToAria2(), 10000)
        }
    }
    async disconnectAria2(){
        try{
            await this._aria2c.close()
            console.log("Disconnected from Aria2c!!!")
        }
        catch(err){
            console.log("Disconnection from aria2 API failed!!! Check if aria2 client is running with JSON RPC enabled. Retrying connection in 10 secs...\n")
            // setTimeout(()=>this.disconnectAria2(), 10000)
        }
    }

    getUserDownloads(userId)
    {
        if(!this.userDownloads.hasOwnProperty(userId))
        {
            console.log(this.userDownloads)
            return false
        }
        return this.userDownloads[userId]
    }

    addUserDownload(userId, guid)
    {
        if(!this.userDownloads.hasOwnProperty(userId))
        {
            this.userDownloads[userId] = []
        }
        this.userDownloads[userId].push(guid)
    }

    removeUserDownload(userId, guid)
    {
        if(!this.userDownloads.hasOwnProperty(userId))
        {
            return false
        }
        const guidIndex = this.userDownloads[userId].indexOf(guid)
        if(guidIndex !== -1)
        {
            this.userDownloads[userId].splice(guidIndex, 1)
            if(this.userDownloads[userId].length === 0)
            {
                delete this.userDownloads[userId]
            }
        }
        return true
    }

    async downloadWithURI(uri, user, downloadPath){
        let guid = undefined
        try{
            guid = await this._aria2c.call("addUri", uri, {dir: downloadPath})
            this.addUserDownload(user._id, guid)
            this.emit("newDownload", user._id.toString(), guid)
            console.log("Download started with GUID: "+guid)
        }
        catch(exception){
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n"+exception)
        }
        return guid
    }
    async pauseDownload(guid)
    {
        let result = undefined
        try{
            result = await this._aria2c.call('pause', guid)
            console.log("Download with GUID : "+guid+" paused!")
        }
        catch(exception){
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n"+exception)
        }
      
      return result
    }
    async resumeDownload(guid)
    {
        let result = undefined
        try{
            result = await this._aria2c.call('unpause', guid)
            console.log("Download with guid : "+guid+" resumed!")
        }
        catch(exception){
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n"+exception)
        }
      return result
    }
    async cancelDownload(guid)
    {
        let result = undefined
        try{
            result = await this._aria2c.call('remove', guid)
            console.log("Download with guid : "+guid+" cancelled!")
        }
        catch(exception){
            console.log("Aria2 API error!!! Bad request or aria2c client not running...\n"+exception)
        }
      return result
    }
    async getUserDownloadStatus(guidArray, statusOptions)
    {
        const result = {}
        try{
            if(Array.isArray(guidArray))
            {
                for(let guid of guidArray)
                {
                    let downloadStatus = undefined
                    let fileName = undefined
                    if(statusOptions === undefined || statusOptions === [])
                    {
                        downloadStatus = await this._aria2c.call('tellStatus', guid)
                    }
                    else
                    {
                        downloadStatus = await this._aria2c.call('tellStatus', guid, statusOptions)
                    }
                    if(downloadStatus.files)
                    {
                        const filePath = downloadStatus.files[0].path
                        if(filePath.length > 0)
                        {
                            fileName = path.basename(filePath)
                        }
                        delete downloadStatus.files
                    }
                    result[fileName] = downloadStatus
                }
            }
        }
        catch(exception)
        {
            console.log("Aria2 API error!!! Bad request or aria2c client not running..."+"\n"+exception)
        }
        return result
    }
}