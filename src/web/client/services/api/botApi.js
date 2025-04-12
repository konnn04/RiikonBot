const botApi = {
  /**
   * Get general bot information
   */
  async getBotInfo() {
    try {
      const response = await fetch('/api/bot');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bot info:', error);
      throw error;
    }
  },
  
  /**
   * Get bot statistics 
   */
  async getStats() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

export default botApi;
