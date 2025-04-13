import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';

// Command configuration
export const config = {
  name: 'resume',
  description: 'Resume the paused music',
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
  
  // Safely access musicPlayer properties with checks
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
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to resume playback!', TYPE.ERROR)]
    });
  }
  
  try {
    const queue = musicPlayer.getQueue(guild.id);
    // Check if there are songs in the queue
    const resumed = musicPlayer.resumePlayback(guild.id);
    if (resumed) {
      queue.playing = true; // Update the playing status in the queue
      return interaction.editReply({
        embeds: [Embed.notify('Resumed', 'Playback has been resumed.', TYPE.RESUMED)]
      });
    } else {
      return interaction.editReply({
        embeds: [Embed.notify('Error', 'Playback is already playing.', TYPE.ERROR)]
      });
    }
  } catch (error) {
    logger.error('Error resuming playback:', error);
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'Failed to resume playback.', TYPE.ERROR)]
    });
  }
}
