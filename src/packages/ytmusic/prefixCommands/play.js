export const config = {
  name: 'play',
  aliases: ['p'],
  description: 'Play a song from YouTube',
  usage: 'play <URL or search query>',
  category: 'music'
};

export async function execute(context) {
  // Destructure the context object to get the necessary parameters
  const { message, member, guild, channel, reply, args, client, musicPlayer } = context;
  
  // Early check if musicPlayer is available
  let resolvedMusicPlayer = musicPlayer;
  if (!resolvedMusicPlayer) {
    // Try to get music player from package manager if available
    if (client && client.packageManager && typeof client.packageManager.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.packageManager.getMusicPlayer();
      console.log('Retrieved music player from package manager');
    } else if (client && client.musicPlayer) {
      resolvedMusicPlayer = client.musicPlayer;
      console.log('Retrieved music player from client');
    }
    
    // If still not available, inform the user
    if (!resolvedMusicPlayer) {
      return reply('❌ Music player is not available yet. Please try again in a few moments.');
    }
  }

  // Check if user is in a voice channel
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return reply('❌ You need to be in a voice channel to play music!');
  }
  
  // Check bot permissions with robust null checking
  let hasPermission = true;
  try {
    // Make sure guild.me exists
    if (guild.me) {
      const permissions = voiceChannel.permissionsFor(guild.me);
      // Only check .has() if permissions is not null
      if (permissions) {
        hasPermission = permissions.has('CONNECT') && permissions.has('SPEAK');
      }
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
    hasPermission = false; // Assume no permission on error
  }
  
  if (!hasPermission) {
    return reply('❌ I need permission to join and speak in your voice channel!');
  }
  
  // Check if we have a search query
  if (!args || !args.length) {
    return reply('❌ Please provide a song URL or search query!');
  }
  
  const query = args.join(' ');
  
  try {
    // Send searching message
    const searchingMsg = await channel.send(`🔍 Searching for: **${query}**`);
    
    // VERIFY MUSIC PLAYER - Extra defensive checks
    if (!resolvedMusicPlayer) {
      return searchingMsg.edit('❌ Music player is not available. Please try again later.');
    }
    
    // Verify required properties and methods on the musicPlayer object
    // Separate verification for properties and methods
    const requiredProperties = ['connections', 'queues', 'players'];
    const requiredMethods = ['searchSongs', 'joinChannel', 'addToQueue', 'getQueue'];
    
    // Check properties
    for (const prop of requiredProperties) {
      if (!(prop in resolvedMusicPlayer)) {
        return searchingMsg.edit(`❌ Music player is missing required property: ${prop}. Please try again later.`);
      }
    }
    
    // Check methods
    for (const method of requiredMethods) {
      if (typeof resolvedMusicPlayer[method] !== 'function') {
        return searchingMsg.edit(`❌ Music player is missing required method: ${method}. Please try again later.`);
      }
    }
    
    // Create default song in case search fails
    const defaultSong = {
      title: 'Unknown Song',
      duration: '0:00',
      url: query,
      thumbnail: null,
      videoId: null
    };
    
    // Search with maximum error protection
    let songs = [];
    try {
      const searchResults = await resolvedMusicPlayer.searchSongs(query, 1);
      
      // Validate results thoroughly
      if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
        songs = searchResults;
      } else {
        return searchingMsg.edit('❌ No results found for your query. The YouTube search service might be experiencing issues.');
      }
    } catch (searchError) {
      console.error('Error searching for songs:', searchError);
      return searchingMsg.edit(`❌ Error searching: ${searchError.message || 'YouTube search failed'}`);
    }
    
    // Double check we have valid results
    if (songs.length === 0) {
      return searchingMsg.edit('❌ No valid search results found. Please try a different query or try again later.');
    }
    
    // Get the first song and ensure it has required properties
    const song = songs[0] || defaultSong;
    if (!song.title) song.title = 'Unknown Song';
    if (!song.duration) song.duration = '0:00';
    
    // Try to join voice channel
    let joinSuccess = false;
    try {
      if (!resolvedMusicPlayer.connections.has(guild.id)) {
        joinSuccess = await resolvedMusicPlayer.joinChannel(voiceChannel, channel);
        if (!joinSuccess) {
          return searchingMsg.edit('❌ Failed to join voice channel!');
        }
      } else {
        joinSuccess = true;
      }
    } catch (joinError) {
      console.error('Error joining channel:', joinError);
      return searchingMsg.edit(`❌ Error joining voice channel: ${joinError.message}`);
    }
    
    if (!joinSuccess) {
      return searchingMsg.edit('❌ Couldn\'t connect to voice channel for an unknown reason.');
    }
    
    // Add to queue with error handling
    try {
      resolvedMusicPlayer.addToQueue(guild.id, song);
    } catch (queueError) {
      console.error('Error adding to queue:', queueError);
      return searchingMsg.edit(`❌ Error adding song to queue: ${queueError.message}`);
    }
    
    // Get queue length safely
    let queueLength = 0;
    try {
      const queue = resolvedMusicPlayer.getQueue(guild.id);
      if (queue && Array.isArray(queue.songs)) {
        queueLength = queue.songs.length;
      }
    } catch (queueError) {
      console.error('Error getting queue:', queueError);
      // Continue anyway as the song was likely added
    }
    
    // Show success message
    if (queueLength > 1) {
      return searchingMsg.edit(`✅ Added to queue: **${song.title}** (${song.duration})`);
    } else {
      return searchingMsg.edit(`🎵 Now playing: **${song.title}** (${song.duration})`);
    }
  } catch (error) {
    console.error('Error playing song:', error);
    return reply(`❌ Error: ${error.message || 'Unknown error'}`);
  }
}
