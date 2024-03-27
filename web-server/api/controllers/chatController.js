// Chat, this is epic
'use strict';

exports.getAudioFile = function(audioId) {
    return __dirname + "\\..\\..\\audioFiles\\DND_"+audioId+".wav";
};

function extractAudioIdFromFile(fileName) {
    const splitString = fileName.split('_');
    console.log(splitString);
    const ending = splitString[splitString.length-1];
    console.log("ending: " + ending);
    return ending.split('.')[0];
}