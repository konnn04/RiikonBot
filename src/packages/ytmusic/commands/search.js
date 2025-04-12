import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for a song on YouTube')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('Search query for YouTube')
      .setRequired(true));

export async function execute(context) {
  const { member, guild, channel, reply, args, musicPlayer, interaction, followUp } = context;
  
  // Extract query from interaction if present, else from args
  const query = interaction?.options?.getString('query') || args.join(' ');
  
  if (!query) {
    return reply('❌ Please provide a search query!');
  }
  
  try {
    // Defer reply for slash command to have more time
    if (interaction && !interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    
    // Search for songs
    const songs = await musicPlayer.searchSongs(query, 5);
    if (!songs || !songs.length) {
      return reply('❌ No results found for your query!');
    }
    
    // Format search results
    const results = songs.map((song, index) => 
      `**${index + 1}.** ${song.title} (${song.duration}) by *${song.author}*`
    ).join('\n\n');
    
    // For slash commands, create buttons for selection
    if (interaction) {
      const row = new ActionRowBuilder()
        .addComponents(
          ...songs.slice(0, 5).map((_, i) => 
            new ButtonBuilder()
              .setCustomId(`search_select_${i}`)
              .setLabel(`${i + 1}`)
              .setStyle(ButtonStyle.Primary)
          )
        );
        
      const cancelButton = new ButtonBuilder()
        .setCustomId('search_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);
        
      row.addComponents(cancelButton);
      
      const response = await reply({ 
        content: `🎵 **Search Results for "${query}"**\n\n${results}\n\nSelect a song by clicking the buttons below:`,
        components: [row],
        fetchReply: true
      });
      
      // Create collector for button interactions
      const collector = response.createMessageComponentCollector({ 
        time: 30000, // 30 seconds timeout
        filter: i => i.user.id === member.id
      });
      
      collector.on('collect', async i => {
        await i.deferUpdate();
        
        if (i.customId === 'search_cancel') {
          collector.stop('cancelled');
          return;
        }
        
        const index = parseInt(i.customId.split('_')[2]);
        const selectedSong = songs[index];
        
        // Check if user is in voice channel
        if (!member.voice.channel) {
          await followUp('❌ You need to be in a voice channel to play music!');
          collector.stop();
          return;
        }
        
        // Join voice channel if not already in one
        if (!musicPlayer.connections.has(guild.id)) {
          const success = await musicPlayer.joinChannel(member.voice.channel, channel);
          if (!success) {
            await followUp('❌ Failed to join voice channel!');
            collector.stop();
            return;
          }
        }
        
        // Add to queue
        musicPlayer.addToQueue(guild.id, selectedSong);
        
        // Update message
        const queueLength = musicPlayer.getQueue(guild.id).songs.length;
        
        if (queueLength > 1) {
          await followUp(`✅ Added to queue: **${selectedSong.title}** (${selectedSong.duration})`);
        } else {
          await followUp(`🎵 Now playing: **${selectedSong.title}** (${selectedSong.duration})`);
        }
        
        collector.stop();
      });
      
      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          await response.edit({ 
            content: '❌ Search timed out.',
            components: [] 
          }).catch(() => {});
        } else if (reason === 'cancelled') {
          await response.edit({ 
            content: '❌ Search cancelled.',
            components: [] 
          }).catch(() => {});
        } else if (reason !== 'user') {
          await response.edit({ components: [] }).catch(() => {});
        }
      });
      
      return;
    }
    
    // For prefix commands, use the traditional message collector approach
    const searchingMsg = await reply(`🎵 **Search Results for "${query}"**\n\n${results}\n\n⌛ Reply with the number of the song you want to play (1-${songs.length}) or wait 30 seconds to cancel.`);
    
    // Wait for user response
    try {
      const collected = await channel.awaitMessages({
        filter: m => m.author.id === member.user.id,
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
      if (!member.voice.channel) {
        return searchingMsg.edit('❌ You need to be in a voice channel to play music!');
      }
      
      // Join voice channel if not already in one
      if (!musicPlayer.connections.has(guild.id)) {
        const success = await musicPlayer.joinChannel(member.voice.channel, channel);
        if (!success) {
          return searchingMsg.edit('❌ Failed to join voice channel!');
        }
      }
      
      // Add song to queue
      musicPlayer.addToQueue(guild.id, selectedSong);
      
      // Update message with song info
      const queueLength = musicPlayer.getQueue(guild.id).songs.length;
      
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
    return reply(`❌ Error: ${error.message}`);
  }
}
