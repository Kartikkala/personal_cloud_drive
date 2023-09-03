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

export async function disconnectAria2(aria2Object)
{
    return aria2Object.disconnectAria2()
}