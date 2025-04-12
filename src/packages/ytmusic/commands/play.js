import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Play a song from YouTube')
  .addStringOption(option =>
    option.setName('query')
      .setDescription('Song URL or search query')
      .setRequired(true));

export async function execute(context) {
  const { member, guild, channel, reply, args, musicPlayer, interaction } = context;
  
  // Extract query from interaction if present, else from args
  const query = interaction?.options?.getString('query') || args.join(' ');
  
  // Check if user is in a voice channel
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return reply('❌ You need to be in a voice channel to play music!');
  }
  
  // Check bot permissions
  const permissions = voiceChannel.permissionsFor(guild.members.me);
  if (!permissions.has('Connect') || !permissions.has('Speak')) {
    return reply('❌ I need permission to join and speak in your voice channel!');
  }
  
  try {
    // Send searching message
    const searchingMessage = await reply(`🔍 Searching for: **${query}**`);
    
    // Search for song
    const songs = await musicPlayer.searchSongs(query, 1);
    if (!songs || !songs.length) {
      return interaction ? 
        reply('❌ No results found for your query!') : 
        searchingMessage.edit('❌ No results found for your query!');
    }
    
    const song = songs[0];
    
    // Join voice channel if not already in one
    if (!musicPlayer.connections.has(guild.id)) {
      const success = await musicPlayer.joinChannel(voiceChannel, channel);
      if (!success) {
        return interaction ? 
          reply('❌ Failed to join voice channel!') : 
          searchingMessage.edit('❌ Failed to join voice channel!');
      }
    }
    
    // Add song to queue
    musicPlayer.addToQueue(guild.id, song);
    
    // Update message with song info
    const queueLength = musicPlayer.getQueue(guild.id).songs.length;
    
    if (queueLength > 1) {
      return interaction ? 
        reply(`✅ Added to queue: **${song.title}** (${song.duration})`) : 
        searchingMessage.edit(`✅ Added to queue: **${song.title}** (${song.duration})`);
    } else {
      return interaction ? 
        reply(`🎵 Now playing: **${song.title}** (${song.duration})`) : 
        searchingMessage.edit(`🎵 Now playing: **${song.title}** (${song.duration})`);
    }
  } catch (error) {
    console.error('Error playing song:', error);
    return reply(`❌ Error: ${error.message}`);
  }
}
