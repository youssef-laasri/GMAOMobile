import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';

interface PathData {
  path: string;
  color: string;
  strokeWidth: number;
  id: string;
}

interface DrawOnImageProps {
  imageUri: string;
  onSave?: (imagePath: string) => void;
  onClose?: () => void;
}

export interface DrawOnImageRef {
  getDrawnImage: () => Promise<string | null>;
  clearDrawing: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DrawOnImage = forwardRef<DrawOnImageRef, DrawOnImageProps>(({ imageUri, onSave, onClose }, ref) => {
  // Drawing state
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<PathData | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Shared values for gesture handling
  const currentDrawingColor = useSharedValue('#FF0000');
  const currentDrawingStrokeWidth = useSharedValue(3);
  const isCurrentlyDrawing = useSharedValue(false);
  const currentPathData = useSharedValue<PathData | null>(null);
  
  // Zoom and pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  // Drawing coordinates transformation
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const viewShotRef = useRef<ViewShot>(null);
  const imageRef = useRef<Image>(null);
  const currentPathRef = useRef<PathData | null>(null);
  
  // Constants for zoom limits
  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  // Available colors and stroke widths
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];
  const strokeWidths = [2, 4, 6, 8, 10];

  // Helper function to ensure we always get a valid array
  const getSafePaths = (pathsData: PathData[] | undefined | null): PathData[] => {
    return Array.isArray(pathsData) ? pathsData : [];
  };

  // Function to save completed path
  const saveCompletedPath = (pathData: PathData) => {
    console.log('Saving completed path:', pathData);
    setPaths(prev => {
      const newPaths = [...getSafePaths(prev), pathData];
      console.log('Updated paths:', newPaths);
      return newPaths;
    });
    setCurrentPath(null);
    setIsDrawing(false);
  };

  // Initialize paths as empty array if undefined
  const safePaths = getSafePaths(paths);

  // Ensure paths is always initialized as an array
  useEffect(() => {
    if (!Array.isArray(paths)) {
      setPaths([]);
    }
  }, []);

  // Transform screen coordinates to image coordinates
  const transformCoordinates = (screenX: number, screenY: number) => {
    'worklet';
    const imageX = (screenX - translateX.value) / scale.value;
    const imageY = (screenY - translateY.value) / scale.value;
    return { x: imageX, y: imageY };
  };

  // Drawing gesture handler - only for single finger drawing
  const drawingGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart((event) => {
      const { x, y } = transformCoordinates(event.x, event.y);
      const newPath: PathData = {
        path: `M${x},${y}`,
        color: currentDrawingColor.value,
        strokeWidth: currentDrawingStrokeWidth.value,
        id: Date.now().toString()
      };
      currentPathData.value = newPath;
      runOnJS(setCurrentPath)(newPath);
      runOnJS(setIsDrawing)(true);
      isCurrentlyDrawing.value = true;
    })
    .onUpdate((event) => {
      if (isCurrentlyDrawing.value && currentPathData.value) {
        const { x, y } = transformCoordinates(event.x, event.y);
        const updatedPath = {
          ...currentPathData.value,
          path: `${currentPathData.value.path} L${x},${y}`
        };
        currentPathData.value = updatedPath;
        runOnJS(setCurrentPath)(updatedPath);
      }
    })
    .onEnd(() => {
      if (isCurrentlyDrawing.value && currentPathData.value) {
        const pathToSave = currentPathData.value;
        runOnJS(saveCompletedPath)(pathToSave);
        currentPathData.value = null;
        isCurrentlyDrawing.value = false;
      }
    });

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      let newScale = savedScale.value * event.scale;
      newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
      scale.value = newScale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for moving the image - only when zoomed in and with 2+ fingers
  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow panning when zoomed in
      if (scale.value > 1) {
        const maxTranslateX = ((scale.value * containerDimensions.width) - containerDimensions.width) / 2;
        const maxTranslateY = ((scale.value * containerDimensions.height) - containerDimensions.height) / 2;

        translateX.value = Math.min(
          Math.max(savedTranslateX.value + event.translationX, -maxTranslateX),
          maxTranslateX
        );
        translateY.value = Math.min(
          Math.max(savedTranslateY.value + event.translationY, -maxTranslateY),
          maxTranslateY
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to reset zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  // Combine gestures - use race to prevent conflicts
  const combinedGestures = Gesture.Race(
    Gesture.Simultaneous(pinchGesture, panGesture),
    drawingGesture,
    doubleTapGesture
  );

  // Animated styles for the image container
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Handle image load to get dimensions
  const handleImageLoad = (event: any) => {
    const { width, height } = event.nativeEvent.source;
    setImageDimensions({ width, height });
  };

  // Handle container layout to get container dimensions
  const handleContainerLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  // Drawing utility functions
  const clearDrawing = () => {
    setPaths([]);
    setCurrentPath(null);
  };

  const undoLastDrawing = () => {
    setPaths(prev => {
      const pathsArray = getSafePaths(prev);
      return pathsArray.slice(0, -1);
    });
  };

  const changeStrokeWidth = (width: number) => {
    setSelectedStrokeWidth(width);
    currentDrawingStrokeWidth.value = width;
  };

  const changeColor = (color: string) => {
    setSelectedColor(color);
    currentDrawingColor.value = color;
  };

  // Save the image with drawings
  const saveImage = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'Unable to capture image');
        return;
      }

      const uri = viewShotRef.current ? await (viewShotRef.current as any).capture() : null;
      if (onSave && uri) {
        onSave(uri);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getDrawnImage: async () => {
      try {
        if (!viewShotRef.current) {
          return imageUri;
        }
        const uri = viewShotRef.current ? await (viewShotRef.current as any).capture() : null;
        return uri || imageUri;
      } catch (error) {
        console.error('Error getting drawn image:', error);
        return null;
      }
    },
    clearDrawing,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Dessiner sur l'image</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer} onLayout={handleContainerLayout}>
        <ViewShot ref={viewShotRef} style={styles.viewShot}>
          <GestureDetector gesture={combinedGestures}>
            <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
              <Image
                ref={imageRef}
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
              />
              
              {/* SVG layer for drawing */}
              <Svg style={styles.svgLayer}>
                {/* Render completed paths */}
                {safePaths.map((pathData) => (
                  <Path
                    key={pathData.id}
                    d={pathData.path}
                    stroke={pathData.color}
                    strokeWidth={pathData.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                
                {/* Render current path being drawn */}
                {currentPath && (
                  <Path
                    d={currentPath.path}
                    stroke={currentPath.color}
                    strokeWidth={currentPath.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
            </Animated.View>
          </GestureDetector>
        </ViewShot>
      </View>

      {/* Drawing Tools */}
      <View style={styles.toolsContainer}>
        {/* Color Picker */}
        <View style={styles.toolSection}>
          <Text style={styles.toolLabel}>Couleurs:</Text>
          <View style={styles.colorGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor
                ]}
                onPress={() => changeColor(color)}
              />
            ))}
          </View>
        </View>

        {/* Stroke Width Picker */}
        <View style={styles.toolSection}>
          <Text style={styles.toolLabel}>Taille:</Text>
          <View style={styles.strokeWidthGrid}>
            {strokeWidths.map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.strokeWidthOption,
                  selectedStrokeWidth === width && styles.selectedStrokeWidth
                ]}
                onPress={() => changeStrokeWidth(width)}
              >
                <View style={[styles.strokeLine, {
                  width: width * 2,
                  height: width,
                  backgroundColor: selectedColor
                }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={undoLastDrawing}>
            <Text style={styles.actionButtonText}>↶ Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearDrawing}>
            <Text style={styles.actionButtonText}>🗑️ Effacer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewShot: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  toolsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  toolSection: {
    marginBottom: 15,
  },
  toolLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginHorizontal: 5,
    marginVertical: 2,
    borderWidth: 2,
    borderColor: '#666',
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: '#fff',
  },
  strokeWidthGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  strokeWidthOption: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedStrokeWidth: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  strokeLine: {
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DrawOnImage;