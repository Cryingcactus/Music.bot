const ytdl = require('ytdl-core');
const Discord = require('discord.js');
const search = require('./search.js');

const streamOptions = {
    seek: 0,
    volume: 1,
    bitrate: 96000
};

exports.run = async (message, args, listi, queue, skip) => {
    //-------------------------------------------------------------------------------------------------
    let connection = await message.member.voiceChannel.join();
    //here we need to check if the skip is true. if it is it will skip the validation steps
    if (skip == true) {
        if (queue[listi].playing) {
            queue[listi].skip = true;
            if (args[0]) {
                console.log(args[0]);
                if (args[0] < (queue[listi].list.length - queue[listi].index)) {
                    queue[listi].index = queue[listi].index + args[0] - 1;
                } else {
                    queue[listi].index = queue[listi].list.length;
                }
            }
            await queue[listi].dispatcher.emit('end');
            console.log("Skipped song");
            if (queue[listi].playing == true) {
                await play(connection, streamOptions, listi, queue, message);
            }
        } else {
            console.log("No songs to skip");
        }
    } else {
        //check if trying to play a saved list
        if (listi > 0) {
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].playing == true) {
                    queue[i].skip = true;
                    queue[i].playing = false;
                    queue[i].dispatcher.emit('end');
                }
            }
            await play(connection, streamOptions, listi, queue, message);
        } else {
            //-------------------------------------------------------------------------------------------------
            // Search youtube for song
            let validate = await ytdl.validateURL(args[0]);
            if (!validate) {
                args[0] = await search.run(args.toString());
            }

            //-------------------------------------------------------------------------------------------------
            //check if the playlist is already playing
            //if its playing it will add the current song to the lists
            //if its not playing it will connect, add song to queue, and set playing to true
            let details = [];
            let info = await ytdl.getInfo(args[0]);
            let requested = "";
            if (message.author.nick != undefined) {
                requested = message.author.nick;
            } else {
                requested = message.author.username;
            }
            details.push(info.title);
            details.push(requested);
            queue[listi].info.push(details);
            if (queue[listi].playing) {
                queue[listi].list.push(args[0]);
                updateNPQ(queue, listi, message);
            } else {
                console.log("joined channel");
                queue[listi].playing = true;
                queue[listi].list.push(args[0]);
                await play(connection, streamOptions, listi, queue, message);
            }
        }
    }
}

async function updateNPQ(queue, listi, message) {
    let np = `Now playing\n${queue[listi].info[queue[listi].index][0]}\nRequested by ${queue[listi].info[queue[listi].index][1]}\n\nUp next`;
    let q = "";
    if (queue[listi].list.length - queue[listi].index == 2) {
        q = `1  | ${queue[listi].info[queue[listi].index+1][0]}\n2 | - - - - - - - - - - -\n3 | - - - - - - - - - - -`;
    } else if (queue[listi].list.length - queue[listi].index == 3) {
        q = `1  | ${queue[listi].info[queue[listi].index+1][0]}\n2 | ${queue[listi].info[queue[listi].index+2][0]}\n3 | - - - - - - - - - - -`;
    } else if (queue[listi].list.length - queue[listi].index > 3) {
        q = `1  | ${queue[listi].info[queue[listi].index+1][0]}\n2 | ${queue[listi].info[queue[listi].index+2][0]}\n3 | ${queue[listi].info[queue[listi].index+3][0]}`;
    } else {
        q = `1  | - - - - - - - - - - -\n2 | - - - - - - - - - - -\n3 | - - - - - - - - - - -`;
    }
    if (queue[listi].npq == "") {

        //sending and saving messages
        await message.channel.send(np);
        queue[listi].np = message.member.guild.me.lastMessage;

        await message.channel.send(q);
        queue[listi].npq = message.member.guild.me.lastMessage;
    }
    else {
        queue[listi].np.edit(np);
        queue[listi].npq.edit(q);
    }
}

async function play(connection, streamOptions, listi, queue, message) {
    if (listi == undefined) {
        listi = 0;
    }
    queue[listi].playing = true;
    queue[listi].dispatcher = await connection.playStream(ytdl(queue[listi].list[queue[listi].index], {
        filter: 'audioonly'
    }), streamOptions);

    //here is the broadcast to the channel and delete the message from the user
    await updateNPQ(queue, listi, message);

    //-------------------------------------------------------------------------------------------------
    queue[listi].dispatcher.once('end', function() {
        queue[listi].index++;
        if (queue[listi].list.length > queue[listi].index) {
            console.log(`now playing: ${queue[listi].list[queue[listi].index]}`);
        } else {
            finished();
            queue[listi].np.edit("Now playing\n- - - - - - - - - - -\n\nUp next");
            queue[listi].playing = false;
            message.member.guild.me.voiceChannel.leave();
            return;
        }
        //-------------------------------------------------------------------------------------------------
        console.log(`Current song index: ${queue[listi].index}`);
        console.log(`Last song index: ${queue[listi].list.length - 1}`);
        if (queue[listi].skip == true) {
            queue[listi].skip = false;
            return;
        }
        else {
            play(connection, streamOptions, listi, queue, message);
        }
    });
}

function finished(err) {
    console.log('Done');
}
