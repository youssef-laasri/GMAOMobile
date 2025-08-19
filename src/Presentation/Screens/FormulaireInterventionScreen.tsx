import { View, Text, StyleSheet, ImageSourcePropType, TouchableOpacity, Linking, Platform, PermissionsAndroid, Alert, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, BackHandler, Dimensions, Image, PanResponder } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../Components/Header';
import { FlatList, Gesture, GestureDetector, GestureHandlerRootView, PinchGestureHandler, ScrollView, Switch, TextInput } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { CameraType, launchCamera } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import SignatureCanvas from 'react-native-signature-canvas';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import DrawOnImage from '../Components/DrawOnImage';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../Application/Services/apiServices';
import DebutInterventionModal from '../Components/DebutInterventionModal';
import RNFS from 'react-native-fs';
import { customCallAPI, fileModel } from '../../Application/Services/customCallAPI';
import { PriPrimeDTO, QualificationDTO } from '../../Application/ApiCalls';
import { CommonFunction } from '../Utils/CommonFunction';
import { useIntervention } from '../../Infrastructure/Contexte/InterventionContext';
import NetInfo from '@react-native-community/netinfo';
import InfoModal from '../Components/InfoModal';
import { LoginInputDTO, AuthenticationApi, Configuration, StringResultDTO } from '../../Application/ApiCalls';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SqlLIteService } from '../../Application/Services/SqlLiteService';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';
import { useReferentiel } from '../../Infrastructure/Contexte/ReferentielContext';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface FormulaireInterventionScreenProps {
    route: {
        params?: {
            noIntervention?: string;
            startDateTime?: Date;
            recordPath?: string;
            status?: string;
            photoUri?: string;
            idSection?: string;
            devisData?: {
                articles: any[];
                imageRapport: string[];
                signataire: string;
                signature: any;
                modeReglement: string;
                image: string | null;
            };
        };
    };
    navigation: any;
}

