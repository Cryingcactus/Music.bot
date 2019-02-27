const ytdl = require('ytdl-core');
const Discord = require('discord.js');
//const search = require('yt-search');
var fs = require('fs');
const streamOptions = { seek: 0, volume: 1, bitrate: 96000};

exports.run = function(args) {
    return new Promise(function(resolve, reject) {
        const search = require('yt-search');
        //console.log( args.toString() );
        search(args.toString(), function (err, r) {
            if (err) {
                reject();
            }
            
            const videos = r.videos;
            const playlists = r.playlists;
            const accounts = r.accounts;
            const firstResult = videos[0];
            
            console.log(`URL ${firstResult.url }`);
            resolve(firstResult.url);
        });
    });
}
