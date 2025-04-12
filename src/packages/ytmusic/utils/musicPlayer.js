import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice';
import { Collection } from 'discord.js';
import ytdlpManager from './yt-dlp.js';
import { getYouTubeAPI } from './youtubei.js';
import logger from '../../../utils/logger.js';

/**
 * Manages music playback across multiple Discord servers
 */
export class MusicPlayer {
  constructor(client) {
    this.client = client;
    this.queues = new Collection(); // Server queue map
    this.players = new Collection(); // Server audio player map
    this.connections = new Collection(); // Voice connections
    this.youtubeAPI = null;
  } 

  /**
   * Initialize resources needed for music playback
   */
  async initialize() {
    try {
      // Initialize YouTube API
      this.youtubeAPI = await getYouTubeAPI();
      logger.info('Music player initialized YouTube API');
    } catch (error) {
      logger.error('Failed to initialize YouTube API:', error);
      // Don't throw here, as we'll check for API availability in each method
    }
  }

  /**
   * Get the queue for a guild, or create one if it doesn't exist
   * @param {string} guildId - Discord guild ID
   * @returns {Object} Queue for the guild
   */
  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        songs: [],
        volume: 80,
        playing: false,
        loop: false,
        textChannel: null,
      });
    }
    return this.queues.get(guildId);
  }

  /**
   * Join a voice channel and setup audio player
   * @param {VoiceChannel} voiceChannel - Discord voice channel to join
   * @param {TextChannel} textChannel - Text channel for status messages
   * @returns {boolean} Success status
   */
  async joinChannel(voiceChannel, textChannel) {
    try {
      const guildId = voiceChannel.guild.id;
      
      // Update queue with text channel
      const queue = this.getQueue(guildId);
      queue.textChannel = textChannel;
      
      // Create connection to voice channel
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true,
      });
      
      // Create audio player
      const player = createAudioPlayer();
      connection.subscribe(player);
      
      // Store the connection and player
      this.connections.set(guildId, connection);
      this.players.set(guildId, player);
      
      // Handle connection errors
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            new Promise(resolve => connection.once(VoiceConnectionStatus.Reconnecting, resolve)),
            new Promise((_, reject) => setTimeout(() => reject(), 5000))
          ]);
        } catch (error) {
          connection.destroy();
          this.clearQueue(guildId);
        }
      });
      
      // Handle player state changes
      player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guildId);
      });
      
      player.on('error', error => {
        logger.error(`Audio player error in guild ${guildId}:`, error);
        textChannel.send('❌ Error playing track: ' + error.message).catch(() => {});
        this.playNext(guildId);
      });
      
      logger.info(`Joined voice channel in guild ${guildId}`);
      return true;
    } catch (error) {
      logger.error('Error joining voice channel:', error);
      return false;
    }
  }

  /**
   * Add a song to the queue
   * @param {string} guildId - Discord guild ID
   * @param {Object} song - Song object with title, url, duration, etc.
   */
  addToQueue(guildId, song) {
    const queue = this.getQueue(guildId);
    queue.songs.push(song);
    
    // If not playing, start playback
    if (!queue.playing && queue.songs.length === 1) {
      this.playSong(guildId, song);
    }
  }

  /**
   * Play a song using yt-dlp
   * @param {string} guildId - Discord guild ID
   * @param {Object} song - Song to play
   */
  async playSong(guildId, song) {
    try {
      const queue = this.getQueue(guildId);
      const player = this.players.get(guildId);
      
      if (!player) {
        logger.error(`No audio player found for guild ${guildId}`);
        return;
      }
      
      // Get stream for the song
      const stream = await ytdlpManager.streamAudio(song.videoId);
      
      // Create Discord.js audio resource
      const resource = createAudioResource(stream, {
        inlineVolume: true,
        metadata: {
          title: song.title,
        },
      });
      
      // Set volume
      resource.volume.setVolume(queue.volume / 100);
      
      // Play the song
      player.play(resource);
      queue.playing = true;
      
      // Send now playing message
      if (queue.textChannel) {
        queue.textChannel.send(`🎵 Now playing: **${song.title}**`).catch(() => {});
      }
      
      logger.info(`Started playing "${song.title}" in guild ${guildId}`);
    } catch (error) {
      logger.error(`Error playing song in guild ${guildId}:`, error);
      
      if (queue.textChannel) {
        queue.textChannel.send(`❌ Error playing track: ${error.message}`).catch(() => {});
      }
      
      // Try to play next song
      this.playNext(guildId);
    }
  }

  /**
   * Play the next song in the queue
   * @param {string} guildId - Discord guild ID
   */
  playNext(guildId) {
    const queue = this.getQueue(guildId);
    
    if (queue.loop && queue.songs.length > 0) {
      // If loop is enabled, move current song to the end of queue
      const currentSong = queue.songs.shift();
      queue.songs.push(currentSong);
    } else {
      // Remove the first song (just played)
      queue.songs.shift();
    }
    
    // If there are more songs, play the next one
    if (queue.songs.length > 0) {
      this.playSong(guildId, queue.songs[0]);
    } else {
      // No more songs, mark as not playing
      queue.playing = false;
      
      if (queue.textChannel) {
        queue.textChannel.send('🎵 Queue ended. Add more songs to keep the party going!').catch(() => {});
      }
    }
  }

  /**
   * Pause playback
   * @param {string} guildId - Discord guild ID
   * @returns {boolean} Whether pause was successful
   */
  pausePlayback(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      return player.pause();
    }
    return false;
  }

  /**
   * Resume playback
   * @param {string} guildId - Discord guild ID
   * @returns {boolean} Whether resume was successful
   */
  resumePlayback(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      return player.unpause();
    }
    return false;
  }

  /**
   * Skip the current song
   * @param {string} guildId - Discord guild ID
   */
  skipSong(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
      return true;
    }
    return false;
  }

  /**
   * Stop playback and clear the queue
   * @param {string} guildId - Discord guild ID
   */
  stop(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
    }
    this.clearQueue(guildId);
  }

  /**
   * Clear the song queue
   * @param {string} guildId - Discord guild ID
   */
  clearQueue(guildId) {
    const queue = this.getQueue(guildId);
    queue.songs = [];
    queue.playing = false;
  }

  /**
   * Toggle loop mode
   * @param {string} guildId - Discord guild ID
   * @returns {boolean} New loop state
   */
  toggleLoop(guildId) {
    const queue = this.getQueue(guildId);
    queue.loop = !queue.loop;
    return queue.loop;
  }

  /**
   * Set volume for playback
   * @param {string} guildId - Discord guild ID
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(guildId, volume) {
    const queue = this.getQueue(guildId);
    const player = this.players.get(guildId);
    
    if (player && player.state.resource) {
      player.state.resource.volume.setVolume(volume / 100);
    }
    
    queue.volume = volume;
    return volume;
  }

  /**
   * Disconnect from voice and cleanup resources
   * @param {string} guildId - Discord guild ID
   */
  disconnect(guildId) {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }
    
    this.players.delete(guildId);
    this.clearQueue(guildId);
  }

  /**
   * Search for songs on YouTube
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Search results
   */
  async searchSongs(query, limit = 5) {
    try {
      // Ensure we have a valid YouTube API instance
      if (!this.youtubeAPI) {
        logger.warn('YouTube API not initialized, trying to initialize now');
        await this.initialize();
        
        if (!this.youtubeAPI) {
          throw new Error('YouTube API could not be initialized');
        }
      }
      
      // Check if it looks like a YouTube URL
      const isYoutubeUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i);
      
      if (isYoutubeUrl) {
        // Get info for the video
        const videoId = this.extractVideoId(query);
        if (!videoId) {
          logger.error(`Could not extract video ID from URL: ${query}`);
          // Fall back to regular search instead of failing
          return this.performRegularSearch(query, limit);
        }
        
        try {
          const info = await this.youtubeAPI.getVideoInfo(videoId);
          return [{
            title: info.basic_info.title,
            url: query,
            videoId: videoId,
            duration: this.formatDuration(info.basic_info.duration),
            thumbnail: info.basic_info.thumbnail?.[0]?.url || null,
            author: info.basic_info.author
          }];
        } catch (urlError) {
          logger.error(`Error getting video info for URL: ${query}`, urlError);
          // Fall back to regular search on error
          return this.performRegularSearch(query, limit);
        }
      } else {
        // Regular search for non-URL queries
        return this.performRegularSearch(query, limit);
      }
    } catch (error) {
      logger.error('Error searching for songs:', error);
      throw error;
    }
  }

  /**
   * Perform a regular search for music tracks
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Search results
   */
  async performRegularSearch(query, limit = 5) {
    // Double-check API is available
    if (!this.youtubeAPI) {
      throw new Error('YouTube API not available');
    }
    
    try {
      const results = await this.youtubeAPI.searchMusic(query);
      
      // Ensure results is an array
      if (!Array.isArray(results)) {
        logger.warn(`YouTube API returned non-array results: ${typeof results}`);
        return [];
      }
      
      // Filter out any invalid items and format the valid ones
      const validResults = results
        .filter(item => !!item && typeof item === 'object')
        .map(item => {
          // Ensure all properties have fallback values
          const id = item.id || '';
          const title = typeof item.title === 'string' ? item.title : 
                         (item.title ? String(item.title) : 'Unknown Title');
          const duration = item.duration && typeof item.duration === 'object' ? 
                           (item.duration.seconds || 0) : 0;
          const thumbnail = item.thumbnail && Array.isArray(item.thumbnail) && item.thumbnail[0] ? 
                            item.thumbnail[0].url : null;
          const author = item.author && typeof item.author === 'object' ? 
                         (item.author.name || 'Unknown') : 'Unknown';
          
          return {
            title,
            url: `https://www.youtube.com/watch?v=${id}`,
            videoId: id,
            duration: this.formatDuration(duration),
            thumbnail,
            author
          };
        })
        .filter(item => item.videoId); // Only keep items with a valid videoId
      
      return validResults.slice(0, limit);
    } catch (error) {
      logger.error(`Error in performRegularSearch: ${error.message}`, error);
      // Return empty array instead of throwing to allow for more graceful failure
      return [];
    }
  }

  /**
   * Format duration in seconds to MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds) return 'Unknown';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null if not found
   */
  extractVideoId(url) {
    if (!url) return null;
    
    // Match common YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i, // Standard URLs
      /^([a-zA-Z0-9_-]{11})$/ // Direct video IDs
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  /**
   * Clean up all connections when shutting down
   */
  async cleanup() {
    // Disconnect from all voice channels
    for (const [guildId, connection] of this.connections) {
      connection.destroy();
      logger.info(`Disconnected from voice in guild ${guildId}`);
    }
    
    this.connections.clear();
    this.players.clear();
    this.queues.clear();
  }
}
