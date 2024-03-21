'use strict';
var ms = require('mediaserver');

module.exports = function(app) {
    var apiApp = require('../controllers/chatController');

    app.route('/submit')
        .put(apiApp.submit);

    app.route('/history')
        .put(apiApp.getHistory);

    app.get('/audio.wav', function(req, res){
        console.log(req.query);
        ms.pipe(req, res, apiApp.getAudioFile(req.query.id));
    });
};