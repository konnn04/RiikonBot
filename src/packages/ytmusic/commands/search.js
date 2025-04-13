import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';

// Command configuration
export const config = {
  name: 'search',
  description: 'Search for a song on YouTube',
  options: [
    {
      name: 'query',
      description: 'The song to search for',
      type: 'STRING',
      required: true
    }
  ],
  category: 'Music'
};

// Command execution function
export async function execute(interaction, client) {
  await interaction.deferReply();
  
  const musicPlayer = client.getMusicPlayer();
  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member.voice.channel;
  
  // Check if user is in a voice channel
  if (!voiceChannel) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'You need to be in a voice channel to play music!', TYPE.ERROR)]
    });
  }
  
  // Check if query is provided
  if (!query || query.trim().length === 0) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'Please provide a search query!', TYPE.ERROR)]
    });
  }

  try {
    // Update with searching message
    await interaction.editReply({
      embeds: [Embed.notify('Searching', `Searching for **${query}**...`, TYPE.SEARCHING)]
    });

    // Search for songs
    const songs = await musicPlayer.searchSongs(query, 25);
    if (!songs || !songs.length) {
      return interaction.editReply({
        embeds: [Embed.notify('Error', 'No results found!', TYPE.ERROR)]
      });
    }

    // Create select menu options (maximum 25 options allowed by Discord)
    const maxOptions = Math.min(songs.length, 25); // Limiting to 10 options for better UX
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('song-select')
      .setPlaceholder('Select a song')
      .addOptions(
        songs.slice(0, maxOptions).map((song, index) => 
          new StringSelectMenuOptionBuilder()
            .setLabel(`${index + 1}. ${song.title.substring(0, 80)}`) // Limit to 80 chars
            .setDescription(`${song.duration} - ${song.author || 'Unknown'}`.substring(0, 100)) // Limit to 100 chars
            .setValue(`${index}`)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Show search results with select menu
    const response = await interaction.editReply({
      embeds: [Embed.notify('Search Results', `Found ${songs.length} results for **${query}**. Select a song below:`, TYPE.INFO)],
      components: [row]
    });

    // Create collector for the select menu interaction
    const collector = response.createMessageComponentCollector({ 
      time: 30000, // 30 seconds timeout
      max: 1 // Only collect one selection
    });

    collector.on('collect', async selectInteraction => {
      if (selectInteraction.user.id !== interaction.user.id) {
        return selectInteraction.reply({ 
          content: 'You can\'t use this menu as you didn\'t invoke the command.', 
          ephemeral: true 
        });
      }

      await selectInteraction.deferUpdate();
      
      // Get selected song
      const selectedIndex = parseInt(selectInteraction.values[0]);
      const selectedSong = songs[selectedIndex];
      
      // Check bot permissions
      let hasPermission = true;
      try {
        const permissions = voiceChannel.permissionsFor(interaction.guild.me);
        if (permissions) {
          hasPermission = permissions.has('CONNECT') && permissions.has('SPEAK');
        }
      } catch (error) {
        logger.error('Error checking permissions:', error);
        hasPermission = false;
      }

      if (!hasPermission) {
        return interaction.editReply({
          embeds: [Embed.notify('Error', 'I need permission to connect and speak in your voice channel!', TYPE.ERROR)],
          components: []
        });
      }

      // Try to join voice channel
      let joinSuccess = false;
      try {
        if (!musicPlayer.connections.has(interaction.guild.id)) {
          joinSuccess = await musicPlayer.joinChannel(voiceChannel, interaction.channel);
          if (!joinSuccess) {
            return interaction.editReply({
              embeds: [Embed.notify('Error', 'Could not join the voice channel.', TYPE.ERROR)],
              components: []
            });
          }
        } else {
          joinSuccess = true;
        }
      } catch (joinError) {
        logger.error('Error joining channel:', joinError);
        return interaction.editReply({
          embeds: [Embed.notify('Error', `Error joining channel: ${joinError.message}`, TYPE.ERROR)],
          components: []
        });
      }

      // Add to queue
      try {
        musicPlayer.addToQueue(interaction.guild.id, selectedSong, interaction.member?.displayName);
      } catch (queueError) {
        logger.error('Error adding to queue:', queueError);
        return interaction.editReply({
          embeds: [Embed.notify('Error', `Error adding to queue: ${queueError.message}`, TYPE.ERROR)],
          components: []
        });
      }

      // Get queue length
      let queueLength = 0;
      try {
        const queue = musicPlayer.getQueue(interaction.guild.id);
        if (queue && Array.isArray(queue.songs)) {
          queueLength = queue.songs.length;
        }
      } catch (queueError) {
        logger.error('Error getting queue:', queueError);
      }

      // Update with success message
      if (queueLength > 1) {
        return interaction.editReply({
          embeds: [Embed.notify('Added to Queue', `🎵 Added **#${queueLength}** **${selectedSong.title}** (${selectedSong.duration}) to the queue!`, TYPE.INFO)],
          components: []
        });
      } else {
        return interaction.editReply({
          embeds: [Embed.notify('Playing', `▶️ Started playing **${selectedSong.title}** (${selectedSong.duration})!`, TYPE.PLAYING)],
          components: []
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          embeds: [Embed.notify('Timeout', 'Song selection timed out.', TYPE.TIMEOUT)],
          components: []
        });
      }
    });

  } catch (error) {
    logger.error('Error searching for songs:', error);
    return interaction.editReply({
      embeds: [Embed.notify('Error', `Error searching for songs: ${error.message}`, TYPE.ERROR)]
    });
  }
}
