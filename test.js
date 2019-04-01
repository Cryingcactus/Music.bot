const ytdl = require('ytdl-core');
const Discord = require('discord.js');

const ytlist = require('youtube-playlist');
const opus = require('opusscript');

const prefix = '!';
const token = 'NTYwODA0ODQzNDkzNzg1NjEw.D35R0Q.0L1BSCk-yE1C_eGesKDnHef4OBw';


const leave = require('./leave.js');
const save = require('./save.js');
const clear = require('./clear.js');
const skip = require('./skip.js');
const nowplaying = require('./nowplaying.js');
const client = new Discord.Client();
var fs = require('fs');
const savedplaylist = [];
const streamOptions = {
    seek: 0,
    volume: 1,
    bitrate: 96000
};

let songs = ["https://youtu.be/ShGVCembq70?t=44", "https://www.youtube.com/watch?v=9iMMHXHHwQg", "https://youtu.be/ShGVCembq70?t=44"];
let playing = false;
let index = 0;
let dispatcher = undefined;
const servers = new Map();
let k = 0;

client.on('message', async message => {
    if (!message.author.bot) {


        if (message.content == 's') {
            const myServer = servers.get(message.guild.id);
            //myServer.index++;
            myServer.connection.dispatcher.end();

        } else if (message.content == 'l') {
            message.member.guild.me.voiceChannel.leave();
        } else {
            const myServer = servers.get(message.guild.id);
            if (!myServer) {
                const queue = {
                    textChannel: message.channel,
                    voiceChannel: message.member.voiceChannel,
                    connection: undefined,
                    dispatcher: undefined,
                    songs: [],
                    index: 0,
                    volume: 1,
                    playing: false
                };
                servers.set(message.guild.id, queue);
                try {
                    var connection = await message.member.voiceChannel.join();
                    queue.connection = connection;
                } catch (e) {
                    console.error("I couldn't join the channel");
                }

                await addSong(queue);


                play(message.guild, queue.songs[queue.index]);
                //queue.index++;
            } else {
                addSong(servers.get(message.guild.id));
                //console.log(servers.get(message.guild.id).songs);
            }
        }
    }
});

async function addSong(queue) {
    const info = await ytdl.getInfo(songs[k]);
    k++;
    const song = {
        title: info.title,
        url: info.video_url
    };
    queue.songs.push(song);
    console.log("Added song to queue");
}

async function play(guild, song) {
    const myServer = servers.get(guild.id);

    if (!song) {
        await myServer.voiceChannel.leave();
        servers.delete(guild.id);
        return;
    }
    console.log(myServer.songs);

    let dispatcher = myServer.connection.playStream(ytdl(song.url))
        .on('end', function() {
            myServer.index++;
            play(guild, myServer.songs[myServer.index]);
            console.log(myServer.index);
        })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(myServer.volume);

    myServer.textChannel.send(`🎶 Now playing: **${song.title}**`);
}





client.login(token);
