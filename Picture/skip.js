const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const play = require('./play.js');
var fs = require('fs');

exports.run = async (message, args, listi) => {
  var data = fs.readFileSync('Queue.json');
  var queue = JSON.parse(data);
  var jqueue = '';

  //queue[listi].index++;
  play.run(message, args, listi);
}
