const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');

exports.run = async (message, args) => {
  var data = fs.readFileSync('Queue.json');
  var queue = JSON.parse(data);
  var jqueue = '';
  var index = queue.length;
  if(!args) return message.channel.send('Please enter a name for the playlist.');
  t = {
    name: args.toString(),
    playing: false,
    index: 0,
    list: queue[0].list
  };
  queue.push(t);
  message.channel.send(`Saved playlist to name ${queue[index].name}. If you would like to hear this playlist again type !play followed by the name of the playlist`);
  jqueue = JSON.stringify(queue, null, 2);
  fs.writeFileSync('Queue.json', jqueue);
  console.log(`Saved playlist ${queue[index].name} to index number ${index}`);
}
