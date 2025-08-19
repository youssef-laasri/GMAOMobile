import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useIntervention } from '../../Infrastructure/Contexte/InterventionContext';
import NetInfo from '@react-native-community/netinfo';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';

// If you have a navigation type, import it here. Otherwise, use 'any' for now.
interface HeaderProps {
    titleCom: string;
}

const Header = ({ titleCom }: HeaderProps) => {
    const [isConnected, setIsConnected] = useState(true);
    React.useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
        });
        return () => unsubscribe();
    }, []);

        // Add state for intervention status
        const [activeIntervention, setActiveIntervention] = useState<any>(null);
        const [interventionDuration, setInterventionDuration] = useState<string>('');
    
        // Check for active intervention
        useEffect(() => {
            const checkActiveIntervention = async () => {
                try {
                    const interventionInfo = await InterventionStateService.getCurrentInterventionInfo();
                    if (interventionInfo?.isActive) {
                        setActiveIntervention(interventionInfo);
                        setInterventionDuration(interventionInfo.duration);
                        
                        // Update duration every second
                        const interval = setInterval(async () => {
                            const duration = await InterventionStateService.getInterventionDuration();
                            if (duration > 0) {
                                setInterventionDuration(InterventionStateService.formatDuration(duration));
                            }
                        }, 1000);
    
                        return () => clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Error checking intervention status:', error);
                }
            };
    
            checkActiveIntervention();
        }, []);
    // Use any for navigation type if you don't have a defined type
    const navigation = useNavigation<any>();
    const navigate = navigation.navigate;
    const {
        interventionData
    } = useIntervention();
    function showTrashImage() {
        switch (titleCom) {
            case 'DRAPEAUX':
                return true;
            case 'ALERTES':
                return true;

            default:
                return false;
        }
    }
    function showMapImage() {
        switch (titleCom) {
            case 'PLANNING':
                return true;
            case 'GMAO':
                return true;

            default:
                return false;
        }
    }
    function showHomeImage() {
        switch (titleCom) {
            case 'Rapport':
                return true;
            case 'Devis':
                return true;
            case 'Equipements':
                return true;

            default:
                return false;
        }
    }
    async function showTimeLapse() {
        const duration = await InterventionStateService.getInterventionDuration();
        if (duration > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    function showSyncImage() {
        switch (titleCom) {
            case 'Maintenance':
                return false;
            case 'Enregistrement':
                return false;

            default:
                return true;
        }
    }
    function goToMaps() {
        Linking.openURL('google.navigation:q=100+101')

    }

    function goToHome() {
        navigate(screenNames.HomeScreen);
    }
    function resumeIntervention() {
        navigation.navigate(screenNames.FormulaireInterventionScreen, {
            noIntervention: activeIntervention.noIntervention
        })
    }
    return (
        <View>
            {/* Offline Banner */}
            {!isConnected && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineBannerText}>
                        Vous êtes hors ligne. Les données seront synchronisées dès que possible.
                    </Text>
                </View>
            )}
            <View style={styles.container}>
                <Image style={styles.imgSociete}
                    source={require('../../../assets/Images/logoHeader.jpeg')} />

                <Text style={styles.title}>
                    {titleCom}
                </Text>
                <View style={styles.touchableIcon}>
                    {showTrashImage() && (<TouchableOpacity onPress={() => console.log(`pressed`)}>
                        <Image style={styles.icon}
                            source={require('../../../assets/Icons/trash.png')} />
                    </TouchableOpacity>)}
                    {showMapImage() && (<TouchableOpacity onPress={() => goToMaps()}>
                        <Image style={styles.icon}
                            source={require('../../../assets/Icons/map.png')} />
                    </TouchableOpacity>)}
                    {showHomeImage() && (<TouchableOpacity onPress={() => goToHome()}>
                        <Image style={styles.icon}
                            source={require('../../../assets/Icons/home.png')} />
                    </TouchableOpacity>)}
                    {interventionDuration && (<TouchableOpacity onPress={() => resumeIntervention()}>
                        <Image style={styles.icon}
                            source={require('../../../assets/Icons/timelapse.png')} />
                    </TouchableOpacity>)}
                    {showSyncImage() && (<TouchableOpacity onPress={() => console.log(`pressed`)}>
                        <Image style={styles.icon}
                            source={require('../../../assets/Icons/refreshh.png')} />
                    </TouchableOpacity>)}
                </View>
            </View>
        </View>
    )
}

export default Header;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    imgSociete: {
        width: 40,
        height: 40,
    },
    icon: {
        width: 35,
        height: 35,
        marginHorizontal: 5, // Acts as a "gap"
    },
    touchableIcon: {
        position: 'absolute',
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    title: {
        fontSize: 22,
        paddingHorizontal: 10,
        // marginTop : 5,
        fontFamily: 'Poppins-Regular',
        fontWeight: '600'
        // borderWidth : 1
    },
    offlineBanner: {
        // position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'red',
        padding: 6,
        zIndex: 10,
    },
    offlineBannerText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
    },
})