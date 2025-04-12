import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'play',
  aliases: ['p'],
  description: 'Play a song from YouTube',
  usage: 'play <URL or search query>',
  category: 'music'
};

export async function execute(message, args, client, musicPlayer) {
  const member = message.member;
  const guild = message.guild;
  const channel = message.channel;
  // Destructure the context object to get the necessary parameters
  if (!musicPlayer) {
    return message.reply({
      embeds: [Embed.notify('Error', 'Music player is not available.', TYPE.ERROR)]
    })
    ;
  }

  // Check if user is in a voice channel
  const voiceChannel = member?.voice?.channel;
  if (!voiceChannel) {
    return message.reply({
      embeds: [Embed.notify('Error', 'You need to be in a voice channel to play music!', TYPE.ERROR)]
    });
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
    return message.reply({
      embeds: [Embed.notify('Error', 'I need permission to connect and speak in your voice channel!', TYPE.ERROR)]
    });
  }
  
  // Check if we have a search query
  if (args.length === 0) {
    return message.reply({
      embeds: [Embed.notify('Error', 'Please provide a URL or search query!', TYPE.ERROR)]
    });
  }
  
  const query = args.join(' ');
  
  try {
    // Send searching message
    const searchingMsg = await channel.send({
      embeds: [Embed.notify('Searching', `Searching for **${query}**...`, TYPE.INFO)]
    });
    
    // VERIFY MUSIC PLAYER - Extra defensive checks
    if (!musicPlayer) {
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', 'Music player is not available.', TYPE.ERROR)]
      });
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
      const searchResults = await musicPlayer.searchSongs(query, 1);
      
      // Validate results thoroughly
      if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
        songs = searchResults;
      } else {
        return searchingMsg.edit({
          embeds: [Embed.notify('Error', 'No valid search results found. Please try a different query.', TYPE.ERROR)]
        });
      }
    } catch (searchError) {
      console.error('Error searching for songs:', searchError);
      return searchingMsg.edit(
        Embed.notify('Error', `❌ Error searching for songs: ${searchError.message}`, TYPE.ERROR)
      );
    }
    
    // Double check we have valid results
    if (songs.length === 0) {
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', 'No songs found for your query.', TYPE.ERROR)]
      });
    }
    
    // Get the first song and ensure it has required properties
    const song = songs[0] || defaultSong;
    if (!song.title) song.title = 'Unknown Song';
    if (!song.duration) song.duration = '0:00';
    
    // Try to join voice channel
    let joinSuccess = false;
    try {
      if (!musicPlayer.connections.has(guild.id)) {
        joinSuccess = await musicPlayer.joinChannel(voiceChannel, channel);
        if (!joinSuccess) {
          return searchingMsg.edit({
            embeds: [Embed.notify('Error', 'Could not join the voice channel.', TYPE.ERROR)]
          });
        }
      } else {
        joinSuccess = true;
      }
    } catch (joinError) {
      console.error('Error joining channel:', joinError);
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', `❌ Error joining channel: ${joinError.message}`, TYPE.ERROR)]
      });
    }
    
    if (!joinSuccess) {
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', 'Failed to join the voice channel.', TYPE.ERROR)]
      });
    }
    
    // Add to queue with error handling
    try {
      musicPlayer.addToQueue(message.guild.id, song, member?.displayName);
    } catch (queueError) {
      console.error('Error adding to queue:', queueError);
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', `❌ Error adding to queue: ${queueError.message}`, TYPE.ERROR)]
      });
    }
    
    // Get queue length safely
    let queueLength = 0;
    try {
      const queue = musicPlayer.getQueue(message.guild.id);
      if (queue && Array.isArray(queue.songs)) {
        queueLength = queue.songs.length;
      }
    } catch (queueError) {
      console.error('Error getting queue:', queueError);
      // Continue anyway as the song was likely added
    }
    
    // Show success message
    if (queueLength > 1) {
      return searchingMsg.edit({
        embeds: [Embed.notify('Added to Queue', `🎵 Added **#${queueLength}** **${song.title}** (${song.duration}) to the queue!`, TYPE.INFO)]
      });
    } else {
      searchingMsg.delete();
    }
  } catch (error) {
    console.error('Error playing song:', error);
    return message.edit({
      embeds: [Embed.notify('Error', `❌ Error playing song: ${error.message}`, TYPE.ERROR)]
    });
  }
}
