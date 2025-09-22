import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Alert, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../Application/Services/apiServices';
import { HistoriqueDevis, HistoriqueDevisInput, HistoriqueIntervention, HistoriqueInterventionInput } from '../../Application/ApiCalls';

const HistoriqueModal = ({ titleModal, visible, onClose, codeImmeuble, addresseImmeuble }) => {
    const [searchText, setSearchText] = useState('');
    const [rotated, setRotated] = useState(false);
    const [isSortedAscending, setIsSortedAscending] = useState(true);
    //     {
    //         id: '1',
    //         date: 'mardi 25 février 2025',
    //         description: 'ODEUR ANORMALE EN CHAUFFERIE',
    //         status: '04 - Fin d\'intervention'
    //     },
    //     {
    //         id: '2',
    //         date: 'mardi 25 février 2025',
    //         description: 'FUITE BALLON EAU CHAUDE',
    //         status: 'E - Edité pour facturation'
    //     },
    //     {
    //         id: '3',
    //         date: 'mercredi 29 janvier 2025',
    //         description: 'BRUIT ANORMAL EN CHAUFFERIE',
    //         status: '04 - Fin d\'intervention'
    //     },
    //     {
    //         id: '4',
    //         date: 'mercredi 29 janvier 2025',
    //         description: 'INT TEST 423',
    //         status: '04 - Fin d\'intervention'
    //     },
    //     {
    //         id: '5',
    //         date: 'mardi 14 janvier 2025',
    //         description: 'COLONNE FROIDE',
    //         status: 'S - Saisie de facturation'
    //     },
    //     {
    //         id: '6',
    //         date: 'mardi 26 novembre 2024',
    //         description: 'ODEUR ANORMALE EN CHAUFFERIE',
    //         status: 'S - Saisie de facturation'
    //     },
    //     {
    //         id: '7',
    //         date: 'jeudi 31 octobre 2024',
    //         description: 'DEBARRAS CHAUFFERIE',
    //         status: '04 - Fin d\'intervention'
    //     },
    //     {
    //         id: '8',
    //         date: 'lundi 21 octobre 2024',
    //         description: 'REMPLACEMENT DU DISCONNECTEUR HORS SERVICE SUR LE',
    //         status: '04 - Fin d\'intervention'
    //     },
    //     {
    //         id: '9',
    //         date: 'lundi 14 octobre 2024',
    //         description: '',
    //         status: ''
    //     }
    // ];
    // const proposals = [
    //     {
    //         id: '202502006',
    //         title: 'MAIN D\'OEUVRE',
    //         status: '04 - Imprimé',
    //         creationDate: '27/02/2025 12:27',
    //         acceptanceDate: '',
    //     },
    //     {
    //         id: '202502002',
    //         title: 'Voici notre meilleure proposition concernant le remplacement',
    //         status: 'C3 - Contrat en Saisie',
    //         creationDate: '03/02/2025 09:42',
    //         acceptanceDate: '',
    //     },
    //     {
    //         id: '202502001',
    //         title: 'Aménagement du socle',
    //         status: 'C3 - Contrat en Saisie',
    //         creationDate: '03/02/2025 09:19',
    //         acceptanceDate: '',
    //     },
    //     {
    //         id: '202501011',
    //         title: 'Fourniture et mise en place',
    //         status: 'A - Accepté',
    //         creationDate: '28/01/2025 17:02',
    //         acceptanceDate: '28/01/2025',
    //     },
    //     {
    //         id: '202501009',
    //         title: 'Voici notre meilleure proposition concernant le remplacement',
    //         status: 'C3 - Contrat en Saisie',
    //         creationDate: '23/01/2025 10:06',
    //         acceptanceDate: '',
    //     },
    //     {
    //         id: '202501008',
    //         title: 'Fourniture et mise en place',
    //         status: 'A - Accepté',
    //         creationDate: '22/01/2025 17:57',
    //         acceptanceDate: '13/02/2025',
    //     },
    //     {
    //         id: '202501006',
    //         title: 'Voici notre meilleure proposition concernant le remplacement',
    //         status: 'C3 - Contrat en Saisie',
    //         creationDate: '20/01/2025 15:51',
    //         acceptanceDate: '',
    //     },
    // ];
    const [proposals, setProposals] = useState<HistoriqueDevis[]>([]);
    const [data, setData] = useState<Array<HistoriqueIntervention>>([]);

    // Handle back button press
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (visible) {
                onClose();
                return true; // Prevent default behavior
            }
            return false; // Allow default behavior
        });

        return () => backHandler.remove();
    }, [visible, onClose]);
    // Sorting functions
    const sortProposalsByDateCreation = (proposals: HistoriqueDevis[], ascending: boolean) => {
        return [...proposals].sort((a, b) => {
            const dateA = new Date(a.dateCreation).getTime();
            const dateB = new Date(b.dateCreation).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    };

    const sortInterventionsByDateRealisation = (interventions: HistoriqueIntervention[], ascending: boolean) => {
        return [...interventions].sort((a, b) => {
            const dateA = new Date(a.dateRealise).getTime();
            const dateB = new Date(b.dateRealise).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    };

    const handleSortToggle = () => {
        const newSortOrder = !isSortedAscending;
        setIsSortedAscending(newSortOrder);
        setRotated(!rotated);
        
        if (titleModal === 'Historique Devis') {
            const sortedProposals = sortProposalsByDateCreation(proposals, newSortOrder);
            setProposals(sortedProposals);
        } else if (titleModal === 'Historique Intervention') {
            const sortedData = sortInterventionsByDateRealisation(data, newSortOrder);
            setData(sortedData);
        }
    };

    const filteredData = data.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            item.designation?.toLowerCase().includes(searchLower)
            //  ||
            // item.status.toLowerCase().includes(searchLower)
        );
    });

    const filteredProposal = proposals.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            item.titreDevis?.toLowerCase().includes(searchLower)
            //  ||
            // item.status.toLowerCase().includes(searchLower)
        );
    });

    const renderSeparator = () => <View style={styles.separator} />;


    const renderHistoryItem = ({ item }) => (
        <View style={styles.interventionItem}>
            <View style={styles.interventionInfo}>
                <Text style={styles.dateText}>{item.dateRealise != null ? formatDate(item.dateRealise) : '------'}</Text>
                <Text style={styles.descriptionText}>{item.designation}</Text>
                <Text style={styles.statusText}>{item.codeEtat.code} - {item.codeEtat.libelleCodeEtat}</Text>
            </View>
            <TouchableOpacity style={styles.soundButton} onPress={handleReadAudio}>
                <Image
                    source={require('./../../../assets/Icons/listenAudio.png')}
                    style={styles.soundIcon}
                />
            </TouchableOpacity>
        </View>
    );


    useEffect(() => {
        if (titleModal == 'Historique Devis') {
            const fetchHistoriqueDevis = async (codeImmeuble) => {
                try {
                    const input: HistoriqueDevisInput = {
                        codeImmeuble: codeImmeuble,
                        dateDepart: '1900-01-01',
                    };
                    const response = await apiService.getHistoriqueDevis(input);
                    const json = await response.result;



                    // Process each section in the data
                    setProposals(json as []);
                    console.log(json, proposals);
                } catch (err) {
                    // setError('Failed to fetch data');
                    console.error(err);
                } finally {
                    // setIsLoading(false);
                }
            };
            fetchHistoriqueDevis(codeImmeuble)
        }
        if (titleModal == 'Historique Intervention') {
            const fetchHistoriqueIntervention = async (codeImmeuble) => {
                try {
                    const input: HistoriqueInterventionInput = {
                        codeImmeuble: codeImmeuble,
                        dateDepart: '1900-01-01',
                    };
                    const response = await apiService.getHistoriqueIntervention(input);
                    const json = await response.result;

                    console.log('fgdfdgdgfd', json);


                    // Process each section in the data
                    setData(json as []);

                    console.log('fgdfdgdgfd', data);
                } catch (err) {
                    // setError('Failed to fetch data');
                    console.error(err);
                } finally {
                    // setIsLoading(false);
                }
            };
            fetchHistoriqueIntervention(codeImmeuble)
        }
    }, [])

    const renderDevisItem = ({ item }) => (
        <View style={styles.proposalItem}>
            <View style={styles.leftColumn}>
                <Text style={styles.idText}>{item.numeroDevis}</Text>
                <Text style={styles.titleText}>{item.titreDevis}</Text>
                <Text style={styles.statusText}>{item.codeEtat.code} - {item.codeEtat.libelle}</Text>
            </View>
            <View style={styles.rightColumn}>
                <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Création :</Text>
                    <Text style={styles.dateValue}>{formatDate(item.dateCreation)}</Text>
                </View>
                <View style={styles.dateGroup}>
                    <Text style={styles.dateLabel}>Acceptation :</Text>
                    <Text style={styles.dateValue}>{item.dateAcceptation != null ? formatDate(item.dateAcceptation) : '------'}</Text>
                </View>
            </View>
        </View>
    );

    const formatDate = (isoDate: string): string => {
        const date = new Date(isoDate);
        const pad = (num: number): string => num.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };


    const handleReadAudio = () => {
        Alert.alert(
            "Erreur",
            `Le lien du fichier audio n'est pas valide`,
            [
                {
                    text: "OK",
                    style: "cancel"
                }
            ]
        );
    };
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity 
                    style={styles.modalContent}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.modalTitle}>{titleModal}</Text>

                    <Text style={styles.addressTitle}>
                        {addresseImmeuble}
                    </Text>

                    <View style={styles.searchContainer}>
                        <Image style={styles.searchIcon}
                            source={require('../../../assets/Icons/search.png')} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Filtre"
                            placeholderTextColor="#666"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        <TouchableOpacity style={styles.filterButton} onPress={handleSortToggle}>
                            <Image style={[
                                styles.filterIcon,
                                { transform: [{ rotate: rotated ? "180deg" : "0deg" }] },
                            ]}

                                source={require('../../../assets/Icons/filterList.png')} />
                        </TouchableOpacity>
                    </View>
                    {titleModal == 'Historique Devis' && <FlatList
                        data={filteredProposal}
                        renderItem={renderDevisItem}
                        keyExtractor={item => item.numeroDevis}
                        ItemSeparatorComponent={renderSeparator}
                        style={styles.list}
                    />}
                    {titleModal == 'Historique Intervention' && <FlatList
                        data={filteredData}
                        renderItem={renderHistoryItem}
                        keyExtractor={item => item.noIntervention}
                        ItemSeparatorComponent={renderSeparator}
                        style={styles.list}
                    />}

                    <TouchableOpacity style={styles.okButton} onPress={onClose}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '90%',
        height: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    addressTitle: {
        fontSize: 14,
        padding: 4,
        textAlign: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333'
    },
    filterButton: {
        padding: 5
    },
    filterIcon: {
        width: 24,
        height: 24,
        tintColor: '#5c6bc0'
    },
    list: {
        flex: 1
    },
    interventionItem: {
        flexDirection: 'row',
        padding: 4,
        alignItems: 'center'
    },
    interventionInfo: {
        flex: 1
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    descriptionText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        marginTop: 3
    },
    soundButton: {
        padding: 5
    },
    soundIcon: {
        width: 30,
        height: 24,
        tintColor: '#5c6bc0',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0'
    },
    okButton: {
        padding: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd'
    },
    okButtonText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    proposalItem: {
        flexDirection: 'row',
        padding: 6,
        backgroundColor: 'white',
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        width: 150,
        justifyContent: 'center',
    },
    idText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    titleText: {
        fontSize: 14,
        marginBottom: 4,
    },
    dateGroup: {
        marginBottom: 4,
    },
    dateLabel: {
        fontSize: 14,
        color: '#555',
    },
    dateValue: {
        fontSize: 14,
        color: '#4a6da7',
    },
});
export default HistoriqueModal;  