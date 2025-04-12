import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skip to the next song in the queue');

export async function execute(context) {
  const { member, guild, reply, musicPlayer } = context;
  
  // Check if user is in a voice channel
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return reply('❌ You need to be in a voice channel to skip songs!');
  }
  
  // Check if bot is playing in this guild
  if (!musicPlayer.players.has(guild.id)) {
    return reply('❌ There is nothing playing in this server!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = guild.members.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return reply('❌ You need to be in the same voice channel as me!');
  }
  
  // Check if there are songs in the queue
  const queue = musicPlayer.getQueue(guild.id);
  if (queue.songs.length <= 1) {
    return reply('❌ There are no more songs in the queue to skip to!');
  }
  
  try {
    const skipped = musicPlayer.skipSong(guild.id);
    if (skipped) {
      return reply('⏭️ Skipped to the next song!');
    } else {
      return reply('❌ Failed to skip the song!');
    }
  } catch (error) {
    console.error('Error skipping song:', error);
    return reply(`❌ Error: ${error.message}`);
  }
}
