const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');
const play = require('./play.js');
const streamOptions = {
    seek: 0,
    volume: 1
};

exports.run = async (message, servers) => {
    let myServer = await servers.get(message.guild.id);
    //console.log(myServer);
    if (myServer) {
        myServer.connection.dispatcher.end();
        myServer.skip = true;
        console.log("Skipped song");
    } else {
        console.log("No songs to skip");
    }
}

function finished(err) {
    console.log('Done');
}
