import { Alert, Animated, BackHandler, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import Header from '../Components/Header';
import MenuButton from '../Components/MenuButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';


const HomeScreen = ({ navigation }) => {

    const [visible, setVisible] = useState(true);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Reset opacity when showing again
            fadeAnim.setValue(1);

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 10000, // 3 second fade-out animation
                useNativeDriver: true,
            }).start();

        }
    }, [visible, fadeAnim]);


    // Back button handling
    useEffect(() => {


        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            getData()
            console.log(navigation, ' ');

            if (currentRoute == "HomeScreen") {
                return true; // Prevent back action
            }
            else {
                // navigation.goBack();
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    // Retrieve data
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('@nbrDrapeaux');
            if (value !== null) {
                console.log('data:', value);
            } else {
                console.error('value null:', value);
            }
        } catch (error) {
            console.error('Error retrieving data:', error);
            Alert.alert('Error', 'Failed to retrieve data');
        }
    };

    const [title, setText] = useState('Accueil');
    


    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Header titleCom={title} />
                
                {/* Intervention Status Banner */}
                {/* {activeIntervention && (
                    <View style={styles.interventionBanner}>
                        <View style={styles.interventionBannerHeader}>
                            <Image
                                source={require('../../../assets/Icons/timelapse.png')}
                                style={styles.interventionBannerIcon}
                            />
                            <Text style={styles.interventionBannerTitle}>Intervention en cours</Text>
                        </View>
                        
                        <View style={styles.interventionBannerContent}>
                            <View style={styles.interventionBannerRow}>
                                <Text style={styles.interventionBannerLabel}>Intervention:</Text>
                                <Text style={styles.interventionBannerValue}>{activeIntervention.noIntervention}</Text>
                            </View>
                            
                            <View style={styles.interventionBannerRow}>
                                <Text style={styles.interventionBannerLabel}>Immeuble:</Text>
                                <Text style={styles.interventionBannerValue}>{activeIntervention.codeImmeuble}</Text>
                            </View>
                            
                            <View style={styles.interventionBannerRow}>
                                <Text style={styles.interventionBannerLabel}>Durée:</Text>
                                <Text style={styles.interventionBannerValue}>{interventionDuration}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.resumeInterventionButton}
                            onPress={() => }
                        >
                            <Text style={styles.resumeInterventionButtonText}>Reprendre l'intervention</Text>
                        </TouchableOpacity>
                    </View>
                )} */}
                
                <Image style={styles.imageWelcome}
                    source={require('../../../assets/Images/WelcomeImage.jpeg')} />
                <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
                    <Text style={styles.welcomeMsg}>Bienvenue Axeciel Axeciel</Text>
                </Animated.View>
                <MenuButton></MenuButton>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    imageWelcome: {
        width: '100%',
        height: '32%',
        resizeMode: 'stretch'
    },
    imageMenu: {
    },
    container: {
        height: '100%'
    },
    welcomeMsg: {
        color: '#495DA4',
        fontSize: 18,
        fontWeight : 'bold',
        opacity: 0.7
    },
    messageContainer: {

        position: 'absolute',
        top: '12%', // Center vertically
        left: '5%', // Center horizontally
        fontFamily: 'Poppins-Regular'
    },
    interventionBanner: {
        backgroundColor: '#E0F2F7', // Light blue background
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    interventionBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    interventionBannerIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    interventionBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#495DA4',
    },
    interventionBannerContent: {
        marginBottom: 10,
    },
    interventionBannerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    interventionBannerLabel: {
        fontSize: 14,
        color: '#555',
    },
    interventionBannerValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#495DA4',
    },
    resumeInterventionButton: {
        backgroundColor: '#495DA4',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    resumeInterventionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default HomeScreen;