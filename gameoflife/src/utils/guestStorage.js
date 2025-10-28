/**
 * Guest Storage Manager
 * Handles all localStorage operations for guest users
 * Data persists even after browser is closed
 */

export class GuestStorageManager {
  // Storage keys
  static KEYS = {
    GUEST_ID: 'guest_id',
    GUEST_MODE: 'guest_mode',
    GUEST_PROFILE: 'guest_profile',
    GUEST_SIMULATIONS: 'guest_simulations',
    GUEST_INSIGHTS: 'guest_insights',
    SESSION_START: 'guest_session_start'
  };

  // ============ SESSION MANAGEMENT ============

  /**
   * Initialize a new guest session
   * @returns {string} Generated guest ID
   */
  static initGuestSession() {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    localStorage.setItem(this.KEYS.GUEST_ID, guestId); 
    localStorage.setItem(this.KEYS.GUEST_MODE, 'true'); 
    localStorage.setItem(this.KEYS.SESSION_START, new Date().toISOString()); 
    
    console.log('👤 Guest session initialized:', guestId);
    return guestId;
  }

  /**
   * Check if user is in guest mode
   * @returns {boolean}
   */
  static isGuest() {
    return localStorage.getItem(this.KEYS.GUEST_MODE) === 'true';
  }

  /**
   * Get current guest ID
   * @returns {string|null}
   */
  static getGuestId() {
    return localStorage.getItem(this.KEYS.GUEST_ID); 
  }

  /**
   * Get session information
   * @returns {Object}
   */
  static getSessionInfo() {
    if (!this.isGuest()) {
      return null;
    }

    return {
      guestId: this.getGuestId(),
      sessionStart: localStorage.getItem(this.KEYS.SESSION_START), // ✅ Changed
      hasProfile: this.hasProfile(),
      simulationCount: this.getSimulations().length
    };
  }

  // ============ PROFILE MANAGEMENT ============

  /**
   * Save guest profile
   * @param {Object} profileData - Profile data to save
   * @returns {boolean} Success status
   */
  static saveProfile(profileData) {
    try {
      const profile = {
        ...profileData,
        savedAt: new Date().toISOString(),
        guestId: this.getGuestId()
      };
      
      localStorage.setItem(this.KEYS.GUEST_PROFILE, JSON.stringify(profile)); // ✅ Changed
      console.log('✅ Guest profile saved:', profile);
      return true;
    } catch (error) {
      console.error('❌ Error saving guest profile:', error);
      return false;
    }
  }

  /**
   * Get guest profile
   * @returns {Object|null}
   */
  static getProfile() {
    try {
      const profile = localStorage.getItem(this.KEYS.GUEST_PROFILE); // ✅ Changed
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('❌ Error getting guest profile:', error);
      return null;
    }
  }

