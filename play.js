const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const search = require('./search.js');
const ytlist = require('youtube-playlist');
var fs = require('fs');

const streamOptions = {
    seek: 0,
    volume: 1,
    bitrate: 96000
};

exports.run = async (message, args, club) => {
    const myRoom = club.get(message.guild.id);
    //check if its a valid url for yt
    let validate = await ytdl.validateURL(args[0]);
    if (!validate) {
        //Search youtube for song
        args[0] = await search.run(args.toString());
    }
    if (!myRoom) {
        const musicRoom = {
            connection: undefined,
            rules: "Hello everyone! I'll be your DJ for the music-room.\nTo request a song, just type !play followed by either the YouTube url or the title of the video.\nHere's and example: **!play Apink NoNoNo**\n\n~ Here is a list of all the commands you can do ~\n**!play**\t\tThis will play a YouTube url or song name and artist\n**!skip**\t\tSkips the current song\n**!pause**\t\tPauses the current song\n**!resume**\t\tResumes the music if its been paused\n**!loop**\t\tSets the current list of songs to loop back to the begining when its done\n**!repeat**\t\tRepeats the current song until repeat is turned off (repeat trumps loop)\n**!shuffle**\t\tShuffles the rest of the songs in the queue. If you add more they will be put at the end\n**!newplaylist**\t\tMakes a new empty playlist with this name\n**!playlist**\t\tPlays a saved playlist\n**!add**\t\tAdds a song to the playlist with that name. Does nothing if there is no playlist with that name\n**!save**\t\tSaves all songs played since I joined the channel and the rest of the queue to a playlist with that name\n**!clear**\t\tClears the rest of the songs in the queue\n**!leave**\t\tLeaves the channel and removes the rest of the songs from the queue\n\n\u200b",
            leave: false,
            playlist: "current",
            setup: false,
            channels: {
                textChannel: message.channel,
                voiceChannel: message.member.voiceChannel,
            },
            messages: {
                nowplaying: undefined,
                queuemessage: undefined,
                options: false
            },
            options: {
                loop: false,
                repeat: false,
                volume: 1
            },
            player: {
                index: 0,
                songs: []
            },
            status: {
                playing: false
            }
        };
        club.set(message.guild.id, musicRoom);
        try {
            var connection = await message.member.voiceChannel.join();
            //only run one time to show the rules at the top of the room
            await message.channel.send(musicRoom.rules);
            musicRoom.connection = connection;
        } catch (e) {
            console.error("I couldn't join the channel");
        }
        await addSong(musicRoom, args[0], message);
        play(club, message, musicRoom.player.songs[musicRoom.player.index]);
        showQueue(club.get(message.guild.id), message);

    } else {
        if (myRoom.status.playing == false) {
            //this runs if the queue has run out of songs and another song is added to the queue. So it won't leave
            var connection = await message.member.voiceChannel.join();
            myRoom.connection = connection;
            await addSong(myRoom, args[0], message);
            play(club, message, myRoom.player.songs[myRoom.player.index]);
            showQueue(myRoom, message);
        } else {
            //run when running the play command and the player is already running
            await addSong(myRoom, args[0], message);
            showQueue(myRoom, message);
        }
    }
}

exports.playlist = async (message, args, club) => {
    let myRoom = club.get(message.guild.id);
    if (!myRoom) {
        myRoom = {
            connection: undefined,
            rules: "Hello everyone! I'll be your DJ for the music-room.\nTo request a song, just type !play followed by either the YouTube url or the title of the video.\nHere's and example: **!play Apink NoNoNo**\n\n~ Here is a list of all the commands you can do ~\n**!play**\t\tThis will play a YouTube url or song name and artist\n**!skip**\t\tSkips the current song\n**!pause**\t\tPauses the current song\n**!resume**\t\tResumes the music if its been paused\n**!loop**\t\tSets the current list of songs to loop back to the begining when its done\n**!repeat**\t\tRepeats the current song until repeat is turned off (repeat trumps loop)\n**!shuffle**\t\tShuffles the rest of the songs in the queue. If you add more they will be put at the end\n**!newplaylist**\t\tMakes a new empty playlist with this name\n**!playlist**\t\tPlays a saved playlist\n**!add**\t\tAdds a song to the playlist with that name. Does nothing if there is no playlist with that name\n**!save**\t\tSaves all songs played since I joined the channel and the rest of the queue to a playlist with that name\n\n\u200b",
            leave: false,
            playlist: args[0],
            setup: false,
            channels: {
                textChannel: message.channel,
                voiceChannel: message.member.voiceChannel,
            },
            messages: {
                nowplaying: undefined,
                queuemessage: undefined,
                options: false
            },
            options: {
                loop: false,
                repeat: false,
                volume: 1
            },
            player: {
                index: 0,
                songs: []
            },
            status: {
                playing: false
            }
        };
        club.set(message.guild.id, myRoom);
    }
    var connection = await message.member.voiceChannel.join();
    //only run one time to show the rules at the top of the room
    //await message.channel.send(myRoom.rules);
    myRoom.connection = connection;
    let r = await fs.readFileSync('playlists.json');
    let read = JSON.parse(r);
    //console.log(myRoom);
    myRoom.player.songs = read[args[0]].songs;

    if (myRoom.connection.dispatcher) {
        myRoom.player.index = myRoom.player.songs.length+1;
        await myRoom.connection.dispatcher.end();
        myRoom.player.index = 0;
    }

    play(club, message, myRoom.player.songs[myRoom.player.index]);
    showQueue(myRoom, message);
}

