import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
  PanResponderInstance,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PathData {
  path: string;
  color: string;
  strokeWidth: number;
}

const DrawOnImage = ({ imageUri = 'https://picsum.photos/800' }) => {
  // State to store all paths drawn
  const [paths, setPaths] = useState<PathData[]>([]);
  // Current path being drawn
  const [currentPath, setCurrentPath] = useState({
    path: '',
    color:'',
    strokeWidth: 8,
  });
  // Drawing color
  const [color, setColor] = useState('#FF00FF');
  // Stroke width
  const [strokeWidth, setStrokeWidth] = useState(2);

  // PanResponder for capturing touch gestures
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        // setCurrentPath(null);
        console.log('Paths start:', paths);
        const { locationX, locationY } = event.nativeEvent;
        console.log('Touch start:', locationX, locationY);
        setCurrentPath({
          path: `M${locationX},${locationY}`,
          color: color,
          strokeWidth: strokeWidth,
        });
      },
      onPanResponderMove: (event) => {
        if (currentPath) {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPath((prevPath) =>
            prevPath
              ? {
                  ...prevPath,
                  path: `${prevPath.path} L${locationX},${locationY}`,
                }
              : prevPath
          );
          console.log(currentPath,'upddddd');
          
        }
      },
      onPanResponderRelease: () => {
        console.log('Touch end');
        if (currentPath) {
          setPaths((prevPaths) => [...prevPaths, currentPath]);
        }
      },
    })
  ).current;

  // Available colors to select from
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#000000'];

  // Function to clear all drawings
  const clearDrawing = () => {
    setPaths([]);
    // setCurrentPath(null);
  };

  // Function to change stroke width
  const changeStrokeWidth = (width) => {
    setStrokeWidth(width);
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* SVG layer for drawing */}
      <Svg
        style={styles.svgLayer}
        {...panResponder.panHandlers}
      >
        {/* Render all saved paths */}
        {paths.map((item, index) => (
          <Path
            key={index}
            d={item.path}
            stroke={item.color}
            strokeWidth={item.strokeWidth}
            fill="none"
          />
        ))}
        
        {/* Render current path being drawn */}
        {currentPath && (
          <Path
            d={currentPath.path}
            stroke={currentPath.color}
            strokeWidth={currentPath.strokeWidth}
            fill="none"
          />
        )}
      </Svg>
      
      {/* Tools panel */}
      <View style={styles.toolsContainer}>
        {/* Color selector */}
        <View style={styles.colorContainer}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorOption, { backgroundColor: c }, c === color ? styles.selectedColor : null]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
        
        {/* Stroke width selector */}
        <View style={styles.strokeContainer}>
          {[2, 5, 10, 15].map((w) => (
            <TouchableOpacity
              key={w}
              style={[
                styles.strokeOption,
                { height: w, width: w * 5 },
                w === strokeWidth ? styles.selectedStroke : null
              ]}
              onPress={() => changeStrokeWidth(w)}
            />
          ))}
        </View>
        
        {/* Clear button */}
        <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  svgLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  toolsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  strokeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  strokeOption: {
    backgroundColor: '#000',
    marginHorizontal: 5,
    borderRadius: 2,
  },
  selectedStroke: {
    backgroundColor: '#555',
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DrawOnImage;