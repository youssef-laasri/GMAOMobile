import { View, Text, Animated, StyleSheet } from 'react-native'
import React, { useEffect, useRef } from 'react'

const Loader = () => {
    const rotation = useRef(new Animated.Value(0)).current;


    useEffect(() => {
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 5,
                duration: 5000, // rotate every 2 seconds
                useNativeDriver: true,
            })
        ).start();
    }, [rotation]);

    const rotateInterpolate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const animatedStyle = {
        transform: [{ rotate: rotateInterpolate }],
    };
    return (
        <View style={styles.loadercontainer} >
            <Animated.Image
                source={require('../../../assets/Icons/refreshh.png')} // your image here
                style={[styles.image, animatedStyle]}
                resizeMode="contain"
            />
        </View>
    )
}

const styles = StyleSheet.create({

    image: {
        width: 65,
        height: 65,
        alignSelf: 'center'
    },
    loadercontainer: {
        flex: 1,
        justifyContent: 'center'

    }
})

export default Loader;