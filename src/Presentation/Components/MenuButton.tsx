import { View, Text, Image, StyleSheet, FlatList, ImageSourcePropType, TouchableOpacity, Alert, ScrollView, Linking, Dimensions, Platform, PermissionsAndroid, NativeModules } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { showLocation } from "react-native-map-link";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale } from '../Utils/ResponsiveUtils';
import Geolocation from '@react-native-community/geolocation';
import Loader from './loader';


export function useWindowDimensions() {
    const [dimensions, setDimensions] = useState({
        window: Dimensions.get('window'),
        screen: Dimensions.get('screen'),
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
            setDimensions({ window, screen });
        });

        return () => subscription?.remove();
    }, []);

    return dimensions;
}

export default function MenuButton() {

    const { navigate } = useNavigation();
    const { window } = useWindowDimensions();
    const isPDADelostal = window.height > 640;

    const getNbrOfDrapeaux = async () => {
        try {
            const nbr = await AsyncStorage.getItem('@nbrDrapeaux')
            setButtonData(currentTabs =>
                currentTabs.map(tab =>
                    tab.id === 5 ? { ...tab, nbrItem: Number(nbr) } : tab
                ),
            );
        } catch (error) {
            console.error('Error retrieving data:', error);
            Alert.alert('Error', 'Failed to retrieve data');
        }
    };

    const getNbrOfAlertes = async () => {
        try {
            const nbr = await AsyncStorage.getItem('@nbrAlertes')
            setButtonData(currentTabs =>
                currentTabs.map(tab =>
                    tab.id === 4 ? { ...tab, nbrItem: Number(nbr) } : tab
                ),
            );
        } catch (error) {
            console.error('Error retrieving data:', error);
            Alert.alert('Error', 'Failed to retrieve data');
        }
    };

    const getNbrOfIntervention = async () => {
        try {
            const nbr = await AsyncStorage.getItem('@nbrintervention')
            setButtonData(currentTabs =>
                currentTabs.map(tab =>
                    tab.id === 1 ? { ...tab, nbrItem: Number(nbr) } : tab
                ),
            );
        } catch (error) {
            console.error('Error retrieving data:', error);
            Alert.alert('Error', 'Failed to retrieve data');
        }
    };

    useEffect(() => {
        getNbrOfDrapeaux()
        getNbrOfAlertes()
        getNbrOfIntervention()

    }, [])
    // Paris coordinates as default
    const parisCoordinates = {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const [region, setRegion] = useState(parisCoordinates);
    const [errorMsg, setErrorMsg] = useState(null);
    const [hasLocation, setHasLocation] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);


    // Request location permission for Android
    const requestAndroidLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "This app needs access to your location to show it on the map",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };
    // Request location permission based on platform
    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization('whenInUse');
            return auth === 'granted';
        }

        if (Platform.OS === 'android') {
            return await requestAndroidLocationPermission();
        }

        return false;
    };

    // Check if location services are enabled on the device
    const checkLocationEnabled = async () => {
        if (Platform.OS === 'ios') {
            const enabled = await Geolocation.getCurrentPosition(
                () => { },
                (error) => { },
                { timeout: 100 }
            ).then(() => true)
                .catch((error) => {
                    // Error code 1 means location service disabled
                    return error.code !== 1;
                });

            return enabled;
        } else if (Platform.OS === 'android') {
            // For Android, we need to check via the native module
            return new Promise((resolve) => {
                if (NativeModules.LocationManagerModule) {
                    // If we've added a custom native module
                    NativeModules.LocationManagerModule.isLocationEnabled(enabled => {
                        resolve(enabled);
                    });
                } else {
                    // Fallback method - attempt to get location with short timeout
                    Geolocation.getCurrentPosition(
                        () => resolve(true),
                        () => resolve(false),
                        { enableHighAccuracy: false, timeout: 100, maximumAge: 0 }
                    );
                }
            });
        }

        return false;
    };

    // Open device settings to enable location
    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        }
    };
    const [isLoading, setIsLoading] = useState(false);

    // Get current location
    const getCurrentLocation = () => {
        // Set a timeout to handle slow GPS acquisition
        const locationTimeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                setErrorMsg('Location request timed out. Using default location.');
            }
        }, 10000);
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                setHasLocation(true);
                setErrorMsg(null);
                setIsLoading(false)
            },
            (error) => {

                setRegion(parisCoordinates);
                setIsLoading(false)
                setErrorMsg('Unable to get location: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };


    // Open Google Maps to display the location without navigation
    const openInMapsApp = () => {
        setIsLoading(true)
        getCurrentLocation()
        const latitude = region.latitude;
        const longitude = region.longitude;

        // Different URL schemes for Android and iOS to open Google Maps to a location
        let url;
        if (Platform.OS === 'android') {
            // Format for Android: geo:latitude,longitude?q=latitude,longitude
            url = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
        } else {
            // Format for iOS: comgooglemaps://?q=latitude,longitude
            url = `comgooglemaps://?q=${latitude},${longitude}`;

            // Check if Google Maps is installed on iOS
            Linking.canOpenURL(url).then(supported => {
                if (!supported) {
                    // If Google Maps is not installed, use Apple Maps
                    const appleMapsUrl = `http://maps.apple.com/?ll=${latitude},${longitude}`;
                    return Linking.openURL(appleMapsUrl);
                } else {
                    return Linking.openURL(url);
                }
            }).catch(err => {
                console.error('An error occurred', err);
                // Fallback to a universal maps URL that works in browser
                const browserUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                Linking.openURL(browserUrl);
            });

            return; // Exit early for iOS as we're handling the URL opening in the promise chain
        }
        // For Android, directly try to open the URL
        Linking.openURL(url).catch(err => {
            console.error('An error occurred', err);
            // Fallback to a universal maps URL that works in browser
            const browserUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            Linking.openURL(browserUrl);
        });

    };

    useEffect(() => {
        const getLocation = async () => {
            const hasPermission = await requestLocationPermission();

            if (hasPermission) {
                getCurrentLocation();
            } else {
                setErrorMsg('Location permission denied');
                // Use Paris as default
            }
        };

        getLocation();
    }, []);

    function goToScreen(screen: string) {
        switch (screen) {
            case 'PLANNING':
                navigate(screenNames.PlanningScreen)
                break;
            case 'GMAO':
                navigate(screenNames.GMAOScreen)
                break;
            case 'ASTREINTE':
                navigate(screenNames.AstreintScreen)
                break;
            case 'ALERTES':
                navigate(screenNames.AlertesScreen)
                break;
            case 'DRAPEAUX':
                navigate(screenNames.DrapeauxScreen)
                break;
            case 'CARTE':
                navigate(screenNames.MapScreen)
                break;
            case 'ADMIN':
                navigate(screenNames.AdminScreen)
                break;
            default:
                break;
        }

    }
    const [buttonData, setButtonData] = useState([
        { id: 1, title: "PLANNING", urlImage: "require('../../../assets/Icons/calendar.png')", nbrItem: 0 },
        { id: 2, title: "GMAO", urlImage: "require('../../../assets/Icons/GMAO.png')", nbrItem: 0 },
        { id: 6, title: "CARTE", urlImage: "require('../../../assets/Icons/Navigation.png')", nbrItem: 0 },
        { id: 4, title: "ALERTES", urlImage: "require('../../../assets/Icons/calendar.png')", nbrItem: 2 },
        { id: 5, title: "DRAPEAUX", urlImage: "require('../../../assets/Icons/GMAO.png')", nbrItem: 8 },
        { id: 3, title: "ASTREINTE", urlImage: "require('../../../assets/Icons/astreinte.png')", nbrItem: 0 },
        { id: 7, title: "", urlImage: "require('../../../assets/Icons/calendar.png')", nbrItem: 0 },
        { id: 8, title: "", urlImage: "require('../../../assets/Icons/GMAO.png')", nbrItem: 0 },
        { id: 9, title: "ADMIN", urlImage: "require('../../../assets/Icons/Navigation.png')", nbrItem: 0 },
    ]);
    const getImage = (name: string): ImageSourcePropType | undefined => {
        switch (name) {
            case 'PLANNING': return require('../../../assets/Icons/calendar.png');
            case 'GMAO': return require('../../../assets/Icons/GMAO.png');
            case 'ASTREINTE': return require('../../../assets/Icons/astreinte.png');
            case 'ALERTES': return require('../../../assets/Icons/alertes.png');
            case 'DRAPEAUX': return require('../../../assets/Icons/drapeaux.png');
            case 'CARTE': return require('../../../assets/Icons/map.png');
            case '': return undefined;
            case '': return undefined;
            case 'ADMIN': return require('../../../assets/Icons/admin.png');
            default: return require('../../../assets/Icons/Navigation.png');
        }
    };
    // Function to render a menu item
    const renderMenuItem = (item: any) => (
        <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => goToScreen(item.title)}>
            <View style={styles.iconContainer}>

                <Image style={styles.imageMenu}
                    source={getImage(item.title)} />
                {item.nbrItem > 0 && (<View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{item.nbrItem}</Text>
                </View>)}
            </View>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    // Function to render menu grid in rows of 3   
    const renderMenuGrid = () => {
        const rows = [];
        for (let i = 0; i < buttonData.length; i += 3) {
            const rowItems = buttonData.slice(i, i + 3);
            rows.push(
                <View key={`row-${i}`} style={isPDADelostal ? styles.menuRow : styles.menuRowPDADelosatal}>
                    {rowItems.map(item => renderMenuItem(item))}
                </View>
            );
        }
        return rows;
    };

    return (

        <ScrollView style={styles.menuContainer}>
            <View style={styles.menuGrid}>
                {renderMenuGrid()}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    imageMenu: {
        width: 45,
        height: 45,
        alignSelf: 'center'
    },
    title: {
        fontSize: moderateScale(14),
        // fontWeight: '700',
        alignSelf: 'center',
        marginTop: 6,
        fontFamily: 'Poppins-Medium'
    },
    iconContainer: {
        position: 'relative',
    },
    menuItem: {
        alignItems: 'center',
        width: '30%',
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateScale(30), // 30  35
        marginBottom: moderateScale(35),
    },
    menuRowPDADelosatal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: moderateScale(15),
        marginBottom: moderateScale(25),
    },
    menuContainer: {
        flex: 1,
        paddingTop: moderateScale(5),
        height: '10%',
    },
    menuGrid: {
        padding: 10,
    },
    tips: {
        backgroundColor: 'red',
        position: 'absolute'
    },
    notificationBadge: {
        position: 'absolute',
        right: -8,
        top: 0,
        backgroundColor: '#E53935',
        borderRadius: 12,
        minWidth: 20,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    notificationText: {
        color: 'white',
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    }
})