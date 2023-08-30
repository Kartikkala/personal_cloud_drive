export function stopServer(server){
    return new Promise((resolve, reject)=>{
        server.close((err)=>{
            if (err){
                console.err(err)
                reject(err)
            }
            else{
                resolve()
            }
        })
    })
}