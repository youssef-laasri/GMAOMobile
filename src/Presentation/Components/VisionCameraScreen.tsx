import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, BackHandler } from 'react-native';
import { useCameraDevices, Camera, useCameraDevice } from 'react-native-vision-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisionCameraScreen() {
    const camera = useRef<Camera>(null);
    const { params } = useRoute();
    const navigation = useNavigation();
    const { idSection } = params;
    const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
    const [flash, setFlash] = useState<'off' | 'on'>('off');
    // Try different approaches based on the version
    let device;
    try {
        // For v3.x
        device = cameraType === 'back' ? useCameraDevice('back') : useCameraDevice('front');
    } catch (error) {
        // Fallback for v2.x
        const devices = useCameraDevices();
        const device = cameraType === 'back' ? devices.find(d => d.position === 'back') || devices[0] : devices.find(d => d.position === 'front') || devices[0];

    }
    useEffect(() => {


        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            if (currentRoute == "VisionCamera") {
                navigation.goBack();
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const takePhoto = async () => {
        if (camera.current) {
            const photo = await camera.current.takePhoto({
                flash: 'off',
            });
            navigation.goBack();
            if (idSection == 'DevisAvantTravaux') {
                navigation.navigate(screenNames.DevisAvantTravauxScreen, { idSection, photoUri: 'file://' + photo.path });
            }
            else {
                navigation.navigate(screenNames.FormulaireInterventionScreen, { idSection, photoUri: 'file://' + photo.path });
            }
        }
    };

    if (!device) return <View style={{ flex: 1, backgroundColor: 'black' }} />;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Camera
                ref={camera}
                style={{ flex: 1 }}
                device={device}
                isActive={true}
                photo={true}
                video={false}
                enableZoomGesture={true}
                enableLocation={false}
                // Main camera optimizations
                pixelFormat="yuv"
                photoQualityBalance="quality"
                videoStabilizationMode="auto"
                enableBufferCompression={false}
                enableDepthData={false}
                enablePortraitEffectsMatteDelivery={false}
                format={device?.formats.find(f =>
                    f.photoHeight >= 1920 &&
                    f.photoWidth >= 1080
                )}
            />

            {/* UI Controls */}
            <View style={styles.controls}>


                <Text></Text>

                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                    <Text style={styles.text}></Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setCameraType(prev => prev === 'back' ? 'front' : 'back')}
                >
                    <Svg width="24" height="24" viewBox="0 0 28 30">
                        <Path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z" fill={'black'} />
                    </Svg>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // captureButton: {
    //     position: 'absolute',
    //     bottom: 40,
    //     alignSelf: 'center',
    //     backgroundColor: '#fff',
    //     padding: 20,
    //     borderRadius: 40,
    // },
    captureText: {
        fontSize: 20,
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 20,
        height: 50
    },
    captureButton: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        height: 50
    },
    text: {
        fontWeight: 'bold',
        color: '#000',
    },
});