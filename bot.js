const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const opus = require('opusscript');
const { prefix, token } = require('./botconfig.json');
const play = require('./play.js');
const leave = require('./leave.js');
const save = require('./save.js');
const clear = require('./clear.js');
const client = new Discord.Client();
var fs = require('fs');
//vars
const savedplaylist = [];


//var connection = await message.member.voiceChannel.join();
var data = fs.readFileSync('Queue.json');
var queue = JSON.parse(data);
var jqueue = '';
//active = new Map();
////queue.active.

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
  else {
		//-------------------------------------------------------------------------------------------------

		const args = message.content.slice(prefix.length).split(/ +/);
		const command = args.shift();

    if (command === 'play') {
			//when play command is given, it will test if the following word is part of the saved lists, and if not it will try to add to current list
			play.run(message, args, 0, queue);
		}
		else if (command === 'pause') {
			queue[0].dispatcher.pause();
		}
		else if (command == "resume") {
			queue[0].dispatcher.resume();
		}
		else if (command === 'skip') {
			//queue[0].index++;
			play.run(message, args, 0, queue, true);
		}
    else if (command === 'leave') {
			queue[0].playing = false;
			//queue[0].active = false;
			queue[0].dispatcher = '';
			queue[0].index = 0;
			//jqueue = JSON.stringify(queue, null, 2);
			//fs.writeFileSync('Queue.json', jqueue);
			//process.exit(e);
			console.log(message);
			if (message.member.guild.me.voiceChannel != undefined) {
				message.member.guild.me.voiceChannel.leave();
			}
    }
		else if (command === 'save') {
			save.run(message, args, queue);
		}
  }

});

client.login(token);
