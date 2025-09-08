import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, BackHandler, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from './Header';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoriqueModal from './HistoriqueModal';
import DebutInterventionModal from './DebutInterventionModal';
import { apiService } from '../../Application/Services/apiServices';
import { DetailInterventionDTOOutput } from '../../Application/ApiCalls';
import { SqlLIteService } from '../../Application/Services/SqlLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import Loader from './loader';
import { useIntervention } from '../../Infrastructure/Contexte/InterventionContext';
import Geolocation from '@react-native-community/geolocation';
import LocationVerifier from '../../Application/Services/checkLocationHZ';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';

interface DetailInterventionProps {
    route: {
        params: {
            noInterventionParam?: string;
            codeImmeuble?: string;
        };
    };
    navigation: any;
}

const DetailIntervention = ({ route, navigation }: DetailInterventionProps) => {

    // get the params
    const { noInterventionParam } = route.params
    const { codeImmeuble } = route.params

    const [title, setText] = useState('Détail');

    const [infoInter, setInfoInter] = useState<any>(null)
    // const [isLoading, setIsLoading] = useState(true);
    const [compo, setcompo] = useState('intervention')
    const { navigate } = useNavigation();
    const [loading, setLoading] = useState(true);
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [selectedDebutDateTime, setSelectedDebutDateTime] = useState<Date | null>(null);
    const {
        updateInterventionData
    } = useIntervention();

    // Log when selectedDebutDateTime changes
    useEffect(() => {
        if (selectedDebutDateTime) {
            console.log('📅 selectedDebutDateTime updated:', selectedDebutDateTime);
            console.log('📅 Formatted selectedDebutDateTime:', selectedDebutDateTime.toLocaleString('fr-FR'));
        }
    }, [selectedDebutDateTime]);
    useEffect(() => {
        if (noInterventionParam != undefined && noInterventionParam != '') {
            setcompo('intervention')
            const fetchDetailIntervention = async (noInter) => {
                try {
                    const response = await apiService.getInterventionDetail(noInter);
                    const json = await response.result;


                    updateInterventionData(json);
                    // Extract header information (using the first building info as header)
                    const headerInfo = {
                        noIntervention: json?.infos_Intervention![0].__NoIntervention,
                        title: json?.infos_Immeuble?.[0]?.code || "Unknown",
                        address: `${json?.infos_Immeuble?.[0]?.adresse || ""} ${json?.infos_Immeuble?.[0]?.cp || ""} ${json?.infos_Immeuble?.[0]?.ville || ""}`.trim()
                    };

                    const processedData = {
                        header: headerInfo,
                        sections: []
                    };
                    setLatitude(json?.infos_Immeuble![0].__Latitude!)
                    setLongitude(json?.infos_Immeuble![0].__Longitude!)
                    // Process each section in the data
                    Object.keys(json!).forEach(sectionKey => {
                        if (sectionKey.startsWith('__')) return;
                        if (Array.isArray(json[sectionKey]) && json[sectionKey].length > 0) {
                            const sectionData = json[sectionKey][0];

                            // Create a filtered version of sectionData without __ prefix keys
                            const filteredSectionData = {};
                            Object.entries(sectionData).forEach(([key, value]) => {
                                if (!key.startsWith('__') && key  != 'vingtquatre') {
                                    filteredSectionData[key] = value;
                                }
                                if (key  == 'vingtquatre') {
    
                                    
                                    filteredSectionData['24H'] = value;
                                }
                            });
                            // Check if section object has any non-empty values
                            const hasNonEmptyValues = Object.values(sectionData).some(value => {
                                if (typeof value === 'string') return value.trim() !== '';
                                if (typeof value === 'number') return true;
                                return value !== null && value !== undefined;
                            });

                            if (hasNonEmptyValues) {
                                processedData.sections.push({
                                    title: sectionKey,
                                    params: filteredSectionData
                                });
                            }
                        }
                    });
                    setInfoInter(processedData);
                    setLoading(false);
                } catch (err) {
                    // setError('Failed to fetch data');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetailIntervention(noInterventionParam)
        }
        if (codeImmeuble != undefined && codeImmeuble != '') {
            setcompo('detailImmeuble');
            const fetchDetailImmeuble = async (codeImmeuble) => {
                try {
                    const db = await SqlLIteService.getDBConnection();
                    let immeuble = await SqlLIteService.getImmeublesWhere(db, 'code', codeImmeuble);

                    const json = immeuble;

                    // Extract header information (using the first building info as header)
                    const headerInfo = {
                        noIntervention: "",
                        title: json![0].code,
                        address: `${json![0].adresse || ""} ${json![0].cp || ""} ${json![0].ville || ""}`.trim()

                    };
                    const processedData = {
                        header: headerInfo,
                        sections: []
                    };

                    // Process each section in the data
                    Object.keys(json!).forEach(sectionKey => {
                        const sectionData = immeuble[0];
                        console.log(sectionData);


                        // Create a filtered version of sectionData without __ prefix keys
                        const filteredSectionData = {};
                        Object.entries(sectionData).forEach(([key, value]) => {
                            if (!key.startsWith('__') && key  != 'vingtquatre') {
                                filteredSectionData[key] = value;
                            }
                            if (key  == 'vingtquatre') {

                                
                                filteredSectionData['24H'] = value;
                            }
                        });
                        // Check if section object has any non-empty values
                        // const hasNonEmptyValues = Object.values(sectionData).some(value => {
                        //     if (typeof value === 'string') return value.trim() !== '';
                        //     if (typeof value === 'number') return true;
                        //     return value !== null && value !== undefined;
                        // });

                        // if (hasNonEmptyValues) {
                        processedData.sections.push({
                            title: "Détail immeubles",
                            params: filteredSectionData
                        });
                        // }

                    });
                    setInfoInter(processedData);
                    setLoading(false);
                } catch (err) {
                    // setError('Failed to fetch data');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetailImmeuble(codeImmeuble)
        }
    }, [])

    // Function to check if a value should be displayed
    const isDisplayableValue = (value) => {
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return true;
        return value !== null && value !== undefined;
    };

    // Format field name for display
    const formatFieldName = (name) => {
        // Remove leading underscore characters
        let formattedName = name.replace(/^__/, '');
        // Replace underscores with spaces
        formattedName = formattedName.replace(/_/g, ' ');
        // Capitalize first letter
        return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    };

    // Format field value for display
    const formatFieldValue = (value) => {
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
        return value || '';
    };

    // Function to render a parameter row
    const renderParameter = (key, value) => {
        if (!isDisplayableValue(value)) return null;

        const isPhoneField = key.toLowerCase().startsWith('tel');
        const phoneNumber = isPhoneField ? formatFieldValue(value) : null;

        return (
            <View key={key} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{formatFieldName(key)} : </Text>
                <Text style={styles.infoValue}>{formatFieldValue(value)}</Text>
                {isPhoneField && phoneNumber && (
                    <TouchableOpacity 
                        style={styles.phoneIconContainer}
                        onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
                    >
                        <Image 
                            source={require('../../../assets/Icons/phone.png')} 
                            style={styles.phoneIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Function to render a section
    const renderSection = (section, index) => {
        if (!section.params) return null;

        return (
            <View key={index} style={styles.section}>
                {/* Section Title */}
                <Text style={styles.sectionTitle}>{formatFieldName(section.title)}</Text>

                {/* Section Parameters */}
                <View style={styles.sectionContent}>
                    {Object.entries(section.params).map(([key, value]) =>
                        renderParameter(key, value)
                    )}
                </View>
            </View>
        );
    };
    const [modalHistoInterventionVisible, setmodalHistoInterventionVisible] = useState(false);
    const [modalHistoDevisVisible, setmodalHistoDevisVisible] = useState(false);
    const [modalDebutIntervenion, setModalDebutIntervention] = useState(false);
    function goToMaps() {
        Linking.openURL(`google.navigation:q=${latitude},${longitude}`)

    }
    const handlePress = () => {
        Linking.openURL("tel:0639883013"); // Replace with actual phone number
    };
    const [codeImmeubleAddresse, setcodeImmeubleAddress] = useState('')
    const handleConfirmIntervention = async (date: Date) => {
        // Set the selected date and time from the modal
        console.log(date, 'date');
        
        setSelectedDebutDateTime(date);
        setModalDebutIntervention(false);
        
        console.log('📅 Selected date/time from modal:', date);
        console.log('📅 Formatted date:', date.toLocaleString('fr-FR'));
        console.log('📅 ISO string:', date.toISOString());
        
        try {
            // Capture current location
            const locationVerifier = new LocationVerifier();
            const currentLocation = await locationVerifier.getCurrentLocation();
            
            // Get building information
            const buildingLat = parseFloat(latitude);
            const buildingLon = parseFloat(longitude);
            let isAtBuilding = false;
            
            if (buildingLat && buildingLon) {
                // Add building to location verifier
                locationVerifier.addBuilding(
                    'current_building',
                    {
                        latitude: buildingLat,
                        longitude: buildingLon
                    },
                    infoInter?.header?.title || 'Building',
                    100 // 100 meter threshold (same as existing logic)
                );
                
                // Check if user is at the building
                isAtBuilding = locationVerifier.isAtBuilding('current_building', currentLocation) || false;
            }
            
            // Store date/time and location in intervention state
            await InterventionStateService.startIntervention(
                infoInter?.header?.noIntervention || '',
                infoInter?.header?.title || '',
                date,
                date.toLocaleString('fr-FR'), // Pass the selected date/time from modal
                isAtBuilding ? (currentLocation as any).latitude : undefined,
                isAtBuilding ? (currentLocation as any).longitude : undefined,
                !isAtBuilding ? (currentLocation as any).latitude : undefined,
                !isAtBuilding ? (currentLocation as any).longitude : undefined
            );
            
            console.log('📍 Intervention started with location data:', {
                selectedDateTime: date,
                selectedDebutDateTime: selectedDebutDateTime,
                location: currentLocation,
                isAtBuilding,
                buildingInfo: { latitude: buildingLat, longitude: buildingLon }
            });
            
        } catch (error) {
            console.error('❌ Error capturing location:', error);
            // Continue with intervention start even if location capture fails
        }
        
        // Navigate to FormulaireInterventionScreen with the start date/time
        navigate(screenNames.FormulaireInterventionScreen, {
            noIntervention: infoInter?.header?.noIntervention,
            startDateTime: date,
        });
    };
    // Helper: Haversine formula to get distance in meters
    function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }
        const R = 6371000; // Radius of the earth in meters
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in meters
        return d;
    }
    async function showModalDebutIntervention() {
        try {
            // Use LocationVerifier for consistent location checking
            const locationVerifier = new LocationVerifier();
            const currentLocation = await locationVerifier.getCurrentLocation();
            
            const immeubleLat = parseFloat(latitude);
            const immeubleLon = parseFloat(longitude);
            
            if (immeubleLat && immeubleLon) {
                // Add building to location verifier
                locationVerifier.addBuilding(
                    'current_building',
                    {
                        latitude: immeubleLat,
                        longitude: immeubleLon
                    },
                    infoInter?.header?.title || 'Building',
                    100 // 100 meter threshold
                );
                
                // Check if user is at the building
                const isAtBuilding = locationVerifier.isAtBuilding('current_building', currentLocation);
                
                if (!isAtBuilding) {
                    Alert.alert(
                        "Hors zone",
                        `Votre position ne correspond pas à l'immeuble de l'intervention. \nSouhaitez-vous continuer ?`,
                        [
                            { text: "NON", style: "cancel" },
                            { text: "OUI", onPress: () => setModalDebutIntervention(true), style: "destructive" }
                        ]
                    );
                } else {
                    setModalDebutIntervention(true);
                }
            } else {
                // If no building coordinates, show modal directly
                setModalDebutIntervention(true);
            }

            await AsyncStorage.setItem('@addressImmeuble', infoInter?.header.title + ';' + infoInter?.header.address);
            await AsyncStorage.setItem('@noIntervention', infoInter?.header.noIntervention.toString());
            
        } catch (error) {
            console.error('❌ Error checking location:', error);
            Alert.alert('Erreur', 'Impossible de récupérer la position de l\'appareil.');
        }
    }

    return (
        <SafeAreaView style={styles.container}>

            <Header titleCom={title} />
            {loading && (<Loader />)}

            {!loading && (
                <View style={styles.infoDetailContainer}>
                    <ScrollView style={styles.infoDetailContainer}>
                        {compo === 'intervention' && <View style={styles.header}>
                            <Text style={styles.headerTitle}>{infoInter?.header.title}</Text>
                            <Text style={styles.addressText}>{infoInter?.header.address}</Text>
                            {selectedDebutDateTime && (
                                <Text style={styles.selectedDateTimeText}>
                                    📅 Début sélectionné: {selectedDebutDateTime.toLocaleString('fr-FR')}
                                </Text>
                            )}
                        </View>}
                        {/* Sections */}
                        {infoInter?.sections.map((section, index) => renderSection(section, index))}

                    </ScrollView>
                </View>)}

            {!loading && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerButton} onPress={() => setmodalHistoInterventionVisible(true)}>
                        <Image
                            source={require('./../../../assets/Icons/historique.png')}
                            style={styles.footerIcon}
                        />
                        <Text style={styles.footerButtonText}>H.Inter</Text>
                    </TouchableOpacity>
                    {compo === 'intervention' && <TouchableOpacity style={styles.footerButton} onPress={() => setmodalHistoDevisVisible(true)}>
                        <Image
                            source={require('./../../../assets/Icons/historique.png')}
                            style={styles.footerIcon}
                        />
                        <Text style={styles.footerButtonText}>H.Devis</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity style={styles.footerButton} onPress={() => goToMaps()}>
                        <Image
                            source={require('./../../../assets/Icons/directions.png')}
                            style={styles.footerIcon}
                        />
                        <Text style={styles.footerButtonText}>Aller à</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerButton} onPress={() => showModalDebutIntervention()}>
                        <Image
                            source={require('./../../../assets/Icons/demarer.png')}
                            style={styles.footerIcon}
                        />
                        <Text style={styles.footerButtonText}>Dém.</Text>
                    </TouchableOpacity>
                </View>)}
            {!loading && (<HistoriqueModal
                titleModal={'Historique Intervention'}
                visible={modalHistoInterventionVisible}
                onClose={() => setmodalHistoInterventionVisible(false)}
                codeImmeuble={infoInter?.header.title}
                addresseImmeuble={infoInter?.header.address}
            />)}
            {!loading && (<HistoriqueModal
                titleModal={'Historique Devis'}
                visible={modalHistoDevisVisible}
                onClose={() => setmodalHistoDevisVisible(false)}
                codeImmeuble={infoInter?.header.title}
                addresseImmeuble={infoInter?.header.address}
            />)}
            {!loading && (<DebutInterventionModal
                visible={modalDebutIntervenion}
                onClose={() => setModalDebutIntervention(false)}
                onConfirm={handleConfirmIntervention}
                title={'Début Intervention'} />)}


        </SafeAreaView>

    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    infoDetailContainer: {
        height: '80%'
    },
    header: {
        marginVertical: 6,
        paddingHorizontal: 6,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addressText: {
        fontSize: 12,
        marginTop: 4,
    },
    selectedDateTimeText: {
        fontSize: 14,
        marginTop: 8,
        color: '#1976d2',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    section: {
        marginVertical: 10,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        marginVertical: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        flex: 0,
    },
    infoValue: {
        flex: 1,
        marginRight: 8,
    },
    phoneIconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        transform: [{ rotate: '240deg' }],
        borderRadius: 16,
        marginRight: 30,
    },
    phoneIcon: {
        width: 18,
        height: 18,
        tintColor: '#1976d2',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 4,
        // position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        height: '10%',
        backgroundColor: '#f5f5f5'
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerIcon: {
        width: 30,
        height: 30,
        tintColor: '#3b5998',
    },
    footerButtonText: {
        fontSize: 16,
        marginTop: 4,
    },
});

export default DetailIntervention;