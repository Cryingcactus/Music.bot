const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');

exports.run = (message, args, club) => {
    let r = fs.readFileSync('playlists.json');
    let read = JSON.parse(r);
    if (!args) return message.channel.send('Please enter a name for the playlist.');
    let title = "";
    for (let i = 0; i < args.length; i++) {
        title = title + args[i] + " ";
    }
    title = title.substring(0, title.length - 1);
    if (read.propertyIsEnumerable(title)) {
        console.log("There is already a list saved with this name.");
        return;
    }

    let playlist = {
        songs: club.get(message.guild.id).player.songs,
        createdBy: message.member.displayName
    }
    read[title] = playlist;
    let write = JSON.stringify(read, null, 2);
    fs.writeFileSync('playlists.json', write);
    console.log(`Saved playlist ${title}`);
}
