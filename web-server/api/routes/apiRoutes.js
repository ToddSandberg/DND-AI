'use strict';
var ms = require('mediaserver');

module.exports = function(app) {
    var apiApp = require('../controllers/chatController');

    app.get('/audio.wav', function(req, res){
        console.log(req.query);
        ms.pipe(req, res, apiApp.getAudioFile(req.query.id));
    });
};