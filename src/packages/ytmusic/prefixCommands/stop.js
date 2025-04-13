export const config = {
  name: 'stop',
  aliases: ['leave', 'disconnect'],
  description: 'Stop playing music and clear the queue',
  usage: 'stop',
  category: 'music'
};

export async function execute(message, args, voiceChannel, musicPlayer) {
  const member = message.member;
  const guild = message.guild;
  const channel = message.channel;
 
  // Now safely access musicPlayer properties with additional checks
  if (!musicPlayer?.players || !musicPlayer?.players.has) {
    return message.reply({
      embeds: [Embed.notify('Error', 'Music player is not available.', TYPE.ERROR)]
    });
  }
  
  // Check if bot is playing in this guild
  if (!musicPlayer.players.has(guild.id)) {
    return message.reply({
      embeds: [Embed.notify('Error', 'I am not playing anything in this server!', TYPE.ERROR)]
    });
  }
  
  const botVoiceChannel = musicPlayer.getVoiceChannel(guild.id);
  // Check bot is in a voice channel
  if (!botVoiceChannel) {
    return message.reply({
      embeds: [Embed.notify('Error', 'I am not in a voice channel!', TYPE.ERROR)]
    });
  }

  // Check same voice channel
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel?.id) {
    return message.reply({
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to skip songs!', TYPE.ERROR)]
    });
  }
  
  try {
    // Stop music and clear queue
    musicPlayer.stop(guild.id);
    
    // Disconnect from voice
    musicPlayer.disconnect(guild.id);
    
    return message.reply({
      embeds: [Embed.notify('Stopped', 'Music playback has been stopped and the queue cleared.', TYPE.STOPPED)]
    });
  } catch (error) {
    console.error('Error stopping playback:', error);
    return message.reply({
      embeds: [Embed.notify('Error', 'Failed to stop music playback.', TYPE.ERROR)]
    });
  }
}
