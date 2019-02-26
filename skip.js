const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');
const play = require('./play.js');
const streamOptions = { seek: 0, volume: 1 };

exports.run = async (message, args, listi, queue) => {
  var connection = await message.member.voiceChannel.join();
  if (queue[listi].playing) {
    //queue[listi].skip = true;
    //queue[listi].dispatcher.pause();
    queue[listi].skip = true;
    queue[listi].dispatcher.emit('end');
    console.log("Skipped song");
    //BUG HERE for when you skip and its on the last index of the list
    // if((queue[listi].list.length - 1) == queue[listi].index) {
    //   return message.channel.send('There are no more song in the queue to skip.');
    // }
    await play(connection, streamOptions, listi, queue);

  }
  else {
    console.log("No songs to skip");
  }
}

function finished(err) {
  console.log('Done');
}
