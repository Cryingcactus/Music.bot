exports.run = (message) => {

  //Check if the person is connected to a voiceChannel
  if (!message.member.voiceChannel) {
    return message.channel.send("You must be in a channel to use this command.");
  }

  //Check if the bot is connectd to a voiceChannel
  if (!message.guild.me.voiceChannel) {
    return message.channel.send("I am not currently in a channel.");
  }

  //Check if the bot and user are in the same voiceChannel
  if (message.guild.me.voiceChannel !== message.member.voiceChannel) {
    return message.channel.send("You must be in the same channel as me to tell me to leave.");
  }

  message.guild.me.voiceChannel.leave();
  message.channel.send("~ Goodbye ~")
}
