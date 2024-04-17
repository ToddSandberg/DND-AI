const express = require('express');
const path = require('path');
const app = express();
const http = require('http');

// Set up web sockets
const server = http.createServer(app);
var setupWebSocket = require('./api/setupWebSocket')
setupWebSocket(server);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..' , 'react-app' , 'dist')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..' , 'react-app' ,'build', 'index.html'));
});

var routes = require('./api/routes/apiRoutes');
routes(app);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

// Change the port you want to run on here
server.listen(9000);