const FormulaireInterventionScreen = ({ route, navigation }: FormulaireInterventionScreenProps) => {

    const [title, setText] = useState('Rapport');
    const [step, setStep] = useState('step1');
    const [screen, setScreen] = useState('rapport');
    const [speechToText, setSpeechToText] = useState('');
    const [imageRapport, setImageRapport] = useState<string[]>([]);
    const [imagebeforeAfterIntervention, setImageBeforeAfterIntervention] = useState<string[]>([]);
    const [imagequoteRequest, setImageQuoteRequest] = useState<string[]>([]);
    const { navigate } = useNavigation();
    const [expandedSections, setExpandedSections] = useState<Record<string, any>>({});
    const [recordPath, setRecordPath] = useState('');
    const [isRecordDeleted, setisRecordDeleted] = useState(false);
    const [player] = useState(new AudioRecorderPlayer());
    const [datetime, setDatetime] = useState(new Date());
    const [codeImmeubleAddresse, setCodeImmeubleAddresse] = useState('');
    const [noIntervention, setNOIntervention] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [latitudeDebut, setLatitudeDebut] = useState<number | undefined>(undefined);
    const [longitudeDebut, setlongitudeDebut] = useState<number | undefined>(undefined);
    const [latitudeFin, setLatitudeFin] = useState<number | undefined>(undefined);
    const [longitudeFin, setLongitudeFin] = useState<number | undefined>(undefined);
    const [latitudeDebutHZ, setLatitudeDebutHZ] = useState<number | undefined>(undefined);
    const [longitudeDebutHZ, setlongitudeDebutHZ] = useState<number | undefined>(undefined);
    const [latitudeFinHZ, setLatitudeFinHZ] = useState<number | undefined>(undefined);
    const [longitudeFinHZ, setLongitudeFinHZ] = useState<number | undefined>(undefined);
    const [selectedFinDateTime, setSelectedFinDateTime] = useState<Date | null>(null);
    const sections = [
        {
            id: 'vocalReport',
            title: 'RAPPORT VOCAL'
        },
        {
            id: 'beforeAfterIntervention',
            title: 'INTERVENTION AVANT-APRÈS'
        },
        {
            id: 'report',
            title: 'RAPPORT'
        },
        {
            id: 'preWorkQuote',
            title: 'DEVIS AVANT TRAVAUX'
        },
        {
            id: 'quoteRequest',
            title: 'DEMANDE DE DEVIS'
        },
    ];
    // In any component
    const {
        getReferentielData,
        syncReferentielData,
        isOffline,
        lastSyncTime
    } = useReferentiel();
    const [listQualification, setListQualification] = useState<QualificationDTO[]>([]);
    useEffect(() => {
        const fetchModeRegelement = async () => {
            try {
                const response = await apiService.getAllQualification();
                const json = await response;
                setListQualification(json as [])
            } catch (err) {
                // setError('Failed to fetch data');
                console.error(err);
            } finally {
                // setLoading(false);
            }
        };
        fetchModeRegelement()
    }, [navigation, []]);

    const [listPrimeConventionelle, setListPrimeConventionelle] = getReferentielData('priPrimes');;

    // useEffect(() => {
    //     const fetchPrime = async () => {
    //         try {
    //             const response = await apiService.getAllPrimeConventionelle();
    //             const json = await response;
    //             setListPrimeConventionelle(json as [])
    //         } catch (err) {
    //             // setError('Failed to fetch data');
    //             console.error(err);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     };
    //     fetchPrime()
    // }, [navigation, []]);

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [signatureEnabled, setSignatureEnabled] = useState(true);
    useEffect(() => {
        // Set up keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                // Disable signature canvas when keyboard appears
                setSignatureEnabled(false);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                // Re-enable signature canvas when keyboard hides
                setSignatureEnabled(true);
            }
        );

        // Clean up listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);
    useEffect(() => {

        const getToken = async () => {
            try {

                const storedCodeimmeubleAddress = await AsyncStorage.getItem('@addressImmeuble');
                const storedNoIntervention = await AsyncStorage.getItem('@noIntervention');
                if (storedCodeimmeubleAddress !== null) {
                    setCodeImmeubleAddresse(storedCodeimmeubleAddress);
                } else {
                    console.log('No codeImmeuble found');
                }
                if (storedNoIntervention !== null) {
                    setNOIntervention(storedNoIntervention);
                } else {
                    console.log('No noIntervention found');
                }
            } catch (error) {
                console.error('Error retrieving token:', error);
            }
        };

        getToken();
    }, []);

    // Handle start date/time from route params
    useEffect(() => {
        if (route.params?.startDateTime) {
            setSelectedDebutDateTime(route.params.startDateTime);
            setDatetime(route.params.startDateTime);
        }
    }, [route.params?.startDateTime]);
    // Back button handling
    useEffect(() => {
        if (recordPath != '' && recordPath != null) {
            setExpandedSections(prev => ({
                ...prev,
                ['vocalReport']: 'vocalReport'
            }));
        }
        if (imageRapport?.length > 0) {
            setExpandedSections(prev => ({
                ...prev,
                ['report']: 'report'
            }));
        }
        if (imagebeforeAfterIntervention?.length > 0) {
            setExpandedSections(prev => ({
                ...prev,
                ['beforeAfterIntervention']: 'beforeAfterIntervention'
            }));
        }
        if (imagequoteRequest?.length > 0) {
            setExpandedSections(prev => ({
                ...prev,
                ['quoteRequest']: 'quoteRequest'
            }));
        }
    }, [imagebeforeAfterIntervention, imageRapport, recordPath, imagequoteRequest])
    // Back button han0dling
    useEffect(() => {

        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            if (currentRoute == "FormulaireInterventionScreen" && step == "step1" && screen == "rapport") {
                return true; // Prevent back action
            }
            else {
                if (step == "step2" && screen == "rapport") {
                    setStep('step1')
                }
                if (step == "step2" && screen == "saisireReleve") {
                    setStep('step1')
                }
                if (step == "step1" && screen == "saisireReleve") {
                    setStep('step1')
                    setScreen('rapport')
                }
                if (step == "step2" && screen == "rapport") {
                    setStep('step1')
                }
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );
        return () => backHandler.remove();
    }, [navigation, step, screen]);

    const [selectedValue, setSelectedValue] = useState("PRI01");

    const [selectedValueQualification, setSelectedValueQualification] = useState('');

    const getImage = (name: string): ImageSourcePropType | undefined => {
        switch (name) {
            case 'vocalReport': return require('../../../assets/Icons/rapportVocal.png');
            case 'beforeAfterIntervention': return require('../../../assets/Icons/camera.png');
            case 'report': return require('../../../assets/Icons/camera.png');
            case 'preWorkQuote': return require('../../../assets/Icons/edit.png');
            case 'quoteRequest': return require('../../../assets/Icons/camera.png');
            default: return require('../../../assets/Icons/camera.png');
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
        if (id != sectionId) {
            setid(sectionId)
        } else {
            setid('')
        }

    };
    const [id, setid] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPlayRecordVisible, setModalPlayRecordVisible] = useState(false);
    const [idSectio, setidSectio] = useState('');
    function openModal(idSection, image) {
        setisRecordDeleted(false)
        setidSectio(idSection);
        setModalVisible(true);
        setPhoto(image);
    }
    async function openRecordModalAudio() {
        const fileExists = await RNFS.exists(recordPath);
        console.log(fileExists);
        console.log('file://' + recordPath, 'recordPath');
        console.log(modalPlayRecordVisible, 'modaml');
        setModalPlayRecordVisible(true)
        console.log(modalPlayRecordVisible, 'modaml');
    }
    function openRecordAudioScreen() {
        setisRecordDeleted(false)
        navigate(screenNames.RecoredAudioScreen, { noInterventionParam: noIntervention })
    }
    function openDevissAvantTravauxScreen() {
        navigate(screenNames.DevisAvantTravauxScreen)
    }
    const [numColumns, setNumColumns] = useState(3);
    const renderSectionItem = ({ item }) => {
        const isExpanded = expandedSections[item.id] || false;

        return (
            <View>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(item.id)}
                >
                    <View style={styles.sectionTitleContainer}>
                        <Image style={[styles.imageExpandMenu, { transform: [{ rotate: id == item.id ? "180deg" : "0deg" }] }]} source={require('../../../assets/Icons/expand_arrow.png')} />
                        <Text style={styles.sectionTitle}>{item.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openCamera(item.id)}>
                        <Image style={styles.imageMenu}
                            source={getImage(item.id)} />
                    </TouchableOpacity>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.sectionContent}>
                        {/* You can customize the content for each section type */}
                        {item.id === 'vocalReport' && !isRecordDeleted && (
                            <View style={styles.containerRapportVocal}>
                                <Text style={styles.fileName}>{recordPath.split('/').pop()}</Text>
                                {recordPath != '' && recordPath != undefined && <View style={styles.buttonContainer}>
                                    <TouchableOpacity onPress={() => openRecordModalAudio()} style={styles.iconButton}>
                                        <Image
                                            source={require('./../../../assets/Icons/listenAudio.png')}
                                            style={styles.soundIcon}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteFile()} style={styles.iconButton}>
                                        <Image
                                            source={require('./../../../assets/Icons/trash.png')}
                                            style={styles.soundIcon}
                                        />
                                    </TouchableOpacity>
                                </View>}
                            </View>
                        )}
                        {item.id === 'report' && (
                            <FlatList
                                data={imageRapport}
                                numColumns={numColumns}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => openModal('report', item)}>
                                        <Image source={{ uri: item }} style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {item.id === 'beforeAfterIntervention' && (
                            <FlatList
                                data={imagebeforeAfterIntervention}
                                numColumns={numColumns}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => openModal('beforeAfterIntervention', item)}>
                                        <Image source={{ uri: item }} style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {item.id === 'quoteRequest' && (
                            <FlatList
                                data={imagequoteRequest}
                                numColumns={numColumns}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => openModal('quoteRequest', item)}>
                                        <Image source={{ uri: item }} style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        {item.id === 'preWorkQuote' && (
                            // <View style={styles.devisSummaryContainer}>
                            //     {devisArticles.length > 0 || devisImages.length > 0 ? (
                            //         <View>
                            //             <Text style={styles.devisSummaryTitle}>Devis Avant Travaux</Text>
                            //             {devisArticles.length > 0 && (
                            //                 <View style={styles.devisArticlesSummary}>
                            //                     <Text style={styles.devisSummaryLabel}>Articles ({devisArticles.length}):</Text>
                            //                     {devisArticles.slice(0, 3).map((article, index) => (
                            //                         <Text key={index} style={styles.devisArticleText}>
                            //                             • {article.description} - {article.quantity}x {article.unitPrice}€
                            //                         </Text>
                            //                     ))}
                            //                     {devisArticles.length > 3 && (
                            //                         <Text style={styles.devisArticleText}>... et {devisArticles.length - 3} autres</Text>
                            //                     )}
                            //                 </View>
                            //             )}
                            //             {devisSignataire && (
                            //                 <Text style={styles.devisSummaryText}>Signataire: {devisSignataire}</Text>
                            //             )}
                            //             {devisModeReglement && (
                            //                 <Text style={styles.devisSummaryText}>Mode de règlement: {devisModeReglement}</Text>
                            //             )}
                            //             {devisImages.length > 0 && (
                            //                 <Text style={styles.devisSummaryText}>Photos: {devisImages.length} image(s)</Text>
                            //             )}
                            //             {devisSignature && (
                            //                 <Text style={styles.devisSummaryText}>Signature: ✓</Text>
                            //             )}
                            //         </View>
                            //     ) : (
                            //         <Text style={styles.devisEmptyText}>Aucun devis créé</Text>
                            //     )}
                            // </View>
                            <FlatList
                                data={devisImages}
                                numColumns={numColumns}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => openModal('preWorkQuote', item)}>
                                        <Image source={{ uri: item }} style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }} />
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                )}
            </View>
        );
    };
    const [photo, setPhoto] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    useEffect(() => {
        if (route.params?.recordPath) {
            const { recordPath, status } = route.params;
            console.log(status, 'ljhflfj', imageRapport);

            setRecordPath(recordPath);
        }
    }, [route.params?.recordPath]);
    // Handle photo additions separately
    useEffect(() => {
        if (route.params?.photoUri && route.params?.idSection) {
            const { photoUri, idSection } = route.params;
            if (isConnected) {
                switch (idSection) {
                    case 'report':
                        setImageRapport(prev => [...prev, photoUri]);
                        break;
                    case 'beforeAfterIntervention':
                        setImageBeforeAfterIntervention(prev => [...prev, photoUri]);
                        break;
                    case 'quoteRequest':
                        setImageQuoteRequest(prev => [...prev, photoUri]);
                        break;
                }
            } else {
                // Offline: add to state and queue upload
                switch (idSection) {
                    case 'report':
                        setImageRapport(prev => [...prev, photoUri]);
                        break;
                    case 'beforeAfterIntervention':
                        setImageBeforeAfterIntervention(prev => [...prev, photoUri]);
                        break;
                    case 'quoteRequest':
                        setImageQuoteRequest(prev => [...prev, photoUri]);
                        break;
                }
                // Queue the upload
                (async () => {
                    const queue = JSON.parse(await AsyncStorage.getItem('offlineQueue') || '[]');
                    queue.push({ type: 'UPLOAD_PHOTO', payload: { idSection, photoUri } });
                    await AsyncStorage.setItem('offlineQueue', JSON.stringify(queue));
                })();
            }
        }
    }, [route.params?.photoUri, route.params?.idSection, isConnected]);

    const openCamera = (idSection: string) => {
        if (idSection == "report" || idSection == "beforeAfterIntervention" || idSection == "quoteRequest") {
            requestCameraPermission()
            // const options = {
            //     mediaType: "photo",
            //     quality: 1, // Full quality
            //     maxWidth: 1920, // Adjust to desired resolution
            //     maxHeight: 1080,
            //     saveToPhotos: false,
            //     cameraType: 'back' as CameraType,
            //     ...(Platform.OS === 'ios' && {
            //         // iOS specific options
            //         preferredCameraType: 'back',
            //         cameraDevice: 'back',
            //     }),
            //     ...(Platform.OS === 'android' && {
            //         // Android specific options
            //         useFrontCamera: false,
            //         cameraFacing: 'back' as CameraType,
            //     }),
            // };

            // launchCamera(options, (response) => {
            //     if (response.didCancel) {
            //         console.log("User cancelled camera");
            //     } else if (response.errorMessage) {
            //         console.log("Camera Error: ", response.errorMessage);
            //     } else {
            //         switch (idSection) {
            //             case "report":

            //                 setImageRapport([...imageRapport, response.assets[0].uri]);
            //                 break;
            //             case "beforeAfterIntervention":
            //                 setImageBeforeAfterIntervention([...imagebeforeAfterIntervention, response.assets[0].uri]);
            //                 break;
            //             case "quoteRequest":
            //                 setImageQuoteRequest([...imagequoteRequest, response.assets[0].uri]);
            //                 break;

            //             default:
            //                 break;
            //         }
            //     }
            // });
            console.log(idSection);
            navigation.navigate('VisionCamera', { idSection });

        }
        if (idSection == "vocalReport") {
            openRecordAudioScreen()
        }
        if (idSection == "preWorkQuote") {
            openDevissAvantTravauxScreen()
        }

    };
    const showConfirmAlertAsync = (title, message) => {
        return new Promise((resolve) => {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: 'Annuler',
                        style: 'cancel',
                        onPress: () => resolve(false)
                    },
                    {
                        text: 'OK',
                        onPress: () => resolve(true)
                    }
                ]
            );
        });
    };
    const deletePicturesByUris = async (photoUri) => {
        const confirmed = await showConfirmAlertAsync(
            'Confirmation',
            'Êtes - vous sûr de vouloir supprimer cette image ? '
        );
        if (confirmed) {
            // Only execute deletion if user clicked OK
            switch (idSectio) {
                case 'report':
                    setImageRapport(prev => prev.filter(uri => !photoUri.includes(uri)));
                    break;
                case 'beforeAfterIntervention':
                    setImageBeforeAfterIntervention(prev => prev.filter(uri => !photoUri.includes(uri)));
                    break;
                case 'quoteRequest':
                    setImageQuoteRequest(prev => prev.filter(uri => !photoUri.includes(uri)));
                    break;
            }
            setModalVisible(false)

        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA
                );

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasPermission(true);
                } else {
                    setHasPermission(false);
                    Alert.alert("Permission Denied", "You cannot use the camera.");
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            // For iOS, ask for permission using the react-native-permissions package
            setHasPermission(true); // iOS handles it automatically on first access
        }
    };

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [hasEnded, setHasEnded] = useState(false);

    const audioPlayer = useRef(new AudioRecorderPlayer()).current;

    useEffect(() => {
        if (modalPlayRecordVisible) {
            preparePlayer();
        } else {
            stopPlayback();
        }

        return () => {
            stopPlayback();
        };
    }, [modalPlayRecordVisible]);

    const preparePlayer = async () => {
        try {
            console.log(recordPath, 'recordPath');

            await audioPlayer.startPlayer(recordPath);
            setIsPlaying(true);
            setHasEnded(false);

            audioPlayer.addPlayBackListener((e) => {
                if (e.duration > 0) {
                    setProgress(e.currentPosition / e.duration);
                    setCurrentPosition(e.currentPosition);
                    setDuration(e.duration);
                }

                if (e.currentPosition === e.duration) {
                    stopPlayback();
                }
            });
        } catch (error) {
            console.error('Error starting player:', error);
        }
    };

    const handlePlaybackEnd = () => {
        setIsPlaying(false);
        setHasEnded(true);
        audioPlayer.removePlayBackListener();
    };
    const togglePlayPause = async () => {
        try {
            if (hasEnded) {
                // Restart playback if it has ended
                await replayAudio();
            } else if (isPlaying) {
                await audioPlayer.pausePlayer();
                setIsPlaying(false);
            } else {
                await audioPlayer.resumePlayer();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    };

    const stopPlayback = async () => {
        try {
            await audioPlayer.stopPlayer();
            audioPlayer.removePlayBackListener();
            setIsPlaying(false);
            setProgress(0);
        } catch (error) {
            console.error('Error stopping playback:', error);
        }
    };

    const replayAudio = async () => {
        try {
            await stopPlayback();
            await preparePlayer();
        } catch (error) {
            console.error('Error replaying audio:', error);
        }
    };

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Delete recorded file
    const deleteRecordedFile = async (recordPath) => {
        try {
            // Check if file exists first
            const fileExists = await RNFS.exists(recordPath);

            if (fileExists) {
                await RNFS.unlink(recordPath);
                console.log('File deleted successfully');
                return true;
            } else {
                console.log('File does not exist');
                return false;
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    };

    // Usage
    const handleDeleteFile = async () => {
        try {
            await deleteRecordedFile(recordPath);
            toggleSection('vocalReport')
            setisRecordDeleted(true)
        } catch (error) {
        }
    };
    //Submit Intervention

    const [name, setName] = useState('');
    const [qualification, setQualification] = useState('CS');
    const [report, setReport] = useState('');
    const [flagEnabled, setFlagEnabled] = useState(false);
    const [overtimeEnabled, setOvertimeEnabled] = useState(false);

    const [signature, setSignature] = useState(null);

    const signatureRef = useRef();
    // Handle signature clear
    const handleClear = () => {
        signatureRef.current.clearSignature();
        setSignature(null);
    };

    const handleEnd = () => {
        setIsDrawing(false)
        signatureRef.current.readSignature();
    };
    // Handle signature save
    const handleSignature = (signature) => {
        console.log(signature, 'signature canvas');

        setSignature(signature);
    };



    // State variables

    function goToReleveScreen() {
        // setText('Compteurs')
        // setScreen('saisireReleve')
        navigate(screenNames.LocalisationScreen)

    }

    function goToReleveScreenStep2() {
        setText('Saisir Relevé')
        setScreen('saisireReleve')
        setStep('step2')
    }

    const toggleStatusColor = () => {
        // Toggle between red (off/error) and green (on/ok)
        setStatusColor(statusColor === 'red' ? 'green' : 'red');
    };
    const [meterChangeEnabled, setMeterChangeEnabled] = useState(false);
    const [startIndex, setStartIndex] = useState('');
    const [oldStartIndex, setOldStartIndex] = useState('137.66');
    const [endIndex, setEndIndex] = useState('');
    const [oldEndIndex, setOldEndIndex] = useState('');
    const [razLeftEnabled, setRazLeftEnabled] = useState(false);
    const [razRightEnabled, setRazRightEnabled] = useState(false);
    const [panneLeftEnabled, setPanneLeftEnabled] = useState(false);
    const [panneRightEnabled, setPanneRightEnabled] = useState(false);

    const [meters, setMeters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusColor, setStatusColor] = useState('red');

    useEffect(() => {
        // Simulating API fetch for meter data
        const fetchMeters = async () => {
            try {
                // Replace with actual API call
                const data = [
                    { id: '1', title: 'COMPTEUR ENERGIE CHAUFFAGE (WMh)' },
                    { id: '2', title: 'COMPTEUR ENERGIE ECS (WMh)' },
                    { id: '3', title: 'COMPTEUR ECS' },
                    { id: '4', title: 'APPOINT' },
                ];

                setMeters(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching meters:', error);
                setLoading(false);
            }
        };

        fetchMeters();
    }, []);

    const renderMeterItem = ({ item }) => (
        <TouchableOpacity
            style={styles.meterItem}
            onPress={() => goToReleveScreenStep2()}
        >
            <Text style={styles.meterTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderSeparator = () => <View style={styles.separatorCompteurs} />;
    function makeTwoDigits(time) {
        const timeString = `${time}`;
        if (timeString.length === 2) return time
        return `0${time}`
    }

    // Calculate consumption when indices change
    const [consumption, setConsumption] = useState(0);

    useEffect(() => {
        if (startIndex && endIndex) {
            const start = parseFloat(startIndex);
            const end = parseFloat(endIndex);
            if (!isNaN(start) && !isNaN(end) && end >= start) {
                setConsumption(end - start);
            } else {
                setConsumption(0);
            }
        } else {
            setConsumption(0);
        }
    }, [startIndex, endIndex]);


    // Animation values
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Constants
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    // Handle double tap to zoom
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (scale.value > 1.5) {
                // Reset zoom
                scale.value = withTiming(1);
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedScale.value = 1;
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                // Zoom in to center
                scale.value = withTiming(3);
                savedScale.value = 3;
            }
        });

    // Handle pinch gesture
    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value;
        })
        .onUpdate((e) => {
            // Calculate new scale with constraints
            let newScale = savedScale.value * e.scale;
            newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            scale.value = newScale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    // Handle pan gesture
    const panGesture = Gesture.Pan()
        .onStart(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        })
        .onUpdate((e) => {
            // Only allow panning when zoomed in
            if (scale.value > 1) {
                // Calculate boundaries based on zoom level
                const maxTranslateX = ((scale.value * width) - width) / 2;
                const maxTranslateY = ((scale.value * height) - height) / 2;

                // Apply translation with boundaries
                translateX.value = Math.min(
                    Math.max(savedTranslateX.value + e.translationX, -maxTranslateX),
                    maxTranslateX
                );
                translateY.value = Math.min(
                    Math.max(savedTranslateY.value + e.translationY, -maxTranslateY),
                    maxTranslateY
                );
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    // Combine gestures
    const combinedGestures = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture
    );

    // Animated styles
    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    const formatDateString = (dateStr: Date | string | null) => {
        if (!dateStr) return null;

        // If already in Date format, format it
        if (dateStr instanceof Date) {
            // Format as dd/mm/yyyy HH:mm:ss
            const day = String(dateStr.getDate()).padStart(2, '0');
            const month = String(dateStr.getMonth() + 1).padStart(2, '0');
            const year = dateStr.getFullYear();
            const hours = String(dateStr.getHours()).padStart(2, '0');
            const minutes = String(dateStr.getMinutes()).padStart(2, '0');
            const seconds = String(dateStr.getSeconds()).padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }

        // Check if already in correct format
        if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
            return dateStr; // Already formatted correctly
        }

        // Parse and format
        try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            }
        } catch (e) {
            console.error('Error formatting date:', e);
        }

        return null;
    };

    const {
        resetInterventionData
    } = useIntervention();
    // Handle form submission
    const handleSubmit = async (dateOverride?: Date) => {
        try {
            // Use the selected dates or fallback to current date
            const startDateTime = selectedDebutDateTime || route.params?.startDateTime || new Date();
            const endDateTime = dateOverride || selectedFinDateTime || new Date();

            const startTimestamp = formatDateString(startDateTime);
            const endTimestamp = formatDateString(endDateTime);
            const realisationTimestamp = formatDateString(endDateTime);

            const matricule = await AsyncStorage.getItem('@matricule')
            // Call the updateInterventionHandler with form values
            let rapportVocalRapportVocalFiles = []
            if (recordPath != '') {
                // Format files for form data
                const newFiles = {
                    uri: recordPath,
                    type: 'audio/amr', // Fallback to jpeg if mime type not provided
                    name: `recording_${endTimestamp}_${noIntervention}__${matricule}.amr`, // Generate a name if not available
                };

                rapportVocalRapportVocalFiles.push(newFiles);
            }
            // let interventionApresAvant : Array<fileModel> = []
            // Format files for form data
            const interventionApresAvant = imagebeforeAfterIntervention.map((asset, index) => ({
                uri: asset,
                type: 'image/jpeg', // Fallback to jpeg if mime type not provided
                name: `Avantaprès_${index}_${endTimestamp}_${noIntervention}__${matricule}.jpg`, // Generate a name if not available
            }));
            // interventionApresAvant.push(newinterventionApresAvant)

            // let rapportFiiles = []
            // Format files for form data
            const rapportFiiles = imageRapport.map((asset, index) => ({
                uri: asset,
                type: 'image/jpeg', // Fallback to jpeg if mime type not provided
                name: `Rapport_${index}_${endTimestamp}_${noIntervention}__${matricule}.jpg`, // Generate a name if not available
            }));
            // rapportFiiles.push(newRapportFiles)

            // Convert the base64 string to a file object for React Native
            const signPath = await CommonFunction.saveSignature(signature) as string
            const signatureFile: fileModel = {
                uri: signPath,
                type: 'image/png',
                name: `Signature_${endTimestamp}_${noIntervention}__${matricule}.png`
            };

            // Prepare devis avant travaux data
            let devisAvantTravauxListArticle = undefined;
            let devisAvantTravauxSignataire = undefined;
            let devisAvantTravauxSignature = undefined;
            let devisAvantTravauxModeReglement = undefined;
            let devisAvantTravauxPhotosDevisAvantTravauxFiles = undefined;

            // If we have devis data, include it in the payload
            if (devisArticles.length > 0 || devisImages.length > 0 || devisSignataire || devisSignature || devisModeReglement) {
                devisAvantTravauxListArticle = devisArticles;
                devisAvantTravauxSignataire = devisSignataire;

                // Convert devis signature to file if exists
                if (devisSignature) {
                    const devisSignPath = await CommonFunction.saveSignature(devisSignature) as string;
                    devisAvantTravauxSignature = {
                        uri: devisSignPath,
                        type: 'image/png',
                        name: `DevisSignature_${endTimestamp}_${noIntervention}__${matricule}.png`
                    };
                }

                devisAvantTravauxModeReglement = devisModeReglement;

                // Convert devis images to file format
                if (devisImages.length > 0) {
                    devisAvantTravauxPhotosDevisAvantTravauxFiles = devisImages.map((asset, index) => ({
                        uri: asset,
                        type: 'image/jpeg',
                        name: `DevisPhoto_${index}_${endTimestamp}_${noIntervention}__${matricule}.jpg`
                    }));
                }
            }

            const formPayload = [
                noIntervention,
                codeImmeubleAddresse?.split(';')[0],
                0, // devisEtablir
                false, //bEvent
                0, // noAstreint
                selectedValue, // primeConventionnelle
                name, // nomSignataire
                qualification, // qualificationSignataire
                signatureFile, // signature
                report,
                latitudeDebut, // latitudeDebutIntervention
                longitudeDebut, // longitudeDebutIntervention
                latitudeFin, // latitudeFinIntervention
                longitudeFin, // longitudeFinIntervention
                latitudeDebutHZ, // latitudeDebutInterventionHZ
                longitudeDebutHZ, // longitudeDebutInterventionHZ
                latitudeFinHZ, // latitudeFinInterventionHZ
                longitudeFinHZ, // longitudeFinInterventionHZ
                startTimestamp, // dateDebut
                endTimestamp, // dateFin
                realisationTimestamp, // dateRealisation
                flagEnabled, // drapeau
                overtimeEnabled,
                0, // isAstreintte
                '', // rapportVocalSpeechToText
                rapportVocalRapportVocalFiles, // rapportVocalRapportVocalFiles
                interventionApresAvant, // interventionApresAvantFiles
                rapportFiiles,
                devisAvantTravauxListArticle, // devisAvantTravauxListArticle
                devisAvantTravauxSignataire, // devisAvantTravauxSignataire
                devisAvantTravauxSignature, // devisAvantTravauxSignature
                devisAvantTravauxModeReglement, // devisAvantTravauxModeReglement
                false, // devisAvantTravauxFlagEmail
                devisAvantTravauxPhotosDevisAvantTravauxFiles, // devisAvantTravauxPhotosDevisAvantTravauxFiles
                undefined  // demandeDeDevisFiles
            ];
            if (isConnected) {
                console.log(formPayload);

                await customCallAPI.apiInterventionUpdateInterventionPost(...formPayload);

                // End intervention tracking
                await InterventionStateService.endIntervention();

                setModalFinIntervention(false)
                resetInterventionData()
                // Alert.alert('Success', 'Intervention updated successfully');
                navigate(screenNames.HomeScreen)
            } else {
                // Save to offline queue
                const queue = JSON.parse(await AsyncStorage.getItem('offlineQueue') || '[]');
                queue.push({ type: 'SUBMIT_FORM', payload: formPayload });
                await AsyncStorage.setItem('offlineQueue', JSON.stringify(queue));

                // End intervention tracking even for offline submissions
                await InterventionStateService.endIntervention();

                setModalFinIntervention(false)
                resetInterventionData()
                Alert.alert('Hors ligne', 'Votre intervention sera envoyée dès que la connexion sera rétablie.');
                navigate(screenNames.HomeScreen)
            }
        }
        catch (error) {
            console.error('Error updating intervention:', error);
            setModalFinIntervention(false)
            // navigate(screenNames.HomeScreen)
            Alert.alert('Error', 'Failed to update intervention. Please try again.');
        } finally {

            // setLoading(false);
        }
    };

    const [modalFinIntervenion, setModalFinIntervention] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [selectedDebutDateTime, setSelectedDebutDateTime] = useState<Date | null>(null);

    // Add state for devis data
    const [devisArticles, setDevisArticles] = useState<any[]>([]);
    const [devisImages, setDevisImages] = useState<string[]>([]);
    const [devisSignataire, setDevisSignataire] = useState('');
    const [devisSignature, setDevisSignature] = useState(null);
    const [devisModeReglement, setDevisModeReglement] = useState('');
    const [devisImage, setDevisImage] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
            if (state.isConnected) {
                syncOfflineData();
            }
        });
        return () => unsubscribe();
    }, []);

    // Add useEffect to receive devis data from DevisAvantTravauxScreen
    useEffect(() => {
        if (route.params?.devisData) {
            const { articles, imageRapport, signataire, signature, modeReglement, image } = route.params.devisData;
            setDevisArticles(articles || []);
            setDevisImages(imageRapport || []);
            setDevisSignataire(signataire || '');
            setDevisSignature(signature);
            setDevisModeReglement(modeReglement || '');
            setDevisImage(image);
            console.log('Received devis data:', route.params.devisData);
        }
    }, [route.params?.devisData]);

    // Use useFocusEffect to read devis data from AsyncStorage when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            const readDevisData = async () => {
                try {
                    const storedDevisData = await AsyncStorage.getItem('@devisData');
                    if (storedDevisData) {


                        const devisData = JSON.parse(storedDevisData);
                        setDevisArticles(devisData.articles || []);
                        console.log(devisData.imageRapport, 'devisData.imageRapport');
                        setDevisImages(devisData.imageRapport || []);
                        console.log(devisImages, 'devisImages');
                        setDevisSignataire(devisData.signataire || '');
                        setDevisSignature(devisData.signature);
                        setDevisModeReglement(devisData.modeReglement || '');
                        setDevisImage(devisData.image);
                        console.log('Read devis data from storage:', devisData);

                        // Clear the stored data after reading it
                        await AsyncStorage.removeItem('@devisData');
                    }
                } catch (error) {
                    console.error('Error reading devis data from storage:', error);
                }
            };

            readDevisData();
        }, [])
    );

    // Add this function to sync offline data when online
    const syncOfflineData = async () => {
        const queue = JSON.parse(await AsyncStorage.getItem('offlineQueue') || '[]');
        const newQueue = [];
        for (const action of queue) {
            try {
                if (action.type === 'SUBMIT_FORM') {
                    await customCallAPI.apiInterventionUpdateInterventionPost(
                        ...action.payload // Spread the payload as arguments
                    );
                }
                if (action.type === 'UPLOAD_PHOTO') {
                    // Simulate upload logic, e.g. call your upload API
                    // You may need to adjust this to match your actual upload logic
                    // For now, just call the same logic as when online
                    // You can add more sophisticated logic if needed
                    // Example: await uploadPhotoToServer(action.payload.idSection, action.payload.photoUri);
                    // For now, do nothing (since the photo is already in state)
                }
            } catch (e) {
                // If sync fails, keep the action in the queue
                newQueue.push(action);
            }
        }
        await AsyncStorage.setItem('offlineQueue', JSON.stringify(newQueue));
    };

    // Handler for DebutInterventionModal confirm (for Fin Intervention)
    const handleFinInterventionConfirm = (date: Date) => {
        setSelectedFinDateTime(date);
        setModalFinIntervention(false);
        setTimeout(() => handleSubmit(date), 0);
    };

    // Handler for DebutInterventionModal confirm (for Debut Intervention)
    const handleDebutInterventionConfirm = (date: Date) => {
        setSelectedDebutDateTime(date);
        setModalFinIntervention(false);
        setTimeout(() => handleSubmit(date), 0);
    };

    // Add state for intervention tracking
    const [interventionDuration, setInterventionDuration] = useState<string>('');
    const [interventionStartTime, setInterventionStartTime] = useState<Date | null>(null);

    // Add useEffect to start tracking the intervention
    useEffect(() => {
        const startInterventionTracking = async () => {
            try {
                // Check if intervention is already started
                const isActive = await InterventionStateService.isInterventionActive();

                if (!isActive && noIntervention && codeImmeubleAddresse) {
                    // Start new intervention tracking
                    await InterventionStateService.startIntervention(
                        noIntervention,
                        codeImmeubleAddresse?.split(';')[0],
                        latitudeDebut,
                        longitudeDebut,
                        latitudeDebutHZ,
                        longitudeDebutHZ
                    );
                    setInterventionStartTime(new Date());
                    console.log('Intervention tracking started');
                } else if (isActive) {
                    // Get existing intervention info
                    const interventionInfo = await InterventionStateService.getCurrentInterventionInfo();
                    if (interventionInfo) {
                        setInterventionStartTime(new Date(interventionInfo.startTime));
                        setInterventionDuration(interventionInfo.duration);
                    }
                }
            } catch (error) {
                console.error('Error starting intervention tracking:', error);
            }
        };

        startInterventionTracking();
    }, [noIntervention, codeImmeubleAddresse]);

    // Update duration display every second
    useEffect(() => {
        if (interventionStartTime) {
            const interval = setInterval(async () => {
                try {
                    const duration = await InterventionStateService.getInterventionDuration();
                    if (duration > 0) {
                        setInterventionDuration(InterventionStateService.formatDuration(duration));
                    }
                } catch (error) {
                    console.error('Error updating duration:', error);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [interventionStartTime]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? true);
            if (state.isConnected) {
                syncOfflineData();
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        // <View>

        <SafeAreaView style={styles.container}>
            <Header titleCom={title} />
            {step == "step1" && screen == "rapport" && (
                <View style={styles.container}>
                    {/* Header */}
                    < View style={styles.header}>
                        <Text style={styles.clientNumber}>{codeImmeubleAddresse?.split(';')[0]}</Text>
                        <Text style={styles.issueType}>{codeImmeubleAddresse?.split(';')[1]}</Text>
                        <View style={styles.interventionTimeContainer}>
                            <Image
                                source={require('../../../assets/Icons/timelapse.png')}
                                style={styles.timeLapseIcon}
                            />
                            <Text style={styles.interventionTime}>
                                Intervention démarrée à {makeTwoDigits((selectedDebutDateTime || datetime).getHours())}:{makeTwoDigits((selectedDebutDateTime || datetime).getMinutes())}
                            </Text>
                        </View>
                        {interventionDuration && (
                            <View style={styles.durationContainer}>
                                <Text style={styles.durationLabel}>Durée:</Text>
                                <Text style={styles.durationValue}>{interventionDuration}</Text>
                            </View>
                        )}
                    </View>
                    {/* Dynamic Sections List */}
                    <View style={styles.sectionsListContainer}>
                        <FlatList
                            data={sections}
                            renderItem={renderSectionItem}
                            keyExtractor={item => item.id}
                            style={styles.sectionsList}
                        />
                        <View style={styles.conventionalPrimeContainer}>
                            <Text style={styles.conventionalPrimeLabel}>Prime conventionnelle :</Text>

                            <Picker
                                selectedValue={selectedValue}
                                onValueChange={(itemValue) => setSelectedValue(itemValue)}
                                style={styles.picker}
                            >
                                {listPrimeConventionelle.map((mode) => (
                                    <Picker.Item key={mode.code} label={mode.libelle!} value={mode.code} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerButton} onPress={() => navigate(screenNames.DetailInterventionScreen)}>
                            <Image
                                source={require('./../../../assets/Icons/details.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Détail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.footerButton} onPress={() => goToReleveScreen()}>
                            <View>
                                <Image
                                    source={require('./../../../assets/Icons/compteur.png')}
                                    style={styles.footerIcon}
                                />
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationText}>C</Text>
                                </View>
                            </View>
                            <Text style={styles.footerButtonText}>Prestations</Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={styles.footerButton} onPress={() => setStep('step2')}>
                            <Image
                                source={require('./../../../assets/Icons/done.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Fin</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            )}
            {step == "step2" && screen == "rapport" && (

                <View style={styles.container}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingContainer}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <ScrollView style={styles.scrollStyle} scrollEnabled={!isDrawing}>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Nom signataire :</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Saisir nom"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

                                {/* Qualification */}
                                <View style={styles.conventionalPrimeContainer}>
                                    <Text style={styles.conventionalPrimeLabel}>Qualification signataire :</Text>

                                    <Picker
                                        selectedValue={selectedValueQualification}
                                        onValueChange={(itemValue) => setSelectedValueQualification(itemValue)}
                                        style={styles.picker}
                                    >
                                        {listQualification.map((mode) => (
                                            <Picker.Item key={mode.code} label={mode.qualification!} value={mode.code} />
                                        ))}
                                    </Picker>
                                </View>

                                {/* Signature */}

                                <View style={styles.section}>

                                    <Text style={styles.subLabel}>Signature :</Text>
                                    <View style={styles.signatureContainer}>
                                        {signatureEnabled ? (
                                            <TouchableWithoutFeedback>
                                                <SignatureCanvas
                                                    onBegin={() => setIsDrawing(true)}
                                                    onEnd={handleEnd}
                                                    ref={signatureRef}
                                                    onOK={handleSignature}
                                                    onEmpty={() => setSignature(null)}
                                                    descriptionText=""
                                                    webStyle={`
          .m-signature-pad {height: 150px; width: 100%;}
          .m-signature-pad--body {border: 1px solid #ccc;}
        `}
                                                    style={styles.signatureCanvas}
                                                />
                                            </TouchableWithoutFeedback>
                                        ) : (
                                            <View style={styles.disabledOverlay}>
                                                <Text>Signature désactivée tant que le clavier est visible.</Text>
                                            </View>
                                        )}

                                        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                            <Text style={styles.clearButtonText}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Compte-rendu :</Text>
                                    <TextInput
                                        style={styles.reportInput}
                                        placeholder="Saisir information"
                                        multiline
                                        value={report}
                                        onChangeText={setReport}
                                    />
                                </View>

                                {/* Toggle Switches */}
                                <View style={styles.switchContainer}>
                                    <Text style={styles.switchLabel}>Drapeau</Text>
                                    <Switch
                                        trackColor={{ false: "#f4f4f4", true: "#4f6cb8" }}
                                        thumbColor={flagEnabled ? "#ffffff" : "#ffffff"}
                                        onValueChange={() => setFlagEnabled(!flagEnabled)}
                                        value={flagEnabled}
                                    />
                                </View>

                                <View style={styles.switchContainer}>
                                    <Text style={styles.switchLabel}>Heures supp.</Text>
                                    <Switch
                                        trackColor={{ false: "#f4f4f4", true: "#4f6cb8" }}
                                        thumbColor={overtimeEnabled ? "#ffffff" : "#ffffff"}
                                        onValueChange={() => setOvertimeEnabled(!overtimeEnabled)}
                                        value={overtimeEnabled}
                                    />
                                </View>
                            </ScrollView>
                        </TouchableWithoutFeedback>

                    </KeyboardAvoidingView>
                    {/* Validate Button */}
                    <View style={styles.footerSubmit}>
                        <TouchableOpacity style={styles.footerButton} onPress={() => setModalFinIntervention(true)}>
                            <Image
                                source={require('./../../../assets/Icons/done.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Valider</Text>
                        </TouchableOpacity>
                    </View>


                </View >


            )
            }
            {step == "step1" && screen == "saisireReleve" && (

                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerCompteurs}>
                        <Text style={styles.headerTitle}>Chaufferie</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                    </View>

                    {/* Meters List */}
                    <FlatList
                        data={meters}
                        renderItem={renderMeterItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={renderSeparator}
                        contentContainerStyle={styles.listContainer}
                    />
                    {/* Validate Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerButton} onPress={() => toggleStatusColor()}>
                            <Image
                                source={require('./../../../assets/Icons/Allumage.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Allumage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.footerButton} onPress={() => console.log()}>
                            <Image
                                source={require('./../../../assets/Icons/FinSaisi.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Fin saisie</Text>
                        </TouchableOpacity>
                    </View>


                </View >


            )
            }
            {step == "step2" && screen == "saisireReleve" && (
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.title}>101632 - COMPTEUR ENERGIE DE</Text>

                        {/* Meter Change Switch */}
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabelCompeur}>Changement compteur</Text>
                            <Switch
                                trackColor={{ false: "#d0d0d0", true: "#d0d0d0" }}
                                thumbColor={meterChangeEnabled ? "#4a6da7" : "#ffffff"}
                                ios_backgroundColor="#d0d0d0"
                                onValueChange={setMeterChangeEnabled}
                                value={meterChangeEnabled}
                            />
                        </View>

                        <View style={styles.spacer} />

                        {/* Different layouts based on meter change state */}
                        {meterChangeEnabled ? (
                            // Layout when meter change is enabled (Image 1)
                            <View style={styles.indicesContainer}>
                                <View style={styles.indicesRow}>
                                    <View style={styles.indexColumn}>
                                        <Text style={styles.indexLabel}>Index de début</Text>
                                        <TextInput
                                            style={styles.inputCompteur}
                                            placeholder="Saisir index"
                                            placeholderTextColor="#888"
                                            keyboardType="numeric"
                                            value={startIndex}
                                            onChangeText={setStartIndex}
                                        />
                                    </View>
                                    <View style={styles.indexColumn}>
                                        <Text style={styles.indexLabel}>Ancien Idx début</Text>
                                        <TextInput
                                            style={styles.disabledInput}
                                            value={oldStartIndex}
                                            editable={false}
                                        />
                                    </View>
                                </View>

                                <View style={styles.indicesRow}>
                                    <View style={styles.indexColumn}>
                                        <Text style={styles.indexLabel}>Index de fin</Text>
                                        <TextInput
                                            style={styles.inputCompteur}
                                            placeholder="Saisir index"
                                            placeholderTextColor="#888"
                                            keyboardType="numeric"
                                            value={endIndex}
                                            onChangeText={setEndIndex}
                                        />
                                    </View>
                                    <View style={styles.indexColumn}>
                                        <Text style={styles.indexLabel}>Ancien Idx fin</Text>
                                        <TextInput
                                            style={styles.inputCompteur}
                                            placeholder="Saisir index"
                                            placeholderTextColor="#888"
                                            keyboardType="numeric"
                                            value={oldEndIndex}
                                            onChangeText={setOldEndIndex}
                                        />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // Layout when meter change is disabled (Image 2)
                            <View style={styles.centerIndicesContainer}>
                                <View style={styles.centerIndexColumn}>
                                    <Text style={styles.indexLabel}>Index de début</Text>
                                    <TextInput
                                        style={styles.disabledInput}
                                        value={oldStartIndex}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.centerIndexColumn}>
                                    <Text style={styles.indexLabel}>Index de fin</Text>
                                    <TextInput
                                        style={styles.inputCompteur}
                                        placeholder="Saisir index"
                                        placeholderTextColor="#888"
                                        keyboardType="numeric"
                                        value={endIndex}
                                        onChangeText={setEndIndex}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Toggle switches section */}
                        <View style={styles.togglesContainer}>
                            <View style={meterChangeEnabled ? styles.togglesRow : styles.centerTogglesRow}>
                                <View style={styles.toggleItem}>
                                    <Text style={styles.toggleLabel}>RAZ</Text>
                                    <Switch
                                        trackColor={{ false: "#d0d0d0", true: "#d0d0d0" }}
                                        thumbColor={razLeftEnabled ? "#4a6da7" : "#ffffff"}

                                        ios_backgroundColor="#d0d0d0"
                                        onValueChange={setRazLeftEnabled}
                                        value={razLeftEnabled}
                                    />
                                </View>

                                {meterChangeEnabled && (
                                    <View style={styles.toggleItem}>
                                        <Text style={styles.toggleLabel}>RAZ</Text>
                                        <Switch
                                            trackColor={{ false: "#d0d0d0", true: "#d0d0d0" }}
                                            thumbColor={razRightEnabled ? "#4a6da7" : "#ffffff"}
                                            ios_backgroundColor="#d0d0d0"
                                            onValueChange={setRazRightEnabled}
                                            value={razRightEnabled}
                                        />
                                    </View>
                                )}
                            </View>

                            <View style={meterChangeEnabled ? styles.togglesRow : styles.centerTogglesRow}>
                                <View style={styles.toggleItem}>
                                    <Text style={styles.toggleLabel}>Panne</Text>
                                    <Switch
                                        trackColor={{ false: "#d0d0d0", true: "#d0d0d0" }}
                                        thumbColor={panneLeftEnabled ? "#4a6da7" : "#ffffff"}
                                        ios_backgroundColor="#d0d0d0"
                                        onValueChange={setPanneLeftEnabled}
                                        value={panneLeftEnabled}
                                    />
                                </View>

                                {meterChangeEnabled && (
                                    <View style={styles.toggleItem}>
                                        <Text style={styles.toggleLabel}>Panne</Text>
                                        <Switch
                                            trackColor={{ false: "#d0d0d0", true: "#d0d0d0" }}
                                            thumbColor={panneRightEnabled ? "#4a6da7" : "#ffffff"}
                                            ios_backgroundColor="#d0d0d0"
                                            onValueChange={setPanneRightEnabled}
                                            value={panneRightEnabled}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.spacer} />

                        {/* Consumption display */}
                        <View style={styles.consumptionContainer}>
                            <Text style={styles.consumptionLabel}>Consommation :</Text>
                            <Text style={styles.consumptionValue}>{consumption > 0 ? consumption.toFixed(2) : ''}</Text>
                        </View>
                    </ScrollView>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.footerButton} onPress={() => console.log()}>
                            <Image
                                source={require('./../../../assets/Icons/done.png')}
                                style={styles.footerIcon}
                            />
                            <Text style={styles.footerButtonText}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
            }

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {imageRapport && (
                            <GestureHandlerRootView style={styles.container}>
                                <GestureDetector gesture={combinedGestures}>
                                    <Animated.View style={styles.imageContainer}>
                                        <Animated.Image
                                            source={{ uri: photo }}
                                            style={[styles.image, animatedImageStyle]}
                                            resizeMode="contain"
                                        />
                                    </Animated.View>
                                </GestureDetector>
                            </GestureHandlerRootView>
                        )}
                        <View style={{ flexDirection: 'row', paddingHorizontal: 50, backgroundColor: '#f5f5f5', }}>
                            <TouchableOpacity style={styles.okButton} onPress={() => deletePicturesByUris(photo)}>
                                <Image style={styles.icon}
                                    source={require('../../../assets/Icons/trash.png')} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.okButton} onPress={() => setModalVisible(false)}>
                                <Image
                                    source={require('./../../../assets/Icons/done.png')}
                                    style={styles.icon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* <DrawOnImage imageUri={photo} /> */}
                </SafeAreaView>

            </Modal>

            <Modal visible={modalPlayRecordVisible} transparent={true} animationType="fade">
                <SafeAreaView style={styles.modalOverlay}>
                    <View style={styles.modalContentPlayAudio}>

                        <View style={styles.buttonPlayerContainer}>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={togglePlayPause}
                            >
                                <View style={styles.playIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={togglePlayPause}
                            >
                                <View style={styles.pauseIcon}>
                                    <View style={styles.pauseBar} />
                                    <View style={styles.pauseBar} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={replayAudio}
                            >
                                <View style={styles.stopButtonInner} />

                            </TouchableOpacity>
                        </View>


                        <View style={styles.progressContainer}>
                            <View style={styles.progressBg}>
                                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                                <View
                                    style={[
                                        styles.progressDot,
                                        { left: `${progress * 100}%` }
                                    ]}
                                />
                            </View>

                            <View style={styles.timeContainer}>
                                <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
                                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                            </View>
                        </View>
                        {/* <View>
                            <Text style={styles.speechText}>{speechToText}</Text>
                        </View> */}
                        <View style={styles.controlsContainer}>
                            {/* <TouchableOpacity
                                style={styles.replayButton}
                                onPress={replayAudio}
                            >
                             
                                <Text style={styles.replayText}>Replay</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                style={styles.replayButton}
                                onPress={() => setModalPlayRecordVisible(false)}
                            >
                                {/* <Icon name="refresh-outline" size={24} color="#3F51B5" /> */}
                                <Text style={styles.replayText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>

            </Modal>
            <DebutInterventionModal
                visible={modalFinIntervenion}
                onClose={() => setModalFinIntervention(false)}
                onConfirm={handleFinInterventionConfirm}
                title={'Fin Intervention'} />
        </SafeAreaView >

        // </View>

    )
}
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    imageContainer: {
        flex: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 35,
        height: 35,
        marginHorizontal: 5, // Acts as a "gap"
    },
    image: {
        width: width,
        height: height,
    },
    scrollStyle: {
        padding: 2,

    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        // padding: 2,
    },
    header: {
        alignItems: 'center',
        padding: 6,
        backgroundColor: '#f5f5f5',
    },
    clientNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    issueType: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 5,
    },
    interventionTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    timeLapseIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    interventionTime: {
        fontSize: 14,
        marginTop: 2,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    durationLabel: {
        fontSize: 14,
        marginRight: 5,
    },
    durationValue: {
        fontSize: 14,
    },
    sectionsListContainer: {
        height: '65%',
    },
    sectionsList: {
        flex: 1,
    },
    sectionHeader: {
        backgroundColor: '#4b6cb7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#3a5ba0',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 1,
    },
    sectionContent: {
        padding: 10,
        backgroundColor: 'white',
    },
    recordButton: {
        backgroundColor: '#FF4136',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    recordButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    cameraButton: {
        backgroundColor: '#0074D9',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    cameraButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#2ECC40',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    imageMenu: {
        width: 30,
        height: 30,
        alignSelf: 'center'
    },
    imageExpandMenu: {
        width: 20,
        height: 20,
        alignSelf: 'center'
    },
    bottomSection: {
        // marginTop: 'auto',
    },
    conventionalPrimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // padding: ,
    },
    conventionalPrimeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#4b6cb7',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 0,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
        height: 60,
        width: '100%',
        backgroundColor: '#f5f5f5',

    },
    footerSubmit: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 0,
        position: "relative",
        // bottom: 5,
        left: 0,
        right: 0,
        alignItems: "center",
        height: 50,
        width: '100%'
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        // 
    },
    footerIcon: {
        width: 30,
        height: 30,
        tintColor: '#3b5998',
    },
    footerButtonText: {
        fontSize: 14,
        marginTop: 2,
    },
    picker: {
        height: 50,
        width: "50%",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1
    },
    modalContent: {
        width: width,
        height: height,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 30,
        overflow: 'hidden',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    okButton: {
        // padding: 6,
        alignItems: 'center',
        // borderTopWidth: 1,
        borderTopColor: '#ddd',
        width: '100%'
    },
    okButtonText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    containerRapportVocal: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        flexDirection: 'column',
        width: '100%',
    },
    fileName: {
        fontSize: 16,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '50%',
    },
    iconButton: {
        padding: 8,
    },
    soundIcon: {
        width: 40,
        height: 40
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentPlayAudio: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    // playButton: {
    //     marginBottom: 24,
    // },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3F51B5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    pauseIcon: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    pauseBar: {
        width: 3,
        height: 15,
        backgroundColor: 'white',
        marginHorizontal: 3,
        borderRadius: 1,
    },
    playIcon: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 0,
        borderBottomWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'white',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
        marginLeft: 5,
    },
    stopButton: {
        backgroundColor: '#3F51B5',
        width: 40,
        height: 40,
        borderRadius: 20,
        // justifyContent: 'center',
        alignItems: 'center',

    },
    stopButtonInner: {
        width: 15,
        height: 15,
        backgroundColor: 'white',
    },
    progressContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    progressBg: {
        width: '100%',
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        position: 'relative',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#3F51B5',
        borderRadius: 2,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3F51B5',
        position: 'absolute',
        top: -4,
        marginLeft: -6,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    timeText: {
        color: '#666666',
        fontSize: 12,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 30,

    },
    replayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    replayText: {
        color: '#3F51B5',
        marginLeft: 5,
        fontWeight: '500',
    },

    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 14,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    signatureContainer: {
        position: 'relative',
        height: 150,
        // borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
    },
    signatureCanvas: {
        height: 150,
        width: '100%',
    },
    clearButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    clearButtonText: {
        fontSize: 20,
    },
    reportInput: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 6,
    },
    switchLabelCompeur: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    spacer: {
        height: 40,
    },
    indicesContainer: {
        marginBottom: 24,
    },
    indicesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    indexColumn: {
        flex: 1,
        marginHorizontal: 8,
    },
    centerIndicesContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    centerIndexColumn: {
        width: '100%',
        marginBottom: 24,
    },
    indexLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    inputCompteur: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#999',
        fontSize: 16,
        textAlign: 'center',
    },
    disabledInput: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#999',
        fontSize: 14,
        textAlign: 'center',
        color: '#888',
        backgroundColor: '#f0f0f0',
    },
    togglesContainer: {
        marginBottom: 24,
    },
    togglesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    centerTogglesRow: {
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 120,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    consumptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    consumptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    consumptionValue: {
        fontSize: 16,
    },
    headerCompteurs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        // backgroundColor: '#fff',
        // borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        // backgroundColor: 'red',
    },
    listContainer: {
        flexGrow: 1,
    },
    meterItem: {
        // backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    meterTitle: {
        fontSize: 16,
    },
    separatorCompteurs: {
        height: 1,
        backgroundColor: '#e0e0e0',
        width: '100%',
    },
    notificationBadge: {
        position: 'absolute',
        right: -3,
        top: -2,
        backgroundColor: '#E53935',
        borderRadius: 12,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    notificationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },

    canvasContainer: {
        flex: 1,
    },
    canvas: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    speechText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    buttonPlayerContainer: {
        // flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        // borderWidth: 1,
        alignItems: 'center'
    },
    devisSummaryContainer: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginVertical: 10,
    },
    devisSummaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#495057',
    },
    devisArticlesSummary: {
        marginBottom: 10,
    },
    devisSummaryLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6c757d',
        marginBottom: 5,
    },
    devisArticleText: {
        fontSize: 12,
        marginBottom: 5,
        color: '#495057',
        marginLeft: 10,
    },
    devisSummaryText: {
        fontSize: 12,
        marginBottom: 5,
        color: '#6c757d',
        marginLeft: 10,
    },
    devisEmptyText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
    }
})

export default FormulaireInterventionScreen;