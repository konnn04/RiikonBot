const guildsApi = {
  /**
   * Get all guilds
   */
  async getAllGuilds() {
    try {
      const response = await fetch('/api/guilds');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching guilds:', error);
      throw error;
    }
  },
  
  /**
   * Get details for a specific guild
   */
  async getGuild(guildId, options = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.includeMembers !== undefined) params.append('includeMembers', options.includeMembers);
      if (options.includeRoles !== undefined) params.append('includeRoles', options.includeRoles);
      if (options.includeChannels !== undefined) params.append('includeChannels', options.includeChannels);
      if (options.memberLimit) params.append('memberLimit', options.memberLimit);
      if (options.memberOffset) params.append('memberOffset', options.memberOffset);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/guilds/${guildId}${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching guild ${guildId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update guild prefix
   */
  async updatePrefix(guildId, prefix) {
    try {
      const response = await fetch(`/api/guilds/${guildId}/prefix`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating prefix for guild ${guildId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get guild members with pagination and filtering
   */
  async getGuildMembers(guildId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);
      if (options.search) params.append('search', options.search);
      if (options.role) params.append('role', options.role);
      if (options.status) params.append('status', options.status);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/guilds/${guildId}/members${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching guild ${guildId} members:`, error);
      throw error;
    }
  }
};

export default guildsApi;