  /**
   * Update guest profile
   * @param {Object} updates - Fields to update
   * @returns {boolean}
   */
  static updateProfile(updates) {
    try {
      const currentProfile = this.getProfile() || {};
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.KEYS.GUEST_PROFILE, JSON.stringify(updatedProfile)); // ✅ Changed
      console.log('✅ Guest profile updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating guest profile:', error);
      return false;
    }
  }

  /**
   * Check if profile exists
   * @returns {boolean}
   */
  static hasProfile() {
    return localStorage.getItem(this.KEYS.GUEST_PROFILE) !== null; // ✅ Changed
  }

  /**
   * Clear guest profile
   */
  static clearProfile() {
    localStorage.removeItem(this.KEYS.GUEST_PROFILE); // ✅ Changed
    console.log('✅ Guest profile cleared');
  }

  // ============ SIMULATION MANAGEMENT ============

  /**
   * Save a simulation result
   * @param {Object} simulationData - Simulation data
   * @returns {boolean}
   */
  static saveSimulation(simulationData) {
    try {
      const simulations = this.getSimulations();
      
      const newSimulation = {
        id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...simulationData,
        savedAt: new Date().toISOString(),
        guestId: this.getGuestId()
      };
      
      simulations.push(newSimulation);
      localStorage.setItem(this.KEYS.GUEST_SIMULATIONS, JSON.stringify(simulations)); // ✅ Changed
      
      console.log('✅ Simulation saved:', newSimulation.id);
      return true;
    } catch (error) {
      console.error('❌ Error saving simulation:', error);
      return false;
    }
  }

  /**
   * Get all simulations
   * @returns {Array}
   */
  static getSimulations() {
    try {
      const simulations = localStorage.getItem(this.KEYS.GUEST_SIMULATIONS); // ✅ Changed
      return simulations ? JSON.parse(simulations) : [];
    } catch (error) {
      console.error('❌ Error getting simulations:', error);
      return [];
    }
  }

  /**
   * Get a specific simulation by ID
   * @param {string} simulationId
   * @returns {Object|null}
   */
  static getSimulation(simulationId) {
    const simulations = this.getSimulations();
    return simulations.find(sim => sim.id === simulationId) || null;
  }

  /**
   * Delete a simulation
   * @param {string} simulationId
   * @returns {boolean}
   */
  static deleteSimulation(simulationId) {
    try {
      const simulations = this.getSimulations();
      const filtered = simulations.filter(sim => sim.id !== simulationId);
      
      localStorage.setItem(this.KEYS.GUEST_SIMULATIONS, JSON.stringify(filtered)); // ✅ Changed
      console.log('✅ Simulation deleted:', simulationId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting simulation:', error);
      return false;
    }
  }

  /**
   * Clear all simulations
   */
  static clearSimulations() {
    localStorage.removeItem(this.KEYS.GUEST_SIMULATIONS); // ✅ Changed
    console.log('✅ All simulations cleared');
  }

  // ============ INSIGHTS MANAGEMENT ============

  /**
   * Save insights data
   * @param {Object} insightsData
   * @returns {boolean}
   */
  static saveInsights(insightsData) {
    try {
      const insights = {
        ...insightsData,
        savedAt: new Date().toISOString(),
        guestId: this.getGuestId()
      };
      
      localStorage.setItem(this.KEYS.GUEST_INSIGHTS, JSON.stringify(insights)); // ✅ Changed
      console.log('✅ Insights saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving insights:', error);
      return false;
    }
  }

  /**
   * Get insights data
   * @returns {Object|null}
   */
  static getInsights() {
    try {
      const insights = localStorage.getItem(this.KEYS.GUEST_INSIGHTS); // ✅ Changed
      return insights ? JSON.parse(insights) : null;
    } catch (error) {
      console.error('❌ Error getting insights:', error);
      return null;
    }
  }

  /**
   * Clear insights
   */
  static clearInsights() {
    localStorage.removeItem(this.KEYS.GUEST_INSIGHTS); // ✅ Changed
    console.log('✅ Insights cleared');
  }

  // ============ SESSION CLEANUP ============

  /**
   * Clear all guest data
   */
  static clearAllData() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key); // ✅ Changed
    });
    console.log('✅ All guest data cleared');
  }

  /**
   * End guest session (logout)
   */
  static endSession() {
    this.clearAllData();
    console.log('✅ Guest session ended');
  }

  // ============ DATA EXPORT ============

  /**
   * Export all guest data (for converting to registered account)
   * @returns {Object}
   */
  static exportData() {
    return {
      guestId: this.getGuestId(),
      profile: this.getProfile(),
      simulations: this.getSimulations(),
      insights: this.getInsights(),
      sessionInfo: this.getSessionInfo()
    };
  }

  /**
   * Get storage usage info
   * @returns {Object}
   */
  static getStorageInfo() {
    let totalSize = 0;
    
    Object.values(this.KEYS).forEach(key => {
      const item = localStorage.getItem(key); // ✅ Changed
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      totalKeys: Object.values(this.KEYS).filter(key => 
        localStorage.getItem(key) !== null // ✅ Changed
      ).length,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      items: {
        profile: this.hasProfile(),
        simulations: this.getSimulations().length,
        insights: this.getInsights() !== null
      }
    };
  }

  // ============ HELPER METHODS ============

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  static isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test); // ✅ Changed
      localStorage.removeItem(test); // ✅ Changed
      return true;
    } catch (error) {
      console.error('localStorage not available:', error); // ✅ Changed comment
      return false;
    }
  }

  /**
   * Debug: Log all guest data to console
   */
  static debugLog() {
    console.group('🔍 Guest Storage Debug');
    console.log('Is Guest:', this.isGuest());
    console.log('Guest ID:', this.getGuestId());
    console.log('Profile:', this.getProfile());
    console.log('Simulations:', this.getSimulations());
    console.log('Insights:', this.getInsights());
    console.log('Storage Info:', this.getStorageInfo());
    console.groupEnd();
  }
}

// Default export
export default GuestStorageManager;