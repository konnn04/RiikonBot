import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Stop playing music and clear the queue');

export async function execute(context) {
  const { member, guild, reply, musicPlayer } = context;
  
  // Check if user is in a voice channel
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return reply('❌ You need to be in a voice channel to stop the music!');
  }
  
  // Check if bot is connected in this guild
  if (!musicPlayer.connections.has(guild.id)) {
    return reply('❌ I am not in a voice channel!');
  }
  
  // Check if user is in the same voice channel as the bot
  const botVoiceChannel = guild.members.me.voice.channel;
  if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
    return reply('❌ You need to be in the same voice channel as me!');
  }
  
  try {
    // Stop music and clear queue
    musicPlayer.stop(guild.id);
    
    // Disconnect from voice
    musicPlayer.disconnect(guild.id);
    
    return reply('🛑 Stopped the music and cleared the queue!');
  } catch (error) {
    console.error('Error stopping playback:', error);
    return reply(`❌ Error: ${error.message}`);
  }
}
