import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause the currently playing music');

export async function execute(context) {
  const { member, guild, reply, musicPlayer } = context;
  
  // Check if user is in a voice channel
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return reply('❌ You need to be in a voice channel to pause music!');
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
  
  try {
    const paused = musicPlayer.pausePlayback(guild.id);
    if (paused) {
      return reply('⏸️ Music paused!');
    } else {
      return reply('❌ Failed to pause playback!');
    }
  } catch (error) {
    console.error('Error pausing playback:', error);
    return reply(`❌ Error: ${error.message}`);
  }
}
