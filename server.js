const finalhandler = require('finalhandler');
const http = require('http');
const serveStatic = require('serve-static');
const path = require('path');

let target = '.';

process.argv.find((item, index, array) => {
    if (item === '--env.target') {
        target = array[index + 1];
        return true;
    }
});

// Serve up public/ftp folder
const serve = serveStatic(path.join(__dirname, `./src/${target}/test`), {'index': ['index.html', 'index.htm']});

// Create server
const server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res))
});

const port = 8887;
// Listen
server.listen(port);
console.log(`服务启动，端口: ${port}`);

