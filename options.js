const ytdl = require('ytdl-core');
const Discord = require('discord.js');


exports.run = async (message, club) => {
    let myRoom = club.get(message.guild.id);

    //this equals false when no options are on
    let flag = false;

    let options = "";
    if (myRoom.options.loop) {
        options = options + "**[LOOP]** ";
        flag = true;
    }
    if (myRoom.options.repeat) {
        options = options + "**[REPEAT]** ";
        flag = true;
    }
    if (myRoom.options.shuffle) {
        options = options + "**[SHUFFLE]**";
        flag = true;
    }

    if (flag) {
        myRoom.messages.options.edit("\u200b\n"+options);
    }
    else {
        myRoom.messages.options.edit("\u200b\n\u200b");
    }

}
