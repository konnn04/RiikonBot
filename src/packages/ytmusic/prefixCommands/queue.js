import { TYPE, Embed } from '../utils/embed.js';

export const config = {
  name: 'queue',
  aliases: ['q', 'list'],
  description: 'Display the current music queue',
  usage: 'queue',
  category: 'music'
};

export async function execute(message, args, voiceChannel, musicPlayer) {
  const member = message.member;
  const guild = message.guild;
  const channel = message.channel;
 
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

  // Check if there's an active queue
  if (!musicPlayer.queues.has(message.guild.id) || 
      musicPlayer.getQueue(message.guild.id).songs.length === 0) {
    return message.reply({
      embeds: [Embed.notify('Error', 'There are no songs in the queue!', TYPE.ERROR)]
    });
  }
  
  const queue = musicPlayer.getQueue(message.guild.id);
  const songs = queue.songs;
  
  return message.channel.send({ 
    embeds: [
      Embed.showQueue(
        songs,
        queue.loop,
        queue.volume,
      )
    ]
  });
}
