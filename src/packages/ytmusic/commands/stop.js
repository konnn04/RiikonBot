import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';

// Command configuration
export const config = {
  name: 'stop',
  description: 'Stop playing music and clear the queue',
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
      embeds: [Embed.notify('Error', 'You need to be in a voice channel to stop music!', TYPE.ERROR)]
    });
  }
 
  // Safely access musicPlayer properties with additional checks
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

  // Check same voice channel
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel?.id) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to stop playback!', TYPE.ERROR)]
    });
  }
  
  try {
    // Stop music and clear queue
    musicPlayer.stop(guild.id);
    
    // Disconnect from voice
    musicPlayer.disconnect(guild.id);
    
    return interaction.editReply({
      embeds: [Embed.notify('Stopped', 'Music playback has been stopped and the queue cleared.', TYPE.STOPPED)]
    });
  } catch (error) {
    logger.error('Error stopping playback:', error);
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'Failed to stop music playback.', TYPE.ERROR)]
    });
  }
}
