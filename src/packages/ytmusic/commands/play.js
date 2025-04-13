import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';

// Command configuration
export const config = {
  name: 'play',
  description: 'Play a song from YouTube',
  options: [
    {
      name: 'query',
      description: 'The song or video to play',
      type: 'STRING',
      required: true
    }
  ],
  category: 'Utility'
};

// Command execution function
export async function execute(interaction, client) {
    // Defer reply since this might take a while
    await interaction.deferReply();
    
    const musicPlayer = client.getMusicPlayer();
    const voiceChannel = interaction.member.voice.channel;
    const query = interaction.options.getString('query');
    const guild = interaction.guild;
    
    // Check if user is in a voice channel
    if (!voiceChannel) {
        return interaction.editReply({
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
        logger.error('Error checking permissions:', error);
        hasPermission = false; // Assume no permission on error
    }
  
    if (!hasPermission) {
        return interaction.editReply({
            embeds: [Embed.notify('Error', 'I need permission to connect and speak in your voice channel!', TYPE.ERROR)]
        });
    }
    
    // Check if search query is valid
    if (!query || query.trim().length === 0) {
        return interaction.editReply({
            embeds: [Embed.notify('Error', 'Please provide a URL or search query!', TYPE.ERROR)]
        });
    }

    try {
        // Send searching message
        await interaction.editReply({
            embeds: [Embed.notify('Searching', `Searching for **${query}**...`, TYPE.SEARCHING)]
        });
        
        // Verify music player is available
        if (!musicPlayer) {
            return interaction.editReply({
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
                return interaction.editReply({
                    embeds: [Embed.notify('Error', 'No valid search results found. Please try a different query.', TYPE.ERROR)]
                });
            }
        } catch (searchError) {
            logger.error('Error searching for songs:', searchError);
            return interaction.editReply({
                embeds: [Embed.notify('Error', `Error searching for songs: ${searchError.message}`, TYPE.ERROR)]
            });
        }
        
        // Double check we have valid results
        if (songs.length === 0) {
            return interaction.editReply({
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
                joinSuccess = await musicPlayer.joinChannel(voiceChannel, interaction.channel);
                if (!joinSuccess) {
                    return interaction.editReply({
                        embeds: [Embed.notify('Error', 'Could not join the voice channel.', TYPE.ERROR)]
                    });
                }
            } else {
                joinSuccess = true;
            }
        } catch (joinError) {
            logger.error('Error joining channel:', joinError);
            return interaction.editReply({
                embeds: [Embed.notify('Error', `Error joining channel: ${joinError.message}`, TYPE.ERROR)]
            });
        }
        
        if (!joinSuccess) {
            return interaction.editReply({
                embeds: [Embed.notify('Error', 'Failed to join the voice channel.', TYPE.ERROR)]
            });
        }
        
        // Add to queue with error handling
        try {
            musicPlayer.addToQueue(interaction.guild.id, song, interaction.member?.displayName);
        } catch (queueError) {
            logger.error('Error adding to queue:', queueError);
            return interaction.editReply({
                embeds: [Embed.notify('Error', `Error adding to queue: ${queueError.message}`, TYPE.ERROR)]
            });
        }
        
        // Get queue length safely
        let queueLength = 0;
        try {
            const queue = musicPlayer.getQueue(interaction.guild.id);
            if (queue && Array.isArray(queue.songs)) {
                queueLength = queue.songs.length;
            }
        } catch (queueError) {
            logger.error('Error getting queue:', queueError);
            // Continue anyway as the song was likely added
        }
        
        // Show success message
        if (queueLength > 1) {
            return interaction.editReply({
                embeds: [Embed.notify('Added to Queue', `🎵 Added **#${queueLength}** **${song.title}** (${song.duration}) to the queue!`, TYPE.INFO)]
            });
        } else {
            // First song in queue, show "Now Playing" info on next update
            return interaction.editReply({
                embeds: [Embed.notify('Playing', `▶️ Started playing **${song.title}** (${song.duration})!`, TYPE.PLAYING)]
            });
        }
    } catch (error) {
        logger.error('Error playing song:', error);
        return interaction.editReply({
            embeds: [Embed.notify('Error', `Error playing song: ${error.message}`, TYPE.ERROR)]
        });
    }
}