// exports.join = (message, club) => {
//
// }

async function addSong(myRoom, url, message) {
    const info = await ytdl.getInfo(url);
    const song = {
        title: info.title,
        url: info.video_url,
        requestedby: message.member.displayName
    };
    myRoom.player.songs.push(song);
    console.log("Added song to queue");
}

function waitAfterSong(myRoom, message, club) {
    return new Promise(resolve => {
        setTimeout(function() {
            if (myRoom.status.playing == false) {
                myRoom.channels.voiceChannel.leave();
                myRoom.player.index = 0;
                myRoom.player.songs = [];
            }
        }, 300000)
    })
}

async function play(club, message, song) {
    const myRoom = club.get(message.guild.id);

    if (!song) {
        if (myRoom.options.loop) {
            myRoom.player.index = 0;
            play(club, message, myRoom.player.songs[0]);
        } else {
            myRoom.status.playing = false;
            showQueue(myRoom, message);
            waitAfterSong(myRoom, message, club);
        }
    } else {

        if (myRoom.status.playing == false) {
            myRoom.status.playing = true;
        } else {
            showQueue(myRoom, message);
        }

        let dispatcher = myRoom.connection.playStream(ytdl(song.url, {
                filter: 'audioonly'
            }), streamOptions)
            .on('end', async function() {
                if (myRoom.leave) {
                    myRoom.channels.voiceChannel.leave();
                    myRoom.status.playing = false;
                    return;
                }
                if (!myRoom.options.repeat) {
                    myRoom.player.index++;
                }
                await play(club, message, myRoom.player.songs[myRoom.player.index]);
            })
            .on('error', error => console.error(error));
    }
}

exports.updateMessage = async (myRoom, message) => {
    showQueue(myRoom, message);
}

async function showQueue(myRoom, message) {
    if (myRoom.player.songs[myRoom.player.index] && myRoom.messages.nowplaying != undefined) {
        myRoom.messages.nowplaying.edit(`Now playing\n**${myRoom.player.songs[myRoom.player.index].title}**\nRequested by ${myRoom.player.songs[myRoom.player.index].requestedby}`);
    } else if (!myRoom.player.songs[myRoom.player.index] && myRoom.messages.nowplaying != undefined) {
        myRoom.messages.nowplaying.edit(`Now playing\n\nRequested by`);
    } else {
        await myRoom.channels.textChannel.send(`Now playing\n**${myRoom.player.songs[myRoom.player.index].title}**\nRequested by ${myRoom.player.songs[myRoom.player.index].requestedby}`);
        myRoom.messages.nowplaying = await message.member.guild.me.lastMessage;
    }
    if (!myRoom.messages.options) {
        let options = "\u200b\n\u200b";
        await myRoom.channels.textChannel.send(options);
        myRoom.messages.options = await message.member.guild.me.lastMessage;
    }

    let queue = "Up next\n";
    for (let i = 0; i < 10; i++) {
        if (myRoom.player.songs[myRoom.player.index + i + 1]) {
            queue = queue + `${i + 1}  |  **${myRoom.player.songs[myRoom.player.index + i + 1].title}**\n`;
        } else {
            queue = queue + `${i + 1}  |\n`;
        }
    }
    //queue = queue.substring(0, queue.length - 1);
    queue = queue + `Song ${myRoom.player.index + 1} of ${myRoom.player.songs.length}`;
    if (myRoom.messages.queuemessage != undefined) {
        myRoom.messages.queuemessage.edit(queue);
    } else {
        await myRoom.channels.textChannel.send(queue);
        myRoom.messages.queuemessage = await message.member.guild.me.lastMessage;
    }
}
