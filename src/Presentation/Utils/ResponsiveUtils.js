// ResponsiveUtils.js
import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useEffect, useState } from 'react';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (design reference - typically based on design mockups)
const BASE_WIDTH = 412; // Galaxy S10 logical width in dp
const BASE_HEIGHT = 869; // Galaxy S10 logical height in dp

/**
 * Scale a width dimension based on screen width
 * @param {number} size - The size to scale
 * @returns {number} The scaled width value
 */
export const widthPercentageToDP = (widthPercent) => {
  // Convert string input to number if needed
  const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

/**
 * Scale a height dimension based on screen height
 * @param {number} size - The size to scale
 * @returns {number} The scaled height value
 */
export const heightPercentageToDP = (heightPercent) => {
  // Convert string input to number if needed
  const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

/**
 * Scale sizes based on screen width
 * @param {number} size - The size to scale
 * @returns {number} The scaled size
 */
export const scale = (size) => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale vertical sizes based on screen height
 * @param {number} size - The size to scale
 * @returns {number} The scaled size
 */
export const verticalScale = (size) => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale sizes with a factor less than 1
 * @param {number} size - The size to scale
 * @param {number} factor - The factor to scale with
 * @returns {number} The scaled size
 */
export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

/**
 * Get current screen orientation
 * @returns {string} 'portrait' or 'landscape'
 */
export const getOrientation = () => {
  return SCREEN_WIDTH < SCREEN_HEIGHT ? 'portrait' : 'landscape';
};

/**
 * Custom hook to handle screen orientation changes
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation(width < height ? 'portrait' : 'landscape');
    };

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Clean up listener
    return () => {
      // For React Native versions >= 0.65
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // For older React Native versions
        Dimensions.removeEventListener('change', updateOrientation);
      }
    };
  }, []);

  return orientation;
};

/**
 * Custom hook to get dimensions and update when they change
 */
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get('window'),
    screen: Dimensions.get('screen')
  });

  useEffect(() => {
    const onChange = ({ window, screen }) => {
      setDimensions({ window, screen });
    };

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', onChange);

    // Clean up listener
    return () => {
      // For React Native versions >= 0.65
      if (subscription?.remove) {
        subscription.remove();
      } else {
        // For older React Native versions
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  return dimensions;
};

/**
 * Device size categories
 */
export const DeviceSize = {
  isSmallDevice: SCREEN_WIDTH < 360,
  isMediumDevice: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 400,
  isLargeDevice: SCREEN_WIDTH >= 400
};