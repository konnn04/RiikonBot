export const config = {
  name: 'pause',
  description: 'Pause the currently playing music',
  usage: 'pause',
  category: 'music'
};

// Update the function to accept a context object
export async function execute(contextOrMessage) {
  // Handle both context object and direct parameters
  const context = contextOrMessage.message ? contextOrMessage : { 
    message: contextOrMessage, 
    args: arguments[1], 
    client: arguments[2], 
    musicPlayer: arguments[3] 
  };
  
  // Extract what we need from context
  const { message, client, musicPlayer } = context;
  
  // IMPROVED MUSIC PLAYER RESOLUTION LOGIC
  let resolvedMusicPlayer = musicPlayer;
  
  // If no musicPlayer was provided in context, try to find it
  if (!resolvedMusicPlayer) {
    // Try direct property access first (fastest)
    if (client && client.musicPlayer) {
      resolvedMusicPlayer = client.musicPlayer;
      console.log('Retrieved music player from client.musicPlayer');
    }
    // Then try direct getter method
    else if (client && typeof client.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.getMusicPlayer();
      console.log('Retrieved music player from client.getMusicPlayer()');
    }
    // Then try the package manager getter
    else if (client && client.packageManager && typeof client.packageManager.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.packageManager.getMusicPlayer();
      console.log('Retrieved music player from client.packageManager.getMusicPlayer()');
    }
    
    // If still not available, inform the user
    if (!resolvedMusicPlayer) {
      console.error("Failed to resolve music player in pause command");
      return message.reply('❌ Music system is unavailable. Please report this to the bot administrator.');
    }
  }

  // Check if user is in a voice channel
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel to pause music!');
  }
  
  // Safely access musicPlayer properties with checks
  if (!resolvedMusicPlayer.players || !resolvedMusicPlayer.players.has) {
    return message.reply('❌ Music player is not properly initialized. Please try again later.');
  }
  
  // Check if bot is playing in this guild
  if (!resolvedMusicPlayer.players.has(message.guild.id)) {
    return message.reply('❌ There is nothing playing in this server!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = message.guild.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return message.reply('❌ You need to be in the same voice channel as me!');
  }
  
  try {
    const paused = resolvedMusicPlayer.pausePlayback(message.guild.id);
    if (paused) {
      return message.reply('⏸️ Music paused!');
    } else {
      return message.reply('❌ Failed to pause playback!');
    }
  } catch (error) {
    console.error('Error pausing playback:', error);
    return message.reply(`❌ Error: ${error.message}`);
  }
}
