const express = require('express');

const app = express();

// const dirname = '/home/sirkartik/vscode/web-dev/';

// app.use("/", express.static(dirname + 'product-preview-card-component-main'));
app.get("/", (req, res) => {
    console.log(req.ip);
    res.send(`I got your IP! your Ip address is:${req.ip}`);
})


app.listen(80, '0.0.0.0', () => { console.log("Listening on port 80"); });