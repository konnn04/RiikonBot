import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'search',
  description: 'Search for a song on YouTube',
  usage: 'search <query>',
  category: 'music'
};

export async function execute(message, args, voiceChannel, musicPlayer) {
  // Check if we have a search query
  if (!args.length) {
    return message.reply({
      embeds: [Embed.notify('Error', 'Please provide a search query!', TYPE.ERROR)]
    });
  }

  const query = args.join(' ');

  try {
    // Send searching message
    const searchingMsg = await message.channel.send({
      embeds: [Embed.notify('Searching', `Searching for **${query}**...`, TYPE.SEARCHING)]
    });

    // Search for songs
    const songs = await musicPlayer.searchSongs(query, 10);
    if (!songs || !songs.length) {
      return searchingMsg.edit({
        embeds: [Embed.notify('Error', 'No results found!', TYPE.ERROR)]
      });
    }

    // Display search results
    searchingMsg.edit({
      embeds: [Embed.showSearchResults(songs, query, 30)]
    })

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
        return searchingMsg.edit({
          embeds: [Embed.notify('Error', `Invalid choice! Please provide a number between 1 and ${songs.length}.`, TYPE.ERROR)]
        });
      }

      // Delete selection message
      collected.first().delete().catch(() => { });

      // Get selected song
      const selectedSong = songs[choice - 1];

      // Check bot permissions with robust null checking
      let hasPermission = true;
      try {
        // Make sure guild.me exists
        if (message.guild.me) {
          const permissions = voiceChannel.permissionsFor(message.guild.me);
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


      // Try to join voice channel
      let joinSuccess = false;
      try {
        if (!musicPlayer.connections.has(message.guild.id)) {
          joinSuccess = await musicPlayer.joinChannel(voiceChannel, message.channel);
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
          embeds: [Embed.notify('Error', `Error joining channel: ${joinError.message}`, TYPE.ERROR)]
        });
      }

      if (!joinSuccess) {
        return searchingMsg.edit({
          embeds: [Embed.notify('Error', 'Failed to join the voice channel.', TYPE.ERROR)]
        });
      }

      // Add to queue with error handling
      try {
        musicPlayer.addToQueue(message.guild.id, selectedSong, message.member?.displayName);
      } catch (queueError) {
        console.error('Error adding to queue:', queueError);
        return searchingMsg.edit({
          embeds: [Embed.notify('Error', `Error adding to queue: ${queueError.message}`, TYPE.ERROR)]
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
        return searchingMsg.edit({
          embeds: [Embed.notify('Error', 'Failed to get the music queue.', TYPE.ERROR)]
        });
      }

      if (queueLength > 1) {
        return searchingMsg.edit({
          embeds: [Embed.notify('Added to Queue', `🎵 Added **#${queueLength}** **${selectedSong.title}** (${selectedSong.duration}) to the queue!`, TYPE.INFO)]
        });
      } else {
        searchingMsg.delete();
      }
    } catch (error) {
      // Timeout or error
      return searchingMsg.edit({
        embeds: [Embed.notify('Timeout', 'Search timed out or was canceled.', TYPE.TIMEOUT)]
      });
    }

  } catch (error) {
    console.error('Error searching for songs:', error);
    return message.reply({
      embeds: [Embed.notify('Error', `Error searching for songs: ${error.message}`, TYPE.ERROR)]
    });
  }
}
