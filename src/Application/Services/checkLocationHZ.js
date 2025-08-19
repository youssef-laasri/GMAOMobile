import Geolocation from 'react-native-geolocation-service';
import { getDistance } from 'geolib';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Class to handle location verification and comparison with buildings
 */
class LocationVerifier {
  /**
   * Create a new LocationVerifier instance
   * @param {number} defaultThreshold - Default distance threshold in meters
   */
  constructor(defaultThreshold = 50) {
    this.defaultThreshold = defaultThreshold;
    this.watchId = null;
    this.hasPermission = false;
    this.buildings = new Map(); // Map to store multiple buildings
    this.currentLocation = null;
    this.locationListeners = new Set(); // To store callback functions
  }

  /**
   * Request location permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermission() {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    });

    try {
      const result = await request(permission);
      this.hasPermission = result === RESULTS.GRANTED;
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      this.hasPermission = false;
      return false;
    }
  }

  /**
   * Add a building to the verifier
   * @param {string} id - Unique identifier for the building
   * @param {Object} location - Location object with latitude and longitude
   * @param {string} name - Name of the building
   * @param {number} [threshold] - Custom threshold for this building (in meters)
   * @returns {boolean} Whether the building was added successfully
   */
  addBuilding(id, location, name, threshold = this.defaultThreshold) {
    if (!location || !location.latitude || !location.longitude) {
      console.error('Invalid building location');
      return false;
    }

    this.buildings.set(id, {
      id,
      location,
      name,
      threshold
    });
    
    return true;
  }

  /**
   * Remove a building from the verifier
   * @param {string} id - Building ID to remove
   * @returns {boolean} Whether the building was removed
   */
  removeBuilding(id) {
    return this.buildings.delete(id);
  }

  /**
   * Get a single location update
   * @returns {Promise<Object>} Location object
   */
  getCurrentLocation() {
    return new Promise(async (resolve, reject) => {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestPermission();
        if (!permissionGranted) {
          reject(new Error('Location permission denied'));
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.currentLocation = { latitude, longitude };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      );
    });
  }

  /**
   * Start tracking location changes
   * @param {Function} [callback] - Optional callback for location updates
   * @returns {Promise<number>} Watch ID
   */
  startTracking(callback = null) {
    return new Promise(async (resolve, reject) => {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestPermission();
        if (!permissionGranted) {
          reject(new Error('Location permission denied'));
          return;
        }
      }

      // If we already have a watch going, clear it first
      if (this.watchId !== null) {
        this.stopTracking();
      }

      // Add callback to listeners if provided
      if (callback && typeof callback === 'function') {
        this.locationListeners.add(callback);
      }

      this.watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.currentLocation = { latitude, longitude };
          
          // Notify all listeners
          this.locationListeners.forEach(listener => {
            listener(this.currentLocation);
          });
        },
        (error) => {
          console.error('Error watching location:', error);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          distanceFilter: 10, // minimum distance (meters) between updates
          interval: 5000, // Android only
          fastestInterval: 2000, // Android only
        }
      );

      resolve(this.watchId);
    });
  }

  /**
   * Stop tracking location
   */
  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Add a location update listener
   * @param {Function} callback - Function to call on location update
   */
  addLocationListener(callback) {
    if (typeof callback === 'function') {
      this.locationListeners.add(callback);
    }
  }

  /**
   * Remove a location update listener
   * @param {Function} callback - Function to remove
   */
  removeLocationListener(callback) {
    this.locationListeners.delete(callback);
  }

  /**
   * Calculate distance to a specific building
   * @param {string} buildingId - Building ID
   * @param {Object} [location] - Optional location to check (uses current location if not provided)
   * @returns {Object|null} Distance information or null if building not found
   */
  getDistanceToBuilding(buildingId, location = null) {
    const building = this.buildings.get(buildingId);
    if (!building) {
      console.error(`Building with ID ${buildingId} not found`);
      return null;
    }

    const locationToCheck = location || this.currentLocation;
    if (!locationToCheck) {
      console.error('No location available to check');
      return null;
    }

    const distance = getDistance(
      locationToCheck,
      building.location
    );

    return {
      buildingId,
      buildingName: building.name,
      distance,
      isAtBuilding: distance <= building.threshold,
      threshold: building.threshold
    };
  }

  /**
   * Check if a location is at the specified building
   * @param {string} buildingId - Building ID
   * @param {Object} [location] - Optional location to check (uses current location if not provided)
   * @returns {boolean|null} Whether at building, or null if error
   */
  isAtBuilding(buildingId, location = null) {
    const result = this.getDistanceToBuilding(buildingId, location);
    return result ? result.isAtBuilding : null;
  }

  /**
   * Compare current location with all buildings
   * @param {Object} [location] - Optional location to check (uses current location if not provided)
   * @returns {Array} Array of results for each building
   */
  compareWithAllBuildings(location = null) {
    const locationToCheck = location || this.currentLocation;
    if (!locationToCheck) {
      console.error('No location available to check');
      return [];
    }

    const results = [];
    this.buildings.forEach((building) => {
      const distance = getDistance(
        locationToCheck,
        building.location
      );

      results.push({
        buildingId: building.id,
        buildingName: building.name,
        distance,
        isAtBuilding: distance <= building.threshold,
        threshold: building.threshold
      });
    });

    return results;
  }

  /**
   * Find the nearest building to the current location
   * @param {Object} [location] - Optional location to check (uses current location if not provided)
   * @returns {Object|null} Nearest building info or null if no buildings
   */
  findNearestBuilding(location = null) {
    const results = this.compareWithAllBuildings(location);
    if (results.length === 0) return null;
    
    // Sort by distance and return the closest
    results.sort((a, b) => a.distance - b.distance);
    return results[0];
  }

  /**
   * Get all buildings that the user is currently at
   * @param {Object} [location] - Optional location to check (uses current location if not provided)
   * @returns {Array} Array of buildings the user is at
   */
  getBuildingsUserIsAt(location = null) {
    const results = this.compareWithAllBuildings(location);
    return results.filter(result => result.isAtBuilding);
  }
}

export default LocationVerifier;