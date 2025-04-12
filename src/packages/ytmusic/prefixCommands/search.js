export const config = {
  name: 'search',
  description: 'Search for a song on YouTube',
  usage: 'search <query>',
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

  // Check if we have a search query
  if (!args.length) {
    return message.reply('❌ Please provide a search query!');
  }
  
  const query = args.join(' ');
  
  try {
    // Send searching message
    const searchingMsg = await message.channel.send(`🔍 Searching for: **${query}**`);
    
    // Check if searchSongs method exists
    if (typeof musicPlayer.searchSongs !== 'function') {
      return searchingMsg.edit('❌ Music player search functionality is not available. Please try again later.');
    }
    
    // Search for songs
    const songs = await musicPlayer.searchSongs(query, 5);
    if (!songs || !songs.length) {
      return searchingMsg.edit('❌ No results found for your query!');
    }
    
    // Format search results
    const results = songs.map((song, index) => 
      `**${index + 1}.** ${song.title} (${song.duration}) by *${song.author}*`
    ).join('\n\n');
    
    // Send results
    searchingMsg.edit(`🎵 **Search Results for "${query}"**\n\n${results}\n\n⌛ Reply with the number of the song you want to play (1-${songs.length}) or wait 30 seconds to cancel.`);
    
    // Wait for user response
    try {
      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id,
        max: 1,
        time: 30000,
        errors: ['time']
      });
      
      const response = collected.first().content;
      
      // Check if response is a valid number
      const choice = parseInt(response);
      if (isNaN(choice) || choice < 1 || choice > songs.length) {
        return searchingMsg.edit('❌ Invalid selection. Search canceled.');
      }
      
      // Delete selection message
      collected.first().delete().catch(() => {});
      
      // Get selected song
      const selectedSong = songs[choice - 1];
      
      // Check if user is in a voice channel
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return searchingMsg.edit('❌ You need to be in a voice channel to play music!');
      }
      
      // Verify connections exists
      if (!musicPlayer.connections || !musicPlayer.connections.has) {
        return searchingMsg.edit('❌ Music player is not properly initialized. Please try again later.');
      }
      
      // Join voice channel if not already in one
      if (!musicPlayer.connections.has(message.guild.id)) {
        const success = await musicPlayer.joinChannel(voiceChannel, message.channel);
        if (!success) {
          return searchingMsg.edit('❌ Failed to join voice channel!');
        }
      }
      
      // Add song to queue
      musicPlayer.addToQueue(message.guild.id, selectedSong);
      
      // Update message with song info
      const queueLength = musicPlayer.getQueue(message.guild.id).songs.length;
      
      if (queueLength > 1) {
        return searchingMsg.edit(`✅ Added to queue: **${selectedSong.title}** (${selectedSong.duration})`);
      } else {
        return searchingMsg.edit(`🎵 Now playing: **${selectedSong.title}** (${selectedSong.duration})`);
      }
      
    } catch (error) {
      // Timeout or error
      return searchingMsg.edit('❌ Search timed out or was canceled.');
    }
    
  } catch (error) {
    console.error('Error searching for songs:', error);
    return message.reply(`❌ Error: ${error.message}`);
  }
}
