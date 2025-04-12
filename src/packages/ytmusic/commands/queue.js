import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Display the current music queue');

export async function execute(context) {
  const { guild, user, reply, musicPlayer } = context;
  
  // Check if there's an active queue
  if (!musicPlayer.queues.has(guild.id) || 
      musicPlayer.getQueue(guild.id).songs.length === 0) {
    return reply('❌ There are no songs in the queue!');
  }
  
  const queue = musicPlayer.getQueue(guild.id);
  const songs = queue.songs;
  
  // Format queue message using EmbedBuilder
  const queueEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('🎵 Music Queue')
    .setDescription(`**Now Playing:**\n${songs[0].title} (${songs[0].duration})`)
    .setThumbnail(songs[0].thumbnail || 'https://i.imgur.com/vvHdphW.png')
    .setFooter({ 
      text: `Requested by ${user.tag}`,
      iconURL: user.displayAvatarURL({ dynamic: true })
    });
  
  // Add upcoming songs if any
  if (songs.length > 1) {
    const upcomingSongs = songs.slice(1, 11).map((song, index) => 
      `${index + 1}. ${song.title} (${song.duration})`
    ).join('\n');
    
    queueEmbed.addFields({
      name: 'Up Next:',
      value: upcomingSongs,
    });
    
    // Add total count if there are more songs
    if (songs.length > 11) {
      queueEmbed.addFields({
        name: 'Total Songs:',
        value: `${songs.length} songs in queue`,
        inline: true,
      });
    }
  }
  
  // Add loop status
  queueEmbed.addFields({
    name: 'Loop:',
    value: queue.loop ? '✅ Enabled' : '❌ Disabled',
    inline: true,
  });
  
  // Add volume
  queueEmbed.addFields({
    name: 'Volume:',
    value: `${queue.volume}%`,
    inline: true,
  });
  
  return reply({ embeds: [queueEmbed] });
}
