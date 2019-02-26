const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');

exports.run = async (message, args, queue) => {

  for (var i = 0; i < queue.length; i++) {
    if (queue[i].playing) {
      return message.channel.send(`Now playing ${queue[i].list}`);
      // for (var i = 0; i < queue[i].length  && i < 3; i++) {
      //   queue[i]
      // }
    }
  }
}
