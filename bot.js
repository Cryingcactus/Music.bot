const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const opus = require('opusscript');
const prefix = '!';
const token = 'NTYwODA0ODQzNDkzNzg1NjEw.D35R0Q.0L1BSCk-yE1C_eGesKDnHef4OBw';
const play = require('./play.js');
const leave = require('./leave.js');
const clear = require('./clear.js');
const skip = require('./skip.js');
const options = require('./options.js');
const search = require('./search.js');
const save = require('./save.js');
const add = require('./add.js');
const newplaylist = require('./newplaylist.js');
const shuffle = require('./shuffle');
const client = new Discord.Client();

const club = new Map();
const musicRoom = {
    connection: undefined,
    rules: "Hello everyone! I'll be your DJ for the music-room.\nTo request a song, just type !play followed by either the YouTube url or the title of the video.\nHere's and example: **!play Apink NoNoNo**\n\n~ Here is a list of all the commands you can do ~\n**!play**\t\tThis will play a YouTube url or song name and artist\n**!skip**\t\tSkips the current song\n**!pause**\t\tPauses the current song\n**!resume**\t\tResumes the music if its been paused\n**!loop**\t\tSets the current list of songs to loop back to the begining when its done\n**!repeat**\t\tRepeats the current song until repeat is turned off (repeat trumps loop)\n**!shuffle**\t\tShuffles the rest of the songs in the queue. If you add more they will be put at the end\n**!newplaylist**\t\tMakes a new empty playlist with this name\n**!playlist**\t\tPlays a saved playlist\n**!add**\t\tAdds a song to the playlist with that name. Does nothing if there is no playlist with that name\n**!save**\t\tSaves all songs played since I joined the channel and the rest of the queue to a playlist with that name\n\n\u200b",
    leave: false,
    playlist: "current",
    setup: false,
    channels: {
        textChannel: undefined,
        voiceChannel: undefined,
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
//servers.set(message.guild.id, musicRoom);

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    } else {
        //-------------------------------------------------------------------------------------------------

        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift();

        if (command === 'play') {
            play.run(message, args, club);
        } else if (command === 'skip') {
            skip.run(message, club);
        } else if (command === 'pause') {
            //queue[0].dispatcher.pause();
        } else if (command === "resume") {
            //queue[0].dispatcher.resume();
        }









         else if (command === 'loop') {
            let myRoom = club.get(message.guild.id);
            myRoom.options.loop = !myRoom.options.loop;
            options.run(message, club);
        } else if (command === 'repeat') {
            let myRoom = club.get(message.guild.id);
            myRoom.options.repeat = !myRoom.options.repeat;
            options.run(message, club);
        } else if (command === 'shuffle') {
            let myRoom = club.get(message.guild.id);
            myRoom.options.shuffle = !myRoom.options.shuffle;
            shuffle.run(message, club);
        } else if (command === 'newplaylist') {
            newplaylist.run(message, args);
        } else if (command === 'playlist') {
            play.playlist(message, args, club);
        } else if (command === 'add') {
            add.run(message, args, club);
        } else if (command === 'save') {
            let commandTag = undefined;
            let saveName = args;
            for (var i = 0; i < args.length; i++) {
                if (args[i].startsWith('-')) {
                    commandTag = args[i];
                    saveName.splice(i);
                }
            }
            save.run(message, saveName, club, commandTag);
        } else if (command === 'leave') {
            let myRoom = club.get(message.guild.id);
            myRoom.leave = true;
            myRoom.connection.dispatcher.end();
            myRoom.player.index = 0;
            myRoom.player.songs = [];
            play.updateMessage(myRoom, message);
        } else if (command === 'restart') {
            //not sure if this should restart the song or whole queue
        } else if (command === 'clear') {
            let myRoom = club.get(message.guild.id);
            myRoom.player.index = 0;
            let temp = myRoom.player.songs[0];
            myRoom.player.songs = [];
            myRoom.player.songs.push(temp);
            play.updateMessage(myRoom, message);
        }
        message.delete();
    }
});

client.login(token);
