export const config = {
  name: 'skip',
  aliases: ['s', 'next'],
  description: 'Skip to the next song in the queue',
  usage: 'skip',
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
    
    // Use the resolved music player - THIS LINE IS CRITICAL
    musicPlayer = resolvedMusicPlayer;
  }

  // Check if user is in a voice channel
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel to skip songs!');
  }
  
  // Now safely access musicPlayer properties with additional checks
  if (!musicPlayer.players || !musicPlayer.players.has) {
    return message.reply('❌ Music player is not properly initialized. Please try again later.');
  }
  
  // Check if bot is playing in this guild
  if (!musicPlayer.players.has(message.guild.id)) {
    return message.reply('❌ There is nothing playing in this server!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = message.guild.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return message.reply('❌ You need to be in the same voice channel as me!');
  }
  
  // Safely get queue with checks
  let queue;
  try {
    queue = musicPlayer.getQueue(message.guild.id);
  } catch (error) {
    console.error('Error getting queue:', error);
    return message.reply('❌ Failed to access the music queue!');
  }
  
  // Check if there are songs in the queue
  if (!queue || !queue.songs || queue.songs.length <= 1) {
    return message.reply('❌ There are no more songs in the queue to skip to!');
  }
  
  try {
    const skipped = musicPlayer.skipSong(message.guild.id);
    if (skipped) {
      return message.reply('⏭️ Skipped to the next song!');
    } else {
      return message.reply('❌ Failed to skip the song!');
    }
  } catch (error) {
    console.error('Error skipping song:', error);
    return message.reply(`❌ Error: ${error.message}`);
  }
}
