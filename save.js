const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');

exports.run = async (message, args, queue) => {
  var jqueue = '';
  if(!args) return message.channel.send('Please enter a name for the playlist.');
  t = {
    name: args.toString(),
    playing: false,
    skip: false,
    index: 0,
    dispatcher: "",
    list: queue[0].list
  };
  queue.push(t);
  var qd = queue[0].dispatcher;
  queue[0].dispatcher = "";
  message.channel.send(`Saved playlist to name ${queue[queue.length-1].name}. If you would like to hear this playlist again type !play followed by the name of the playlist`);
  jqueue = JSON.stringify(queue, null, 2);
  fs.writeFileSync('Queue.json', jqueue);
  queue[0].dispatcher = qd;
  console.log(`Saved playlist ${queue[queue.length-1].name} to index number ${queue.length-1}`);
}
