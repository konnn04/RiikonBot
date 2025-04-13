import logger from '../../../utils/logger.js';
import { TYPE, Embed } from '../utils/embed.js';
import { EMOIJS } from '../../../constant/emoijs.js';

// Command configuration
export const config = {
  name: 'pause',
  description: 'Pause the currently playing music',
  category: 'Music'
};

// Command execution function
export async function execute(interaction, client) {
  // Defer reply since this might take a while
  await interaction.deferReply();
  
  const musicPlayer = client.getMusicPlayer();
  const guild = interaction.guild;
  const voiceChannel = interaction.member.voice.channel;
  
  // Check if user is in a voice channel
  if (!voiceChannel) {
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'You need to be in a voice channel to use this command!' + EMOIJS["5456bocchioverload"], TYPE.ERROR)]
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
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to pause music!', TYPE.ERROR)]
    });
  }
  
  try {
    const queue = musicPlayer.getQueue(guild.id);
    // Check if there are songs in the queue
    const paused = musicPlayer.pausePlayback(guild.id);
    if (paused) {
      queue.playing = false; // Update the playing status in the queue
      return interaction.editReply({
        embeds: [Embed.notify('Paused', 'Playback has been paused.', TYPE.PAUSED)]
      });
    } else {
      return interaction.editReply({
        embeds: [Embed.notify('Error', 'Playback is already paused.', TYPE.ERROR)]
      });
    }
  } catch (error) {
    logger.error('Error pausing playback:', error);
    return interaction.editReply({
      embeds: [Embed.notify('Error', 'Failed to pause playback.', TYPE.ERROR)]
    });
  }
}
