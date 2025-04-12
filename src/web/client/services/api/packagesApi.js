const packagesApi = {
  /**
   * Get all packages
   */
  async getAllPackages() {
    try {
      const response = await fetch('/api/packages');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  },
  
  /**
   * Update package status (enable/disable)
   */
  async updatePackageStatus(packageName, enabled) {
    try {
      const response = await fetch(`/api/packages/${packageName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating package ${packageName}:`, error);
      throw error;
    }
  },
  
  /**
   * Get package configuration
   */
  async getPackageConfig(packageName) {
    try {
      const response = await fetch(`/api/packages/${packageName}/config`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching package config for ${packageName}:`, error);
      throw error;
    }
  },
  
  /**
   * Update package configuration
   */
  async updatePackageConfig(packageName, config) {
    try {
      const response = await fetch(`/api/packages/${packageName}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating package config for ${packageName}:`, error);
      throw error;
    }
  }
};

export default packagesApi;
