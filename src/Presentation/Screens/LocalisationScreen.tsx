import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StatusBar,
    BackHandler,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../Components/Header';
import { Picker } from '@react-native-picker/picker';
import { useIntervention } from '../../Infrastructure/Contexte/InterventionContext';

// Mock data based on the provided JSON structure
const MOCK_DATA = {
    localisations: [
        {
            nameLocalisation: "SOUS STATION CPCU",
            statutLib: "Reporté",
            equipement: []
        },
        {
            nameLocalisation: "TERRASSE",
            statutLib: "Reporté",
            equipement: []
        },
        {
            nameLocalisation: "CUISINE",
            statutLib: "Reporté",
            equipement: []
        },
        {
            nameLocalisation: "CHAMBRES",
            statutLib: "Reporté",
            equipement: [
                {
                    nameEquipement: "ENTRETIEN DES VENTILO CONVECTEURS",
                    statutLib: "Non traité",
                    composants: []
                },
                {
                    nameEquipement: "THERMOSTATS",
                    statutLib: "Non traité",
                    composants: [
                        {
                            nomComposant: "TOUS LES COMPOSANTS",
                            frequence: "H",
                            statutLib: "Non tr.",
                            controles: [
                                {
                                    nomControle: "Général",
                                    moyen: "Visuel et appareil de mesure",
                                    anomalie: "Anomalie",
                                    operation: "Correction du problème/demande de devis",
                                    frequence: "H",
                                    statutLib: "Non trai.."
                                }
                            ]
                        }
                    ]
                },
                {
                    nameEquipement: "VMC",
                    statutLib: "Non traité",
                    composants: []
                }
            ]
        }
    ]
};




// Validation Button Component
const ValidateButton = ({ onPress }) => {
    return (
        <TouchableOpacity style={styles.validateButton} onPress={onPress}>
            <Image
                source={require('./../../../assets/Icons/done.png')}
                style={styles.footerIcon}
            />
            <Text style={styles.validateText}>Valider</Text>
        </TouchableOpacity>
    );
};

