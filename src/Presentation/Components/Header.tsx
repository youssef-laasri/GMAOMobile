import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useIntervention } from '../../Infrastructure/Contexte/InterventionContext';
import NetInfo from '@react-native-community/netinfo';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';
import { useReferentiel } from '../../Infrastructure/Contexte/ReferentielContext';

// If you have a navigation type, import it here. Otherwise, use 'any' for now.
interface HeaderProps {
    titleCom: string;
    onDeleteModeToggle?: () => void;
}

const Header = ({ titleCom, onDeleteModeToggle }: HeaderProps) => {
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
        const [isSyncing, setIsSyncing] = useState(false);
    
        // Check for active intervention
        useEffect(() => {
            const checkActiveIntervention = async () => {
                try {
                    const interventionInfo = await InterventionStateService.getCurrentInterventionInfo();
                    console.log(interventionInfo.isActive, 'isActive');
                    
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
    
    const {
        syncReferentielData,
        isOffline,
        lastSyncTime
    } = useReferentiel();
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
    async function goToMaps() {
        try {
            // Check if we're on Planning screen and get planning data
            if (titleCom === 'PLANNING') {
                await openPlanningMaps();
                return;
            }
            
            // Default behavior for other screens - use current intervention location
            const interventionState = await InterventionStateService.getInterventionState();
            
            let lat, lng;
            
            if (interventionState?.latitudeDebut && interventionState?.longitudeDebut) {
                // Use intervention start location
                lat = interventionState.latitudeDebut;
                lng = interventionState.longitudeDebut;
                console.log('Using intervention location:', lat, lng);
            } else {
                console.log('No intervention location found, will use current location');
                lat = null;
                lng = null;
            }
            
            // Try different map applications
            const mapUrls = [];
            
            if (lat && lng) {
                // Specific coordinates
                mapUrls.push(
                    `google.navigation:q=${lat},${lng}`, // Google Maps navigation
                    `comgooglemaps://?q=${lat},${lng}`, // Google Maps app
                    `maps://?q=${lat},${lng}`, // Apple Maps
                    `geo:${lat},${lng}?q=${lat},${lng}` // Generic geo URI
                );
            } else {
                // Current location
                mapUrls.push(
                    'google.navigation:q=current+location', // Google Maps current location
                    'comgooglemaps://?q=current+location', // Google Maps app current location
                    'maps://?q=current+location' // Apple Maps current location
                );
            }
            
            // Try to open maps with the first available URL
            for (const url of mapUrls) {
                try {
                    const canOpen = await Linking.canOpenURL(url);
                    if (canOpen) {
                        console.log('Opening maps with URL:', url);
                        await Linking.openURL(url);
                        return; // Success, exit the function
                    }
                } catch (urlError) {
                    console.log('URL not supported:', url, (urlError as Error).message);
                    continue; // Try next URL
                }
            }
            
            // If no specific map app works, try generic approach
            console.log('No specific map app found, trying generic approach');
            if (lat && lng) {
                await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
            } else {
                await Linking.openURL('https://www.google.com/maps');
            }
            
        } catch (error) {
            console.error('Error opening maps:', error);
            // Final fallback to web-based Google Maps
            try {
                await Linking.openURL('https://www.google.com/maps');
            } catch (fallbackError) {
                console.error('Error with final fallback:', fallbackError);
            }
        }
    }

    async function openPlanningMaps() {
        try {
            // Import the API service to get planning data
            const { apiService } = await import('../../Application/Services/apiServices');
            
            // Get planning data
            const response = await apiService.getPlanning();
            const planningData = await response.result;
            
            if (!planningData) {
                console.log('No planning data available');
                await Linking.openURL('https://www.google.com/maps');
                return;
            }
            
            // Get interventions from "jour" and "en attente" tabs
            const interventionsJour = planningData.interventionJour || [];
            const interventionsEnAttente = planningData.interventionEnAttente || [];
            
            // Combine all interventions
            const allInterventions = [...interventionsJour, ...interventionsEnAttente];
            
            if (allInterventions.length === 0) {
                console.log('No interventions found in jour/en attente tabs');
                await Linking.openURL('https://www.google.com/maps');
                return;
            }
            
            console.log(`Found ${allInterventions.length} interventions to display on map`);
            
            // Create Google Maps URL with multiple addresses
            // For multiple locations, we'll use a search query approach
            if (allInterventions.length === 1) {
                // Single intervention - direct navigation
                const intervention = allInterventions[0];
                const address = encodeURIComponent(intervention.adressImmeuble || '');
                const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
                console.log('Opening single intervention location:', url);
                await Linking.openURL(url);
            } else {
                // Multiple interventions - create a search with all addresses
                const addresses = allInterventions
                    .map(intervention => intervention.adressImmeuble)
                    .filter(address => address && address.trim() !== '')
                    .slice(0, 10); // Limit to 10 addresses to avoid URL length issues
                
                if (addresses.length > 0) {
                    // Create a search query with multiple addresses
                    const searchQuery = addresses.join(' OR ');
                    const encodedQuery = encodeURIComponent(searchQuery);
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
                    console.log('Opening multiple intervention locations:', url);
                    await Linking.openURL(url);
                } else {
                    console.log('No valid addresses found');
                    await Linking.openURL('https://www.google.com/maps');
                }
            }
            
        } catch (error) {
            console.error('Error opening planning maps:', error);
            // Fallback to general Google Maps
            try {
                await Linking.openURL('https://www.google.com/maps');
            } catch (fallbackError) {
                console.error('Error with fallback:', fallbackError);
            }
        }
    }

    function goToHome() {
        navigate(screenNames.HomeScreen);
    }
    
    function resumeIntervention() {
        navigation.navigate(screenNames.FormulaireInterventionScreen, {
            noIntervention: activeIntervention.noIntervention
        })
    }
    
    async function handleSyncReferentiel() {
        try {
            if (!isConnected) {
                console.log('Cannot sync: device is offline');
                return;
            }
            
            setIsSyncing(true);
            console.log('🔄 Starting referentiel sync...');
            await syncReferentielData();
            console.log('✅ Referentiel sync completed');
        } catch (error) {
            console.error('❌ Error syncing referentiel data:', error);
        } finally {
            setIsSyncing(false);
        }
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
                    {showTrashImage() && (<TouchableOpacity onPress={onDeleteModeToggle}>
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
                    {/* {showSyncImage() && (
                        <TouchableOpacity 
                            onPress={handleSyncReferentiel}
                            disabled={!isConnected || isSyncing}
                            style={[
                                styles.syncButton,
                                (!isConnected || isSyncing) && styles.syncButtonDisabled
                            ]}
                        >
                            <Image 
                                style={[
                                    styles.icon,
                                    (!isConnected || isSyncing) && styles.iconDisabled,
                                    isSyncing && styles.iconRotating
                                ]}
                                source={require('../../../assets/Icons/refreshh.png')} 
                            />
                        </TouchableOpacity>
                    )} */}
                </View>
            </View>
            
            {/* Sync Status Indicator */}
            {/* {showSyncImage() && lastSyncTime && (
                <View style={styles.syncStatusContainer}>
                    <Text style={styles.syncStatusText}>
                        Dernière synchronisation: {lastSyncTime}
                    </Text>
                    {isSyncing && (
                        <Text style={styles.syncingText}>
                            Synchronisation en cours...
                        </Text>
                    )}
                </View>
            )} */}
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
    syncButton: {
        opacity: 1,
    },
    syncButtonDisabled: {
        opacity: 0.5,
    },
    iconDisabled: {
        opacity: 0.5,
    },
    iconRotating: {
        transform: [{ rotate: '45deg' }],
    },
    syncStatusContainer: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    syncStatusText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    syncingText: {
        fontSize: 12,
        color: '#007AFF',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 2,
    },
})