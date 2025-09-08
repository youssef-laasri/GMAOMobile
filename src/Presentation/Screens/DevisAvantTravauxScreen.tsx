import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, PermissionsAndroid, Modal, Keyboard, BackHandler, Dimensions, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../Components/Header'
import { FlatList, Gesture, GestureDetector, GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { launchCamera } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import SignatureCanvas from 'react-native-signature-canvas';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ArticlesDevisScreen from './ArticlesDevisScreen';
import { useCart } from '../../Infrastructure/Contexte/ArticlesContext';
import { RepReglementPDADTO } from '../../Application/ApiCalls';
import { apiService } from '../../Application/Services/apiServices';
import { useReferentiel } from '../../Infrastructure/Contexte/ReferentielContext';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
// Sample data structure based on your JSON

export interface article {

    codeArticle: string,
    description: string,
    quantity: number,
    unitPrice: number,
    total: number,

}
const DevisAvantTravauxScreen = ({ route, navigation }) => {

    const [title, setText] = useState('Devis');
    const { navigate } = useNavigation();
    // Sample data based on the image
    const [data, setData] = useState<article[]>([]);
    const { cart, removeItem, updateQuantity, clearCart, cartTotal } = useCart();

    // Get referentiel data from context
    const { getReferentielData, isOffline, lastSyncTime } = useReferentiel();
    const listModeRegelemnt = getReferentielData('modeReglement') || [];

    useEffect(() => {


        const backAction = () => {
            const { routes, index } = navigation.getState();
            const currentRoute = routes[index].name;
            if (currentRoute == "DevisAvantTravauxScreen" && screen == "ConfirmDevis") {
                // navigation.goBack();
                setScreen('AddArticles')
                return true;
            }
            if (currentRoute == "DevisAvantTravauxScreen" && screen == "AddArticles") {
                navigation.goBack();
                // setScreen('AddArticles')
                return false;
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setData(cart)
    }, [navigation, []]);


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
    const calculateTotals = (data, taxRate = 0.1) => {
        // Calculate total HT (before tax) by summing all line item totals
        const totalHT = data.reduce((sum, item) => {
            // Verify each line item's total is correct (quantity * unitPrice)
            const calculatedTotal = item.quantity * item.unitPrice;

            // Optional: You can add validation to ensure the stored total matches the calculated total
            if (Math.abs(calculatedTotal - item.total) > 0.01) {
                console.warn(`Warning: Item total mismatch for "${item.description}"`);
                console.warn(`Calculated: ${calculatedTotal}, Stored: ${item.total}`);
            }

            return sum + calculatedTotal;
        }, 0);

        // Round to 2 decimal places to avoid floating point issues
        const roundedTotalHT = parseFloat(totalHT.toFixed(2));

        // Calculate TVA (tax)
        const tva = parseFloat((roundedTotalHT * taxRate).toFixed(2));

        // Calculate total TTC (including tax)
        const totalTTC = parseFloat((roundedTotalHT + tva).toFixed(2));

        return {
            totalHT: roundedTotalHT,
            tva,
            totalTTC
        };
    };

    const totals = calculateTotals(data, 0.1);

    function goToListArticles() {
        navigate(screenNames.ArticlesDevisScreen)
    }

    function validateDevis() {
        // Prepare the data to pass back
        const devisData = {
            articles: data,
            imageRapportDevis: imageRapport,
            signataire: Signataire,
            signatureDevis: signature,
            modeReglement: paymentMode,
            image: image // Photo of the devis
        };
        console.log(devisData, 'devisData');

        // Pass the data back to the previous screen using goBack with params
        // navigation.goBack();
        navigate(screenNames.FormulaireInterventionScreen, { devisData })

        // Use setTimeout to ensure the previous screen is ready to receive params
        setTimeout(() => {
            // Emit an event or use a callback to pass the data
            // For now, we'll use AsyncStorage as a temporary solution
            AsyncStorage.setItem('@devisData', JSON.stringify(devisData));
        }, 100);
    }

    // Handle long press to remove item
    const handleLongPress = (item) => {
        Alert.alert(
            "Supprimer l'article",
            `Etes vous sur de supprimer ${item.description}?`,
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "OUI",
                    onPress: () => removeItem(item.codeArticle),
                    style: "destructive"
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onLongPress={() => handleLongPress(item)}
            delayLongPress={1000} onPress={() => openQuantiteModal(item)}>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.priceRow}>
                <Text style={styles.quantity}>{item.quantity} x {item.unitPrice.toFixed(2)} €</Text>
                <Text style={styles.total}>{item.total.toFixed(2)} €</Text>
            </View>
        </TouchableOpacity>
    );

    const [signature, setSignature] = useState(null);
    const [paymentMode, setPaymentMode] = useState('NON RÉGLÉ');
    const [image, setImage] = useState(null);
    const signatureRef = useRef();
    const [Signataire, setSignataire] = useState('')
    // Handle signature clear
    const handleClear = () => {
        signatureRef.current.clearSignature();
        setSignature(null);
    };

    // Handle signature save
    const handleSignature = (signature) => {
        console.log(signature, 'signature canvas');

        setSignature(signature);
        console.log(signature, 'signature');

    };

    // Handle image selection
    const handleImagePick = () => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                Alert.alert('Error', response.errorMessage);
            } else {
                const uri = response.assets[0].uri;
                setImage(uri);
            }
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!signature) {
            Alert.alert('Erreur', 'Veuillez fournir une signature.');
            return;
        }
        if (!image) {
            Alert.alert('Erreur', 'Veuillez ajouter une photo.');
            return;
        }
        Alert.alert('Succès', 'Devis validé avec succès !');
        // Here you can add logic to save the signature, payment mode, and image
    };
    const [screen, setScreen] = useState('AddArticles');
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [imageRapport, setImageRapport] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [numColumns, setNumColumns] = useState(3);
    const [quantite, setQuantite] = useState(0);
    const [visibleModal, setVisibleModal] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false); 
    
    const handleEnd = () => {
        setIsDrawing(false)
        signatureRef.current.readSignature();
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
    useEffect(() => {
        if (route.params?.photoUri && route.params?.idSection) {
            console.log(route.params, 'jhfhjldgfghfhg');

            const { photoUri, idSection } = route.params;

            setImageRapport([...imageRapport, photoUri]);
        }
    }, [route.params]);
    const openCamera = () => {
        requestCameraPermission()
        // const options = {
        //     mediaType: "photo",
        // };

        // launchCamera(options, (response) => {
        //     if (response.didCancel) {
        //         console.log("User cancelled camera");
        //     } else if (response.errorMessage) {
        //         console.log("Camera Error: ", response.errorMessage);
        //     } else {
        //         setImageRapport([...imageRapport, response.assets[0].uri]);

        //     }
        // });
        let idSection = 'DevisAvantTravaux'
        navigation.navigate('VisionCamera', { idSection });

    }

    const toggleSection = () => {
        setIsExpanded(!isExpanded)

    };
    const [itemSelected, setItemSelected] = useState<article>({})
    function openQuantiteModal(item) {
        setItemSelected(item)
        setVisibleModal(true)
    }

    function updateQuantityLocal(item) {
        updateQuantity(item.codeArticle, quantite)
        setData(cart)
        setVisibleModal(false)
    }


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
    const [photo, setPhoto] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [idSectio, setidSectio] = useState(null);
    function openModal(idSection, image) {
        console.log(image, idSection, 'lqskjdflksjdlkfjslkdfj');

        setidSectio(idSection);
        setModalVisible(true);
        setPhoto(image);
        console.log(photo, idSectio, 'lqskjdflksjdlkfjslkdfj');

    }
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

            setImageRapport(prev => prev.filter(uri => !photoUri.includes(uri)));

            setModalVisible(false)

        }
    };
    return (
        <SafeAreaView>
            {screen == "AddArticles" && (
                <View style={styles.container}>
                    <Header titleCom={title} />
                    <View style={styles.content}>

                        <FlatList
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            style={styles.list}
                        />
                    </View>




                    <View>

                        {/* Totals section */}
                        <View style={styles.totalsContainer}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total HT</Text>
                                <Text style={styles.totalValue}>{totals.totalHT.toFixed(2)} €</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>TVA (10%)</Text>
                                <Text style={styles.totalValue}>{totals.tva.toFixed(2)} €</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total TTC</Text>
                                <Text style={styles.totalValue}>{totals.totalTTC.toFixed(2)} €</Text>
                            </View>
                        </View>

                        <View style={styles.footer}>

                            <TouchableOpacity style={styles.footerButton} onPress={() => goToListArticles()}>
                                <Image
                                    source={require('./../../../assets/Icons/add.png')}
                                    style={styles.footerIcon}
                                />
                                {/* <Text style={styles.footerButtonText}>Détail</Text> */}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerButton} onPress={() => setScreen('ConfirmDevis')}>
                                <Image
                                    source={require('./../../../assets/Icons/done.png')}
                                    style={styles.footerIcon}
                                />
                                {/* <Text style={styles.footerButtonText}>Fin</Text> */}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {
                screen == "ConfirmDevis" && (
                    <View>
                        <View style={styles.container}>
                            <Header titleCom={title} />
                            <View style={styles.content}>
                                <View>
                                    <View>
                                        <View style={styles.inputRow}>
                                            <Text style={styles.inputLabel}>Signataire : </Text>
                                            <TextInput
                                                style={styles.inputValue}
                                                placeholder="Saisir Signataire"
                                                value={Signataire}
                                                onChangeText={setSignataire}
                                            />
                                        </View>
                                        {/* <Text><Text style={styles.label}> :</Text> Ahmed Ouardi </Text> */}
                                    </View>
                                    {/* Signature Section */}
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

                                    {/* Payment Mode Section */}
                                    <View style={styles.conventionalPrimeContainer}>
                                        <Text style={styles.label}>Mode de règlement :</Text>
                                        <Picker
                                            selectedValue={paymentMode}
                                            onValueChange={(itemValue) => setPaymentMode(itemValue)}
                                            style={styles.picker}
                                        >
                                            {listModeRegelemnt.map((mode) => (
                                                <Picker.Item key={mode.code} label={mode.designation!} value={mode.code} />
                                            ))}
                                        </Picker>
                                    </View>

                                    {/* Image Upload Section */}

                                    <View>
                                        <TouchableOpacity
                                            style={styles.sectionHeader}
                                            onPress={() => toggleSection()}
                                        >
                                            <View style={styles.sectionTitleContainer}>
                                                <Image style={[styles.imageExpandMenu, { transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }]} source={require('../../../assets/Icons/expand_arrow.png')} />
                                                <Text style={styles.sectionTitle}>DEVIS AVANT TRAVAUX</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => openCamera()}>
                                                <Image style={styles.imageMenu}
                                                    source={require('../../../assets/Icons/camera.png')} />
                                            </TouchableOpacity>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View style={styles.sectionContent}>

                                                <FlatList
                                                    data={imageRapport}
                                                    numColumns={numColumns}
                                                    renderItem={({ item }) => (
                                                        <TouchableOpacity onPress={() => openModal('DevisAvantTravaux', item)}>
                                                            <Image source={{ uri: item }} style={{ width: 100, height: 100, marginTop: 10, marginRight: 10 }} />
                                                        </TouchableOpacity>
                                                    )}
                                                />

                                            </View>)}
                                    </View>
                                </View>
                                {/* Validate Button */}
                                <TouchableOpacity style={styles.footerButton} onPress={() => validateDevis()}>
                                    <Image
                                        source={require('./../../../assets/Icons/done.png')}
                                        style={styles.footerIcon}
                                    />
                                    <Text style={styles.footerButtonText}>Valider</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }
            <Modal
                visible={visibleModal}
                transparent={true}
                animationType="fade"
            >
                <SafeAreaView style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.modalTitle}>
                            <Text style={styles.modalTitle}> {itemSelected.description} </Text>
                        </View>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputLabel}>Quantité : </Text>
                            <TextInput
                                style={styles.inputValue}
                                placeholder="Saisir quantité"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={quantite}
                                onChangeText={setQuantite}
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setVisibleModal(false)}
                            >
                                <Text style={styles.buttonText}>ANNULER</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={() => updateQuantityLocal(itemSelected)
                                }
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
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
        </SafeAreaView >
    )
};
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        height: '100%',

    },
    image: {
        width: width,
        height: height,
    },
    imageContainer: {
        flex: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        // alignItems: 'center',
        // paddingVertical: 40,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 0,
        // position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: "center",
        height: 50,
    },
    footerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    footerIcon: {
        width: 35,
        height: 35,
        tintColor: '#3b5998',
    },
    footerButtonText: {
        fontSize: 16,
        marginTop: 4,
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        marginTop: 8,
        paddingHorizontal: 6
    },
    description: {
        fontSize: 14,
        // fontWeight: 'bold',
        marginBottom: 9,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quantity: {
        fontSize: 13,
        color: '#333',
    },
    total: {
        fontSize: 14,
        // fontWeight: 'bold',
    },
    totalsContainer: {

        padding: 5,
        marginBottom: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 14,
        // fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 14,
        // fontWeight: 'bold',
    },
    section: {
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
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
    picker: {
        height: 100,
        width: '60%',
    },
    imageButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    // imageButtonText: {
    //     fontSize: 20,
    //     color: '#fff',
    // },
    // image: {
    //     width: 100,
    //     height: 200,
    //     marginTop: 10,
    // },
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
    conventionalPrimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
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
    icon: {
        width: 35,
        height: 35,
        marginHorizontal: 5, // Acts as a "gap"
    },
})




export default DevisAvantTravauxScreen;