// Main App Component
const LocalisationsScreen = ({ navigation }) => {
    // State to track current view level and selections
    const [currentScreen, setCurrentScreen] = useState('Localisations');
    const [selectedLocalisation, setSelectedLocalisation] = useState(null);
    const [selectedEquipement, setSelectedEquipement] = useState(null);
    const [selectedComposant, setSelectedComposant] = useState(null);
    const [selectedControle, setSelectedControle] = useState(null);
    const {
        interventionData
    } = useIntervention();


    const [interventionDetail, setinterventionDetail] = useState(null);
    useEffect(() => {
        console.log(interventionData.__prestation[0].localisations);
        setinterventionDetail(interventionData)        
    }, [interventionDetail]);
    // Navigation handlers
    const handleBack = () => {
        if (selectedControle) {
            setSelectedComposant(null);
            setCurrentScreen('Composants');
        }
        else if (selectedComposant) {
            setSelectedComposant(null);
            setCurrentScreen('Composants');
        } else if (selectedEquipement) {
            setSelectedEquipement(null);
            setCurrentScreen('Equipements');
        } else if (selectedLocalisation) {
            setSelectedLocalisation(null);
            setCurrentScreen('Localisations');
        }
    };

    useEffect(() => {


        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            if (currentRoute == "LocalisationsScreen" && currentScreen === "Localisations") {
                navigation.goBack();
                return false;

            }
            else {
                handleBack()
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [currentScreen, selectedLocalisation]);
    const renderLocalisations = () => {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                    setSelectedLocalisation(item);
                    setCurrentScreen('Equipements');
                }}
            >
                <Text style={styles.itemName}>{item.nameLocalisation}</Text>
                <Text style={styles.statusText}>{item.statutLib}</Text>
            </TouchableOpacity>
        );

        return (
            <>
                <Header titleCom="Localisations" />
                <FlatList
                    data={interventionDetail?.__prestation[0].localisations}
                    renderItem={renderItem}
                    keyExtractor={item => item.nameLocalisation} 
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <ValidateButton onPress={() => console.log('Validate Localisations')} />
            </>
        );
    };
    const [selectedValue, setSelectedValue] = useState("");
    const listSttaus = [{
        code: 'NONtRAITE',
        libelle: 'Non traité',

    },
    {
        code: 'Fait',
        libelle: 'Fait',

    },
    {
        code: 'Partiel',
        libelle: 'Partiel',

    }
    ]
    const renderEquipements = () => {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                    setSelectedEquipement(item);
                    setCurrentScreen('Composants');
                }}
            >
                <Text style={styles.itemName}>{item.nameEquipement}</Text>
                <View style={styles.statusContainer}>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) => setSelectedValue(itemValue)}
                        style={styles.picker}
                    >
                        {listSttaus.map((mode) => (
                            <Picker.Item key={mode.code} label={mode.libelle!} value={mode.code} />
                        ))}
                    </Picker>
                </View>
            </TouchableOpacity>
        );

        return (
            <>
                <Header
                    titleCom="Equipements"
                //   onBack={handleBack}
                //   canGoBack={true}
                />
                <Text style={styles.screenTitle}>{selectedLocalisation.nameLocalisation}</Text>
                <FlatList
                    data={selectedLocalisation.equipement}
                    renderItem={renderItem}
                    keyExtractor={item => item.nameEquipement}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <ValidateButton onPress={() => console.log('Validate Equipements')} />
            </>
        );
    };

    const renderComposants = () => {
        const renderItem = ({ item }) => (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                    setSelectedComposant(item);
                    setCurrentScreen('Controles');
                }}
            >
                <View>
                    <Text style={styles.itemName}>{item.nomComposant}</Text>
                    <Text style={styles.subInfo}>
                        {item.controles?.length || 0} contrôles
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={styles.frequenceBox}>
                        <Text style={styles.frequenceText}>{item.frequence}</Text>
                    </View>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue) => setSelectedValue(itemValue)}
                        style={styles.pickerWithFrequence}
                    >
                        {listSttaus.map((mode) => (
                            <Picker.Item key={mode.code} label={mode.libelle!} value={mode.code} />
                        ))}
                    </Picker>
                </View>
            </TouchableOpacity>
        );

        return (
            <>
                <Header
                    titleCom="Composants"
                //   onBack={handleBack}
                //   canGoBack={true}
                />
                <Text style={styles.screenTitle}>{selectedEquipement.nameEquipement}</Text>
                <FlatList
                    data={selectedEquipement.composants}
                    renderItem={renderItem}
                    keyExtractor={item => item.nomComposant}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <ValidateButton onPress={() => console.log('Validate Composants')} />
            </>
        );
    };

    const renderControles = () => {
        const renderItem = ({ item }) => (
            <View>
                <Text style={styles.controlTitle}>{item.nomControle}</Text>

                <View style={styles.controlItem}>

                    <View style={styles.infoControles}>
                        <View style={[styles.infoContainer, { marginTop: 5 }]}>
                            <Text style={styles.infoLabel}>Moyen : </Text>
                            <Text style={styles.infoValue}>{item.moyen}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>Anomalie : </Text>
                            <Text style={styles.infoValue}>{item.anomalie}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoLabel}>Opération : </Text>
                            <Text style={styles.infoValue}>{item.operation}</Text>
                        </View>
                    </View>
                    <View style={styles.statusContainer}>
                        <View style={styles.frequenceBox}>
                            <Text style={styles.frequenceText}>{item.frequence}</Text>
                        </View>
                        <Picker
                            selectedValue={selectedValue}
                            onValueChange={(itemValue) => setSelectedValue(itemValue)}
                            style={styles.pickerWithFrequence}
                        >
                            {listSttaus.map((mode) => (
                                <Picker.Item key={mode.code} label={mode.libelle!} value={mode.code} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>
        );

        return (
            <>
                <Header
                    titleCom="Contrôles"
                //   onBack={handleBack}
                //   canGoBack={true}
                />
                <Text style={styles.screenTitle}>{selectedComposant!.nomComposant}</Text>
                <FlatList
                    data={selectedComposant!.controles}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.nomControle}-${index}`}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <ValidateButton onPress={() => console.log('Validate Controles')} />
            </>
        );
    };

    // Render the appropriate screen based on state
    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'Localisations':
                return renderLocalisations();
            case 'Equipements':
                return renderEquipements();
            case 'Composants':
                return renderComposants();
            case 'Controles':
                return renderControles();
            default:
                return renderLocalisations();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#184797" barStyle="light-content" />
            {renderCurrentScreen()}
        </SafeAreaView>
    );
}

export default LocalisationsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#E8E8E8',
        borderBottomWidth: 1,
        borderBottomColor: '#DADADA',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#184797',
        paddingRight: 5,
        borderRadius: 5,
        overflow: 'hidden',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        color: '#333',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    backButton: {
        marginRight: 10,
    },
    screenTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor: '#F8F8F8',
        textAlign: 'center',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF',
    },
    itemName: {
        paddingVertical: 5,
        fontSize: 14,
        flexWrap: 'wrap',
        width: 200,
        // borderWidth:1
    },
    statusText: {
        color: '#184797',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 140,
        paddingHorizontal: 8,
        height: '100%',
        // borderWidth:1

    },
    frequenceBox: {
        width: 25,
        height: '100%',
        backgroundColor: '#184797',
        justifyContent: 'center',
        alignItems: 'center',
        // marginRight: 10,
    },
    frequenceText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    subInfo: {
        fontSize: 12,
        color: '#777',
        marginTop: 3,
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    validateButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#F8F8F8',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    validateText: {
        color: '#184797',
        fontWeight: 'bold',
        marginTop: 2,
    },
    infoControles: {
        width: '60%'
    },
    controlItem: {
        flexDirection: 'row',
        // padding: 15,
        backgroundColor: '#FFFFFF',
        // borderWidth: 1,

    },
    controlTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        // marginVertical: 2,

    },
    infoLabel: {
        color: '#3b5998',
        fontSize: 12,
        fontWeight: '600',
    },
    infoValue: {
        flex: 1,
        fontSize: 12,
        // fontWeight: '600',
    },
    footerIcon: {
        width: 30,
        height: 30,
        tintColor: '#3b5998',
    },
    picker: {
        height: 50,
        width: 145,
    },
    pickerWithFrequence: {
        height: 50,
        width: 125,
    },
});

