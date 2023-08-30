export function stopServer(server){
    return new Promise((resolve, reject)=>{
        server.close((err)=>{
            if (err){
                console.err(err)
                reject(err)
                process.exit(-1)
            }
            else{
                resolve()
                process.exit(0)
            }
        })
    })
}