const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');
const streamOptions = { seek: 0, volume: 1 };

exports.run = async (message, args, listi) => {
  //variables for reading files
  var data = fs.readFileSync('Queue.json');
  var queue = JSON.parse(data);
  var jqueue = '';

  queue[listi].index = 0;
  //queue
  //play.run(message, args, listi, true);
  jqueue = JSON.stringify(queue, null, 2);
  fs.writeFileSync('Queue.json', jqueue, finished);
}

function finished(err) {
  console.log('Done');
}
