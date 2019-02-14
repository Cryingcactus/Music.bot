const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const opus = require('opusscript');
const { prefix, token } = require('./botconfig.json');
const play = require('./play.js');
const leave = require('./leave.js');
const save = require('./save.js');
const client = new Discord.Client();
var fs = require('fs');
//vars
const savedplaylist = [];


var currenti = 0;

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
  else {
		//options
		var data = fs.readFileSync('Queue.json');
	  var queue = JSON.parse(data);
		var savedqueue = [];
		for (var i = 0; i < queue.length; i++) {
			savedqueue.push(queue[i].name);
		}
		console.log(`savedqueue: ${savedqueue}`);

		const voiceChannel = message.member.voiceChannel;
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift();

    if (command === 'play') {
			//when play command is given, it will test if the following word is part of the saved lists, and if not it will try to add to current list
			play.run(message, args, 0);
    }
		// else if (args == "test") {
		// 	play.run(message, args, 1);
		// }
    else if (command === 'leave') {
			message.guild.me.voiceChannel.leave();
    }
		else if (command === 'save') {
			save.run(message, args);
		}
  }



});

client.login(token);
