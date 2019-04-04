const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const play = require('./play.js');

exports.run = (message, club) => {
    const myRoom = club.get(message.guild.id);
    for (let i = 1; i < myRoom.player.songs.length - 1; i++) {
        let random = Math.floor(Math.random() * i) + 1;
        let temp = myRoom.player.songs[i];
        myRoom.player.songs[i] = myRoom.player.songs[random];
        myRoom.player.songs[random] = temp;
    }
    play.updateMessage(myRoom, message);
}
