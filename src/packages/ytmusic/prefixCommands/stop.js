export const config = {
  name: 'stop',
  aliases: ['leave', 'disconnect'],
  description: 'Stop playing music and clear the queue',
  usage: 'stop',
  category: 'music'
};

export async function execute(message, args, client, musicPlayer) {
  // Check if musicPlayer is available
  if (!musicPlayer) {
    // Try to get music player from package manager if available
    let resolvedMusicPlayer = null;
    if (client && client.packageManager && typeof client.packageManager.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.packageManager.getMusicPlayer();
      console.log('Retrieved music player from package manager');
    } else if (client && client.musicPlayer) {
      resolvedMusicPlayer = client.musicPlayer;
      console.log('Retrieved music player from client');
    }
    
    // If still not available, inform the user
    if (!resolvedMusicPlayer) {
      return message.reply('❌ Music player is not available yet. Please try again in a few moments.');
    }
    
    // Use the resolved music player
    musicPlayer = resolvedMusicPlayer;
  }

  // Check if user is in a voice channel
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel to stop the music!');
  }
  
  // Safely access musicPlayer properties with checks
  if (!musicPlayer.connections || !musicPlayer.connections.has) {
    return message.reply('❌ Music player is not properly initialized. Please try again later.');
  }
  
  // Check if bot is connected in this guild
  if (!musicPlayer.connections.has(message.guild.id)) {
    return message.reply('❌ I am not in a voice channel!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = message.guild.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return message.reply('❌ You need to be in the same voice channel as me!');
  }
  
  try {
    // Stop music and clear queue
    musicPlayer.stop(message.guild.id);
    
    // Disconnect from voice
    musicPlayer.disconnect(message.guild.id);
    
    return message.reply('🛑 Stopped the music and cleared the queue!');
  } catch (error) {
    console.error('Error stopping playback:', error);
    return message.reply(`❌ Error: ${error.message}`);
  }
}
