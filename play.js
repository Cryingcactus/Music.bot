const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const search = require('./search.js');
const ytlist = require('youtube-playlist');

const streamOptions = {
    seek: 0,
    volume: 1,
    bitrate: 96000
};

exports.run = async (message, args, servers) => {
    const myServer = servers.get(message.guild.id);
    //Search youtube for song
    let validate = await ytdl.validateURL(args[0]);
    if (!validate) {
        args[0] = await search.run(args.toString());
    }
    if (!myServer) {
        const queue = {
            textChannel: message.channel,
            voiceChannel: message.member.voiceChannel,
            connection: undefined,
            dispatcher: undefined,
            songs: [],
            index: 0,
            volume: 1,
            playing: false,
            nowplaying: undefined,
            queuemessage: undefined,
            skip: false
        };
        servers.set(message.guild.id, queue);
        try {
            var connection = await message.member.voiceChannel.join();
            queue.connection = connection;
        } catch (e) {
            console.error("I couldn't join the channel");
        }
        //console.log(args);
        await addSong(queue, args[0], message);


        play(servers, message, queue.songs[queue.index]);
        //constructDisplay(servers, message);
        showQueue(servers.get(message.guild.id), message);

    } else {
        await addSong(servers.get(message.guild.id, message), args[0], message);
        //console.log(servers.get(message.guild.id).songs);
        showQueue(myServer, message);
    }
}

function constructDisplay(servers, message) {
    showQueue(servers.get(message.guild.id), message);
}

async function addSong(queue, url, message) {
    const info = await ytdl.getInfo(url);
    const song = {
        title: info.title,
        url: info.video_url,
        requestedby: message.member.displayName
    };
    queue.songs.push(song);
    console.log("Added song to queue");
}

async function waitAfterSong(myServer, message) {
    setTimeout(function() {
        if (myServer.playing == false) {
            myServer.voiceChannel.leave();
            //servers.delete(message.guild.id);
        }
        return;
    }, 30000);
}

async function play(servers, message, song) {
    const myServer = servers.get(message.guild.id);

    if (!song) {
        myServer.playing = false;
        showQueue(myServer, message);
        waitAfterSong(myServer, message);
    } else {

        if (myServer.playing == false) {
            myServer.playing = true;
        } else {
            showQueue(myServer, message);
        }

        let dispatcher = myServer.connection.playStream(ytdl(song.url, {
                filter: 'audioonly'
            }), streamOptions)
            .on('end', async function() {
                myServer.index++;
                myServer.skip = true;
                await play(servers, message, myServer.songs[myServer.index]);
                //console.log(myServer.index);
            })
            .on('error', error => console.error(error));

        //dispatcher.setVolumeLogarithmic(myServer.volume);
    }
}

async function showQueue(myServer, message) {
    //console.log(myServer.nowplaying);
    console.log(myServer.index);
    console.log(myServer.songs.length);
    if (myServer.songs[myServer.index] && myServer.nowplaying != undefined) {
        myServer.nowplaying.edit(`Now playing\n**${myServer.songs[myServer.index].title}**\nRequested by ${myServer.songs[myServer.index].requestedby}\n\nUp next`);
    } else if (!myServer.songs[myServer.index] && myServer.nowplaying != undefined) {
        myServer.nowplaying.edit(`Now playing\n\nRequested by\n\nUp next`);
    } else {
        await myServer.textChannel.send(`Now playing\n**${myServer.songs[myServer.index].title}**\nRequested by ${myServer.songs[myServer.index].requestedby}\n\nUp next`);
        myServer.nowplaying = await message.member.guild.me.lastMessage;
    }
    let queue = "";
    for (let i = 0; i < 10; i++) {
        if (myServer.songs[myServer.index + i + 1]) {
            queue = queue + `${i + 1}  |  **${myServer.songs[myServer.index + i + 1].title}**\n`;
        } else {
            queue = queue + `${i + 1}  |  - - - - - - - - - - -\n`;
        }
        //myServer.lines.push(message.member.guild.me.lastMessage);
    }
    if (myServer.queuemessage != undefined) {
        myServer.queuemessage.edit(queue);
    } else {
        await myServer.textChannel.send(queue);
        myServer.queuemessage = await message.member.guild.me.lastMessage;
    }
}
