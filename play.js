const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const search = require('./search.js');
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
      if (args[0]) {
        console.log(args[0]);
        if (args[0] < (queue[listi].list.length - queue[listi].index)) {
          queue[listi].index = queue[listi].index + args[0] - 1;
        }
        else {
          queue[listi].index = queue[listi].list.length;
        }
      }
      queue[listi].dispatcher.emit('end');
      console.log("Skipped song");
      //BUG HERE for when you skip and its on the last index of the list
      // if((queue[listi].list.length - 1) == queue[listi].index) {
      //   return message.channel.send('There are no more song in the queue to skip.');
      // }
      await play(connection, streamOptions, listi, queue, message);

    }
    else {
      console.log("No songs to skip");
    }
  }
  else {
      //this looks very strang.... look into this for bugs with playing saved lists
    if (listi > 0) {
      for (var i = 0; i < queue.length; i++) {
        if (queue[i].playing == true) {
          queue[i].skip = true;
          queue[i].playing = false;
          queue[i].dispatcher.emit('end');
        }
      }
      await play(connection, streamOptions, listi, queue, message);
    }
    else {
      //-------------------------------------------------------------------------------------------------
      // Validate Info
      if (!args) return message.channel.send('Please input a valid url or name of song.');
      if (args.length == 0) return message.channel.send('Please input a valid url or name of song.');
      let validate = await ytdl.validateURL(args[0]);

      //-------------------------------------------------------------------------------------------------
      // Check Validation
      if (!validate) {

          args[0] = new Promise( function (resolve, reject) {
              //search.run(args);
              //learn about promises. No clue whats happening with this code. HEADACHES 
              if (search.run(args)) {
                reject();
            } else {
                resolve();
            }
        });
          console.log(`after inside ${url}`);
      }



      console.log(`afterafter`);

      //-------------------------------------------------------------------------------------------------
      //check if the playlist is already playing
      //if its playing it will add the current song to the lists
      //if its not playing it will connect, add song to queue, and set playing to true
      var details = [];
      var info = await ytdl.getInfo(args[0]);
      var requested = "";
      if (message.author.nick != undefined) {
        requested = message.author.nick;
      }
      else {
        requested = message.author.username;
      }
      details.push(info.title);
      details.push(requested);
      queue[listi].info.push(details);
      if (queue[listi].playing) {
        queue[listi].list.push(args[0]);
        updateNPQ(listi, queue);
      }
      else {
        var connection = await message.member.voiceChannel.join();
        console.log("joined channel");
        queue[listi].playing = true;
        queue[listi].list.push(args[0]);
        //finally starts the play function
        await play(connection, streamOptions, listi, queue, message);
      }
    }
  }

  //-------------------------------------------------------------------------------------------------



  //-------------------------------------------------------------------------------------------------
  //writes the changes to the file holding the information on the queue's
  // jqueue = JSON.stringify(queue, null, 2);
  // fs.writeFileSync('Queue.json', jqueue, finished);
}

async function updateNPQ(listi, queue) {
  var q = "";
  if (queue[listi].list.length - queue[listi].index == 2) {
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | - - - - - - - - - - -\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  else if (queue[listi].list.length - queue[listi].index == 3) {
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | ${queue[listi].info[queue[listi].index+2][0]}\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  else if (queue[listi].list.length - queue[listi].index > 3){
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | ${queue[listi].info[queue[listi].index+2][0]}\n 3 | ${queue[listi].info[queue[listi].index+3][0]}\n\nNow playing`;
  }
  else {
    q = `Up next\n 1  | - - - - - - - - - - -\n 2 | - - - - - - - - - - -\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  //var np = `Now playing | ${queue[listi].info[queue[listi].index][0]}\nRequested by ${queue[listi].info[queue[listi].index][1]}`;

  await queue[listi].npq.edit(q);
  //queue[listi].npq = message.member.guild.me.lastMessage;
}

async function play(connection, streamOptions, listi, queue, message) {
  if(listi == undefined) {
    listi = 0;
  }
  queue[listi].playing = true;
  queue[listi].dispatcher = await connection.playStream(ytdl(queue[listi].list[queue[listi].index], { filter : 'audioonly' }), streamOptions);
  //here is the broadcast to the channel and delete the message from the user
  var q = "";
  if (queue[listi].list.length - queue[listi].index == 2) {
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | - - - - - - - - - - -\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  else if (queue[listi].list.length - queue[listi].index == 3) {
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | ${queue[listi].info[queue[listi].index+2][0]}\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  else if (queue[listi].list.length - queue[listi].index > 3){
    q = `Up next\n 1  | ${queue[listi].info[queue[listi].index+1][0]}\n 2 | ${queue[listi].info[queue[listi].index+2][0]}\n 3 | ${queue[listi].info[queue[listi].index+3][0]}\n\nNow playing`;
  }
  else {
    q = `Up next\n 1  | - - - - - - - - - - -\n 2 | - - - - - - - - - - -\n 3 | - - - - - - - - - - -\n\nNow playing`;
  }
  var np = `${queue[listi].info[queue[listi].index][0]}\nRequested by ${queue[listi].info[queue[listi].index][1]}`;

  await message.channel.send(q);
  queue[listi].npq = message.member.guild.me.lastMessage;
  await message.channel.send(np);
  queue[listi].np = message.member.guild.me.lastMessage;
  //queue[listi].npq.delete();

  //queue[listi].npq = message.member.guild.me.lastMessage;




  //-------------------------------------------------------------------------------------------------
    queue[listi].dispatcher.once('end',function() {
      queue[listi].index++;
      //here is where the broadcast will be deleted so the next one can be places in its places
      queue[listi].npq.delete();
      queue[listi].np.delete();
      //-------------------------------------------------------------------------------------------------
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
        play(connection, streamOptions, listi, queue, message);
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
