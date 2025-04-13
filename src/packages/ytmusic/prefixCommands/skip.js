import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'skip',
  aliases: ['s', 'next'],
  description: 'Skip to the next song in the queue',
  usage: 'skip',
  category: 'music'
};

export async function execute(message, args, voiceChannel, musicPlayer) {
  const guild = message.guild;
 
  // Now safely access musicPlayer properties with additional checks
  if (!musicPlayer?.players || !musicPlayer?.players.has) {
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
  
  // Safely get queue with checks
  let queue;
  try {
    queue = musicPlayer.getQueue(guild.id);
  } catch (error) {
    console.error('Error getting queue:', error);
    return message.reply({
      embeds: [Embed.notify('Error', 'Failed to get the music queue.', TYPE.ERROR)]
    });
  }
  
  // Check if there are songs in the queue
  if (!queue || !queue.songs || queue.songs.length <= 1) {
    return message.reply({
      embeds: [Embed.notify('Error', 'There are no songs to skip!', TYPE.ERROR)]
    });
  }
  
  try {
    const skipped = musicPlayer.skipSong(message.guild.id);
    if (skipped) {
      return message.reply({
        embeds: [Embed.notify('Success', 'Skipped the current song!', TYPE.SUCCESS)]
      });
    } else {
      return message.reply({
        embeds: [Embed.notify('Error', 'Failed to skip the song.', TYPE.ERROR)]
      });
    }
  } catch (error) {
    console.error('Error skipping song:', error);
    return message.reply({
      embeds: [Embed.notify('Error', 'An error occurred while trying to skip the song.', TYPE.ERROR)]
    });
  }
}
