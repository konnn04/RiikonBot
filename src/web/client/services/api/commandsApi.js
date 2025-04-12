const commandsApi = {
  /**
   * Get all commands
   */
  async getAllCommands() {
    try {
      const response = await fetch('/api/commands');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching commands:', error);
      throw error;
    }
  },
  
  /**
   * Update command status (enable/disable)
   */
  async updateCommandStatus(guildId, commandName, enabled, type = 'SLASH') {
    try {
      const response = await fetch(`/api/commands/${guildId}/${commandName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, type })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating command ${commandName}:`, error);
      throw error;
    }
  }
};

export default commandsApi;
