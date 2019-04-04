const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');
const search = require('./search.js');
const play = require('./play.js')

exports.run = async (message, args, club) => {
    myRoom = club.get(message.guild.id);

    let r = fs.readFileSync('playlists.json');
    let read = JSON.parse(r);
    let playlistName = args[0];
    if (read.propertyIsEnumerable(playlistName)) {
        let validate = await ytdl.validateURL(args[1]);
        let url = args[1];
        if (!validate) {
            //Search youtube for song
            //console.log(args.splice(1));
            url = await search.run(args.splice(1).toString());
        }
        const info = await ytdl.getInfo(url);
        for (let i = 0; i < read[playlistName].songs.length; i++) {
            if (info.title == read[playlistName].songs[i].title) {
                console.log("This song is already in this playlist");
                return;
            }
        }
        const song = {
            title: info.title,
            url: info.video_url,
            requestedby: message.member.displayName
        };
        //myRoom.player.songs.push(song);
        console.log(`Added song to ${playlistName}`);

        read[playlistName].songs.push(song);
        if (myRoom.playlist == playlistName) {
            myRoom.player.songs.push(song);
            play.updateMessage(myRoom, message);
        }
    }

    let write = JSON.stringify(read, null, 2);
    fs.writeFileSync('playlists.json', write);
}
