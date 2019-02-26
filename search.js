const ytdl = require('ytdl-core');
const Discord = require('discord.js');
//const search = require('yt-search');
var fs = require('fs');
const streamOptions = { seek: 0, volume: 1, bitrate: 96000};

exports.run = async (args) => {

    const search = require( 'yt-search' );
    //console.log( args.toString() );
    search( args.toString(), function ( err, r ) {
        if ( err ) throw err

        const videos = r.videos;
        const playlists = r.playlists;
        const accounts = r.accounts;

        const firstResult = videos[ 0 ];

        console.log( firstResult );
    } );
}
