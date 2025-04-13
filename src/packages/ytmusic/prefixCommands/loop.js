import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'loop',
  aliases: ['repeat', 'l'],
  description: 'Toggle loop mode for the current queue',
  usage: 'loop',
  category: 'music'
};

export async function execute(message, args, voiceChannel, musicPlayer) {
  const guild = message.guild;
  
  // Check if music player is available
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
      embeds: [Embed.notify('Error', 'You need to be in the same voice channel as me to toggle loop mode!', TYPE.ERROR)]
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
  if (!queue || !queue.songs || queue.songs.length === 0) {
    return message.reply({
      embeds: [Embed.notify('Error', 'There are no songs in the queue!', TYPE.ERROR)]
    });
  }
  
  try {
    // Toggle loop mode
    const isLoopEnabled = musicPlayer.toggleLoop(guild.id);
    
    return message.reply({
      embeds: [Embed.notify(
        'Loop Mode', 
        isLoopEnabled ? '🔁 Loop mode is now **enabled**' : '➡️ Loop mode is now **disabled**', 
        isLoopEnabled ? TYPE.SUCCESS : TYPE.INFO
      )]
    });
  } catch (error) {
    console.error('Error toggling loop mode:', error);
    return message.reply({
      embeds: [Embed.notify('Error', 'An error occurred while trying to toggle loop mode.', TYPE.ERROR)]
    });
  }
}