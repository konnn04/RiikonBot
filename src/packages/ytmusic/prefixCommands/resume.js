import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'resume',
  aliases: ['unpause'],
  description: 'Resume the paused music',
  usage: 'resume',
  category: 'music'
};

// Update the function to accept a context object
export async function execute(message, args, voiceChannel, musicPlayer) {
  const member = message.member;
  const guild = message.guild;
  const channel = message.channel;
  
  // Safely access musicPlayer properties with checks
  if (!musicPlayer.players || !musicPlayer.players.has) {
    return message.reply({
      embeds: [Embed.notify('Error', 'Music player is not available.', TYPE.ERROR)]
    });
  }

  // Check if bot is playing in this guild
  if (!musicPlayer.players.has(guild.id)) {
    return message.reply({
      embeds: [Embed.notify('Error', 'I am not playing anything in this server!', TYPE.ERROR)]
    });
  }
  
  const botVoiceChannel = musicPlayer.getVoiceChannel(guild.id);
  // Check bot is in a voice channel
  if (!botVoiceChannel) {
    return message.reply({
      embeds: [Embed.notify('Error', 'I am not in a voice channel!', TYPE.ERROR)]
    });
  }
  
  // Check same voice channel
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel?.id) {
    return message.reply({
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to skip songs!', TYPE.ERROR)]
    });
  }
  
  try {
    const queue = musicPlayer.getQueue(guild.id);
    // Check if there are songs in the queue
    const resumed = musicPlayer.resumePlayback(message.guild.id);
    if (resumed) {
      queue.playing = true; // Update the playing status in the queue
      return message.reply({
        embeds: [Embed.notify('Resumed', 'Playback has been resumed.', TYPE.RESUMED)]
      });
    } else {
      return message.reply({
        embeds: [Embed.notify('Error', 'Playback is already playing.', TYPE.ERROR)]
      });
    }
  } catch (error) {
    console.error('Error resuming playback:', error);
    return message.reply({
      embeds: [Embed.notify('Error', 'Failed to resume playback.', TYPE.ERROR)]
    });
  }
}
