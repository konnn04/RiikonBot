export const config = {
  name: 'queue',
  aliases: ['q', 'list'],
  description: 'Display the current music queue',
  usage: 'queue',
  category: 'music'
};

export async function execute(message, args, client, musicPlayer) {
  // Check if musicPlayer is available
  if (!musicPlayer) {
    // Try to get music player from package manager if available
    let resolvedMusicPlayer = null;
    if (client && client.packageManager && typeof client.packageManager.getMusicPlayer === 'function') {
      resolvedMusicPlayer = client.packageManager.getMusicPlayer();
      console.log('Retrieved music player from package manager');
    } else if (client && client.musicPlayer) {
      resolvedMusicPlayer = client.musicPlayer;
      console.log('Retrieved music player from client');
    }
    
    // If still not available, inform the user
    if (!resolvedMusicPlayer) {
      return message.reply('❌ Music player is not available yet. Please try again in a few moments.');
    }
    
    // Use the resolved music player
    musicPlayer = resolvedMusicPlayer;
  }

  // Safe access to queues with checks
  if (!musicPlayer.queues || typeof musicPlayer.getQueue !== 'function') {
    return message.reply('❌ Music player is not properly initialized. Please try again later.');
  }
  
  // Check if there's an active queue
  if (!musicPlayer.queues.has(message.guild.id) || 
      musicPlayer.getQueue(message.guild.id).songs.length === 0) {
    return message.reply('❌ There are no songs in the queue!');
  }
  
  const queue = musicPlayer.getQueue(message.guild.id);
  const songs = queue.songs;
  
  // Format queue message
  let queueEmbed = {
    color: 0x0099ff,
    title: '🎵 Music Queue',
    description: `**Now Playing:**\n${songs[0].title} (${songs[0].duration})`,
    thumbnail: {
      url: songs[0].thumbnail || 'https://i.imgur.com/vvHdphW.png',
    },
    fields: [],
    footer: {
      text: `Requested by ${message.author.tag}`,
      icon_url: message.author.displayAvatarURL({ dynamic: true }),
    },
  };
  
  // Add upcoming songs if any
  if (songs.length > 1) {
    const upcomingSongs = songs.slice(1, 11).map((song, index) => 
      `${index + 1}. ${song.title} (${song.duration})`
    ).join('\n');
    
    queueEmbed.fields.push({
      name: 'Up Next:',
      value: upcomingSongs,
    });
    
    // Add total count if there are more songs
    if (songs.length > 11) {
      queueEmbed.fields.push({
        name: 'Total Songs:',
        value: `${songs.length} songs in queue`,
        inline: true,
      });
    }
  }
  
  // Add loop status
  queueEmbed.fields.push({
    name: 'Loop:',
    value: queue.loop ? '✅ Enabled' : '❌ Disabled',
    inline: true,
  });
  
  // Add volume
  queueEmbed.fields.push({
    name: 'Volume:',
    value: `${queue.volume}%`,
    inline: true,
  });
  
  return message.channel.send({ embeds: [queueEmbed] });
}
