import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, Alert, BackHandler, AppState, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { useNavigation } from '@react-navigation/native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../Components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SqlLIteService } from '../../Application/Services/SqlLiteService';

type LocationType = { latitude: number; longitude: number } | null;

export default function MaintenanceScreen() {
    const [title, setText] = useState('Maintenance');

    const navigation = useNavigation<any>();
    const navigate = navigation.navigate;
    const [connectionType, setConnectionType] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
    const [location, setLocation] = useState<LocationType>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial check
        checkConnection();

        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener(state => {
            updateConnectionInfo(state);
        });
        // Get initial battery level
        getBatteryInfo();

        getLocation();

        // Listen for app state changes to refresh location
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                setLoading(true);
                getLocation();
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Cleanup on unmount
        return () => {
            unsubscribe();
            subscription.remove();
        };
    }, []);

    const getLocation = async () => {

        await Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log(position.coords, 'ghdghkd');

                setLocation({ latitude, longitude });
                setLoading(false)
                // setError(null);
            },
            error => {
                setLoading(false);
                Alert.alert(
                    'Localisation désactivée',
                    "Veuillez activer la localisation de l'appareil dans les paramètres pour continuer.",
                    [
                        { text: 'OK' }
                    ]
                );
                // setError(error.message);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
    };

    const getBatteryInfo = async () => {
        try {
            // Get battery level (value between 0 and 1)
            const level = await DeviceInfo.getBatteryLevel();
            setBatteryLevel(level);
        } catch (error) {
            console.error('Failed to get battery info', error);
        }
    };

    const checkConnection = async () => {
        const state = await NetInfo.fetch();
        updateConnectionInfo(state);
    };

    const updateConnectionInfo = (state: NetInfoState) => {
        setIsConnected(state.isConnected ?? false);
        setConnectionType(state.type);
    };

    const [visibleModal, setVisibleModal] = useState(false);
    const [pwd, setPwd] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleModalClose = () => {
        setVisibleModal(false);
        setPwd(''); // Clear password when modal closes
        setShowPassword(false); // Reset password visibility
    };

    const goToLoginPage = async () => {
        if (pwd == '123456') {
            const db = await SqlLIteService.getDBConnection();
            await SqlLIteService.deleteTable(db, 'loginInfo')
            handleModalClose(); // Use the close function
            navigate(screenNames.LoginScreen);
        }
        else {
            handleModalClose(); // Use the close function
            Alert.alert("Mot de passe incorrect", "");
        }
    }
    return (
        <SafeAreaView style={styles.container}>
            <Header titleCom={title} />
            <View style={styles.InfocontainerParent}>
                {loading && (<Loader />)}
                {!loading && (<View style={styles.infoContainer}>
                    <Text>PDA n°151</Text>
                    <Text>Serveur Delostal</Text>
                    <Text>Modèle y2s</Text>
                    <Text>Appareil SM-G986B</Text>
                    <Text>Android v.13 33</Text>
                    <Text>Protocole RTHTDef-DELOSTAL-2.4.0.xml</Text>
                    <Text>Latitude {location?.latitude}</Text>
                    <Text>Longitude {location?.longitude}</Text>
                    <Text>Batterie  {batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : 'Loading...'}</Text>
                    <Text>WIFI {connectionType === 'wifi' ? 'connecté' : 'non connecté'}</Text>
                    <Text>3G/4G {connectionType === 'cellular' ? 'connecté' : 'non connecté'}</Text>
                </View>
                )}
                <TouchableOpacity style={styles.menuItem} onPress={() => setVisibleModal(true)}>
                    <View style={styles.iconContainer}>
                        <Image style={styles.imageMenu}
                            source={require('../../../assets/Icons/Deconnexion.png')} />
                    </View>
                    <Text style={styles.title}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
            <Modal
                visible={visibleModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleModalClose}
            >
                <TouchableWithoutFeedback onPress={handleModalClose}>
                    <SafeAreaView style={styles.centeredView}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalView}>
                                <View style={styles.modalTitle}>
                                    <Text style={styles.modalTitle}> Mot de passe? </Text>
                                </View>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.inputValue}
                                        placeholder="Saisir mot de passe"
                                        value={pwd}
                                        onChangeText={setPwd}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity 
                                        style={styles.eyeIconContainer}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={showPassword ? 
                                                require('../../../assets/Icons/Eye.png') : 
                                                require('../../../assets/Icons/Crossed-Eye.png')
                                            }
                                            style={styles.eyeIcon}
                                        />
                                    </TouchableOpacity>
                                </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={handleModalClose}
                            >
                                <Text style={styles.buttonText}>ANNULER</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={() => goToLoginPage()
                                }
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '100%'
    },
    InfocontainerParent: {
        flex: 1,
        justifyContent: 'space-between'
    },
    infoContainer: {
        padding: 5
    },
    menuItem: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        width: '30%',
        // position: 'absolute',
        bottom: 10,
        // left: 30,
        // borderWidth : 1
    },
    iconContainer: {
        position: 'relative',
    },
    imageMenu: {
        width: 50,
        height: 50,
        alignSelf: 'center'
    },
    title: {
        fontSize: 16,
        alignSelf: 'center',
        marginTop: 6
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 5,
        width: '90%',
        padding: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 1,
        overflow: 'hidden',
    },
    modalTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        position: 'relative',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        width: 80,
    },
    inputValue: {
        fontSize: 14,
        flex: 1,
        borderColor: '#ccc',
        borderBottomWidth: 1,
        paddingRight: 50,
        paddingVertical: 8,
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 15,
        padding: 8,
        zIndex: 1,
    },
    eyeIcon: {
        width: 22,
        height: 22,
        tintColor: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',

    },
    button: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    cancelButton: {
    },
    confirmButton: {

    },
    buttonText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    disabledOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
})