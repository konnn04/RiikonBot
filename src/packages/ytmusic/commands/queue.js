import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';

// Command configuration
export const config = {
  name: 'queue',
  description: 'Display the current music queue',
  category: 'Music'
};

// Command execution function
export async function execute(interaction, client) {
  await interaction.deferReply();
  
  const musicPlayer = client.getMusicPlayer();
  const guild = interaction.guild;
  const voiceChannel = interaction.member.voice.channel;
 
  // Check if user is in a voice channel
  if (!voiceChannel) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'You need to be in a voice channel to use this command!', TYPE.ERROR)]
    });
  }
  
  // Now safely access musicPlayer properties with additional checks
  if (!musicPlayer?.players || !musicPlayer?.players.has) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'Music player is not available.', TYPE.ERROR)]
    });
  }
  
  // Check if bot is playing in this guild
  if (!musicPlayer.players.has(guild.id)) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'I am not playing anything in this server!', TYPE.ERROR)]
    });
  }
  
  const botVoiceChannel = musicPlayer.getVoiceChannel(guild.id);
  // Check bot is in a voice channel
  if (!botVoiceChannel) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'I am not in a voice channel!', TYPE.ERROR)]
    });
  }

  // Check if there's an active queue
  if (!musicPlayer.queues.has(guild.id) || 
      musicPlayer.getQueue(guild.id).songs.length === 0) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'There are no songs in the queue!', TYPE.ERROR)]
    });
  }
  
  const queue = musicPlayer.getQueue(guild.id);
  const songs = queue.songs;
  
  return interaction.editReply({ 
    embeds: [
      Embed.showQueue(
        songs,
        queue.loop,
        queue.volume,
      )
    ]
  });
}
