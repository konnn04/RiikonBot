export const config = {
  name: 'resume',
  aliases: ['unpause'],
  description: 'Resume the paused music',
  usage: 'resume',
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
    return message.reply('❌ You need to be in a voice channel to resume music!');
  }
  
  // Safely access musicPlayer properties with checks
  if (!musicPlayer.players || !musicPlayer.players.has) {
    return message.reply('❌ Music player is not properly initialized. Please try again later.');
  }
  
  // Check if bot is connected in this guild
  if (!musicPlayer.players.has(message.guild.id)) {
    return message.reply('❌ There is nothing playing in this server!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = message.guild.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return message.reply('❌ You need to be in the same voice channel as me!');
  }
  
  try {
    const resumed = musicPlayer.resumePlayback(message.guild.id);
    if (resumed) {
      return message.reply('▶️ Music resumed!');
    } else {
      return message.reply('❌ Failed to resume playback!');
    }
  } catch (error) {
    console.error('Error resuming playback:', error);
    return message.reply(`❌ Error: ${error.message}`);
  }
}
