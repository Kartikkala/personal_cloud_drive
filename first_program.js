const http = require('node:http');

function myFunction(req, res) {
    res.writeHead(200, { 'Content-type': "text/html" });
    res.write("Hemlo");
    res.end();
}
const server = http.createServer(myFunction);


server.listen(80, '0.0.0.0', () => { console.log("Hehe") });