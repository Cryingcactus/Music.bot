const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');

exports.run = async (message, args, listi) => {
  var data = fs.readFileSync('Queue.json');
  var queue = JSON.parse(data);
  var jqueue = '';

  if (!args) return message.channel.send('Please input a valid url.');
  //console.log("HI");
  //console.log(args[0]);
  if (args.length == 0) return message.channel.send('Please input a valid url.');

  // Validate Info
  let validate = await ytdl.validateURL(args[0]);

  // Check Validation
  if (!validate) return message.channel.send('Please input a valid url.');

  const streamOptions = { seek: 0, volume: 1 };

  console.log("joined channel");
  if (queue[0].playing) {
    queue[0].list.push(args[0]);
  }
  else {
    var connection = await message.member.voiceChannel.join();
    queue[0].playing = true;
    queue[0].list.push(args[0]);
  }
  jqueue = JSON.stringify(queue, null, 2);
  fs.writeFileSync('Queue.json', jqueue, finished);
  play(connection, streamOptions);
}

async function play(connection, streamOptions, listi) {
  if(listi == undefined) {
    listi = 0;
  }
  data = fs.readFileSync('Queue.json');
  queue = JSON.parse(data);
  jqueue = '';
  queue[listi].playing = true;
  var dispatcher = await connection.playStream(ytdl(queue[listi].list[queue[listi].index], { filter : 'audioonly' }), streamOptions);
  dispatcher.once('end', function() {
    queue[listi].index++;
    jqueue = JSON.stringify(queue, null, 2);
    fs.writeFileSync('Queue.json', jqueue, finished);
    if (queue[listi].list.length > queue[listi].index) {
      play(connection, streamOptions, listi);
    }
    else {
      finished();
      queue[0].playing = false;
      jqueue = JSON.stringify(queue, null, 2);
      fs.writeFileSync('Queue.json', jqueue, finished);
      message.guild.me.voiceChannel.leave();
    }
  });
}

function finished(err) {
  console.log('Done');
}
