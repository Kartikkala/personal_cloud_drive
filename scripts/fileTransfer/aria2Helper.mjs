import Aria2 from 'aria2'


export class Aria2Helper{
    constructor(aria2Options){
        this._aria2c = new Aria2(aria2Options)

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
    async downloadWithURI(uri, downloadPath){
        let guid = undefined
        try{
            guid = await this._aria2c.call("addUri", uri, {dir: downloadPath})
            console.log("Download started with GUID: "+guid)
        }
        catch(exception){
            console.log("Aria2 API error!!! Bad request or aria2c client not running...")
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
            console.log("Aria2 API error!!! Bad request or aria2c client not running...")
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
            console.log("Aria2 API error!!! Bad request or aria2c client not running...")
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
            console.log("Aria2 API error!!! Bad request or aria2c client not running...")
        }
      return result
    }
}