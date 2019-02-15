const ytdl = require('ytdl-core');
const Discord = require('discord.js');
var fs = require('fs');
const streamOptions = { seek: 0, volume: 1, bitrate: 96000};

exports.run = async (message, args, listi, queue, skip) => {
  //variables for reading files
  // var data = fs.readFileSync('Queue.json');
  // var queue = JSON.parse(data);
  // var jqueue = '';
  var connection = await message.member.voiceChannel.join();
  //-------------------------------------------------------------------------------------------------
  //here we need to check if the skip is true. if it is it will skip the validation steps
  if (skip == true) {
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
  else {
    //-------------------------------------------------------------------------------------------------
    // Validate Info
    if (!args) return message.channel.send('Please input a valid url.');
    if (args.length == 0) return message.channel.send('Please input a valid url.');
    let validate = await ytdl.validateURL(args[0]);

    //-------------------------------------------------------------------------------------------------
    // Check Validation
    if (!validate) return message.channel.send('Please input a valid url.');

    //-------------------------------------------------------------------------------------------------
    //check if the playlist is already playing
    //if its playing it will add the current song to the lists
    //if its not playing it will connect, add song to queue, and set playing to true
    if (queue[listi].playing) {
      queue[listi].list.push(args[0]);
    }
    else {
      var connection = await message.member.voiceChannel.join();
      console.log("joined channel");
      queue[listi].playing = true;
      queue[listi].list.push(args[0]);
      //finally starts the play function
      await play(connection, streamOptions, listi, queue);
    }
  }

  //-------------------------------------------------------------------------------------------------



  //-------------------------------------------------------------------------------------------------
  //writes the changes to the file holding the information on the queue's
  // jqueue = JSON.stringify(queue, null, 2);
  // fs.writeFileSync('Queue.json', jqueue, finished);
}



async function play(connection, streamOptions, listi, queue) {
  if(listi == undefined) {
    listi = 0;
  }
  queue[listi].playing = true;
  queue[listi].dispatcher = await connection.playStream(ytdl(queue[listi].list[queue[listi].index], { filter : 'audioonly' }), streamOptions);
  queue[listi].dispatcher.once('end', function() {
    queue[listi].index++;
    console.log(`new index: ${queue[listi].index}`);
    console.log(`max index: ${queue[listi].list.length}`);
    if(queue[listi].skip == true) {
      queue[listi].skip = false;
      return;
    }
    //else if(queue[listi].skip == true && ((queue[listi].list.length - 1) == (queue[listi].index))) {
    //  return message.channel.send('There are no more song in the queue to skip.');
    //}
    if (queue[listi].list.length > queue[listi].index) {
      console.log(`now playing: ${queue[listi].list[queue[listi].index]}`);
      play(connection, streamOptions, listi, queue);
    }
    else {
      finished();
      queue[listi].playing = false;
      //message.member.guild.me.voiceChannel.leave();
    }
  });
}

function finished(err) {
  console.log('Done');
}
