import { View, Text, TouchableOpacity, ImageBackground, Image, TextInput, StyleSheet, Alert, PermissionsAndroid, ActivityIndicator, BackHandler, StatusBar, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import InfoModal from '../Components/InfoModal';
import { LoginInputDTO, AuthenticationApi, Configuration, StringResultDTO } from '../../Application/ApiCalls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../Application/Services/apiServices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SqlLIteService } from '../../Application/Services/SqlLiteService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InterventionStateService } from '../../Application/Services/InterventionStateService';
import DeviceInfo from 'react-native-device-info';
import { useReferentiel } from '../../Infrastructure/Contexte/ReferentielContext';


const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigationRoutes = useNavigation();
  const [modalMessageVisible, setmodalMessageVisible] = useState(false);
  const [title, setTitle] = useState('Erreur');
  const [errorMessage, setErrorMessage] = useState("");
  const [loginResult, setLoginResult] = useState(true);
  const [loading, setLoading] = useState(false);

  // Add state for intervention status
  const [activeIntervention, setActiveIntervention] = useState<any>(null);
  const [showInterventionAlert, setShowInterventionAlert] = useState(false);

  // Get referentiel context
  const { refreshReferentielData } = useReferentiel();


  // Add useEffect to check for active interventions
  useEffect(() => {
    const checkActiveIntervention = async () => {
      try {
        const interventionInfo = await InterventionStateService.getCurrentInterventionInfo();
        if (interventionInfo?.isActive) {
          setActiveIntervention(interventionInfo);
          setShowInterventionAlert(true);
          console.log('Active intervention found:', interventionInfo);
        }
      } catch (error) {
        console.error('Error checking intervention status:', error);
      }
    };

    checkActiveIntervention();
  }, []);

  // Back button handling
  useEffect(() => {


    const backAction = () => {
      const { routes, index } = navigation.getState();
      const currentRoute = routes[index].name;

      if (currentRoute == "LoginScreen") {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const goToHomePage = async () => {
    setLoading(true);

    if (!matricule) {
      setErrorMessage('Merci de saisir Votre Matricule')
      setmodalMessageVisible(true)
      return;
    }

    if (!password) {
      setErrorMessage('Merci de saisir le mot de passe')
      setmodalMessageVisible(true)
      return;
    }

    try {
      // Create the LoginInputDTO object
      const loginInput: LoginInputDTO = {
        username: matricule,
        password: password,
      };
      console.log(loginInput);
      //   // Call the login API
      const response = await apiService.login(loginInput);
      console.log(response);

      // Check the response
      if (response.status === '10000') {
        const db = await SqlLIteService.getDBConnection();
        await SqlLIteService.createLoginInfoTable(db);
        await SqlLIteService.createImmeubleTable(db);
        await AsyncStorage.setItem('@token', response.value as string);

        // Perform sync check for immeubles
        try {
          console.log('🔄 Starting immeubles sync check...');

          // Create sync input with current timestamp and device info
          const syncInput = apiService.createCheckSyncInput(
            1, // Use current timestamp as sync identifier
            await getPersistentDeviceId() as string // Device identifier
          );
          console.log('Sync required response:', syncInput);
          // Check if sync is required
          const syncRequired = await apiService.checkSyncRequired(syncInput);
          console.log('Sync required response:', syncRequired);

          if (syncRequired.code === '10500') {
            console.log('✅ Sync is required, proceeding with sync...');

            // Confirm sync


            // Get immeubles to sync
            const immeublesToSync = syncRequired.result;
            console.log(immeublesToSync, 'immeublesToSync', syncRequired);

            if (immeublesToSync != null && immeublesToSync?.length > 0) {
              // Sync immeubles to local SQLite database
              const syncResult = await SqlLIteService.syncImmeubles(db, immeublesToSync as []);
              console.log('Sync result:', syncResult);

              // Store sync result in AsyncStorage for reference
              await AsyncStorage.setItem('@lastSyncResult', JSON.stringify({
                timestamp: Date.now(),
                inserted: syncResult.inserted,
                updated: syncResult.updated,
                errors: syncResult.errors
              }));
            }
            const syncInputConfirm = apiService.createCheckSyncInput(
              parseInt(syncRequired.message?.split('=')[1] as string), // Use current timestamp as sync identifier
              await getPersistentDeviceId() as string // Device identifier
            );
            const syncConfirmed = await apiService.confirmSync(syncInputConfirm);
            console.log('Sync confirmed response:', syncConfirmed);
          } else {
            console.log('ℹ️ No sync required at this time');
          }
        } catch (syncError) {
          console.error('❌ Sync error:', syncError);
          // Don't block login if sync fails
        }

        const rep = await apiService.getCountOfItems();
        await AsyncStorage.setItem('@nbrDrapeaux', rep.nbrDrapeaux?.toString() as string);
        await AsyncStorage.setItem('@nbrAlertes', rep.nbrAlertes?.toString() as string);
        await AsyncStorage.setItem('@nbrintervention', rep.nbrIntervention?.toString() as string);

        await AsyncStorage.setItem('@matricule', matricule as string);
        await AsyncStorage.setItem('@name', response.name as string);
        await SqlLIteService.insertLoginInfo(db, response);
        
        // Refresh referentiel data after successful login
        try {
          await refreshReferentielData();
          console.log('✅ Referentiel data refreshed on login');
        } catch (error) {
          console.error('❌ Error refreshing referentiel data:', error);
          // Don't block login if referentiel refresh fails
        }
        
        console.log("sync completed navigate");
        
        navigation.navigate(screenNames.HomeScreen as never) // Navigate to the main flow
      } else {
        setErrorMessage("Nom d'utilisateur ou mot de passe incorrect")
        setmodalMessageVisible(true)
      }


    } catch (error) {
      setLoading(false);
      // Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  // More efficient approach using timestamps
  const isOlderThan24Hours = (createdAt: any) => {
    const now = Date.now();
    const createdTimestamp = new Date(createdAt).getTime();
    const diffInMs = now - createdTimestamp;
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000; // 86400000 ms

    return diffInMs > twentyFourHoursInMs;
  };
  useEffect(() => {
    const getToken = async () => {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const db = await SqlLIteService.getDBConnection();

        let checkLoginInfoExist = await SqlLIteService.checkIfTableExists(db, 'loginInfo')
        console.log(checkLoginInfoExist);
        if (!checkLoginInfoExist) {
          return false
        }
        else {
          let lastConnection = await SqlLIteService.getLastRow(db)
          console.log(isOlderThan24Hours(lastConnection?.created_at), 'isOlderThan24Hours', lastConnection != null && isOlderThan24Hours(lastConnection?.created_at));
          
          if (lastConnection != null && isOlderThan24Hours(lastConnection?.created_at)) {
            // Last connection is older than 24 hours, user needs to reconnect
            console.log('Last connection is older than 24 hours, requiring reconnection');
            return false;
          } else if (lastConnection != null && !isOlderThan24Hours(lastConnection?.created_at)) {
            setLoading(true);
            setMatricule(lastConnection.username)
            await AsyncStorage.setItem('@token', lastConnection.value as string);
console.log(lastConnection.created_at, 'lastConnection');

            // Perform sync check for immeubles even on auto-login
            try {
              console.log('🔄 Starting immeubles sync check on auto-login...');
              const addressMac = await getPersistentDeviceId()
              // Create sync input with current timestamp and device info
              const syncInput = apiService.createCheckSyncInput(
                1, // Use current timestamp as sync identifier
                addressMac as string// Device identifier
              );
              console.log('Auto-login sync required response:', syncInput);
              // Check if sync is required
              const syncRequired = await apiService.checkSyncRequired(syncInput);
              console.log('Auto-login sync required response:', syncRequired);

              if (syncRequired.code === '10500') {
                console.log('✅ Auto-login sync is required, proceeding with sync...');
                const syncInputConfirm = apiService.createCheckSyncInput(
                  parseInt(syncRequired.message?.split('=')[1] as string), // Use current timestamp as sync identifier
                  addressMac as string// Device identifier
                );
                console.log(syncInputConfirm, 'input');

                // Confirm sync
                const syncConfirmed = await apiService.confirmSync(syncInputConfirm);
                console.log('Auto-login sync confirmed response:', syncConfirmed);

                if (syncConfirmed && syncConfirmed.code === 'success') {
                  // Get immeubles to sync
                  const immeublesToSync = await apiService.getImmeublesToSync(syncInput);
                  console.log('Auto-login immeubles to sync response:', immeublesToSync);

                  if (immeublesToSync && immeublesToSync.code === 'success' && immeublesToSync.result) {
                    console.log(`🔄 Auto-login: Found ${immeublesToSync.result.length} immeubles to sync`);

                    // Sync immeubles to local SQLite database
                    const syncResult = await SqlLIteService.syncImmeubles(db, immeublesToSync.result);
                    console.log('Auto-login sync result:', syncResult);

                    // Store sync result in AsyncStorage for reference
                    await AsyncStorage.setItem('@lastSyncResult', JSON.stringify({
                      timestamp: Date.now(),
                      inserted: syncResult.inserted,
                      updated: syncResult.updated,
                      errors: syncResult.errors
                    }));

                    console.log(`✅ Auto-login sync completed: ${syncResult.inserted} inserted, ${syncResult.updated} updated, ${syncResult.errors} errors`);
                  } else {
                    console.log('⚠️ Auto-login: No immeubles to sync or sync failed');
                  }
                } else {
                  console.log('⚠️ Auto-login: Sync confirmation failed');
                }
              } else {
                console.log('ℹ️ Auto-login: No sync required at this time');
              }
            } catch (syncError) {
              console.error('❌ Auto-login sync error:', syncError);
              // Don't block auto-login if sync fails
            }

            const rep = await apiService.getCountOfItems();
            console.log(rep, 'rep');
            console.log(lastConnection.username, 'lastConnection', lastConnection.name);
            
            
            await AsyncStorage.setItem('@nbrDrapeaux', rep.nbrDrapeaux?.toString() as string);
            await AsyncStorage.setItem('@nbrAlertes', rep.nbrAlertes?.toString() as string);
            await AsyncStorage.setItem('@nbrintervention', rep.nbrIntervention?.toString() as string);
            await AsyncStorage.setItem('@matricule', lastConnection?.username as string);
            await AsyncStorage.setItem('@name', lastConnection?.name as string);
            navigation.navigate(screenNames.HomeScreen as never)
          }
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };

    getToken();
  }, []);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPersistentDeviceId = async () => {
    try {
      // This gives you a unique ID that persists across app reinstalls
      const uniqueId = await DeviceInfo.getUniqueId();
      console.log('Persistent Device ID:', uniqueId);
      return uniqueId;
    } catch (error) {
      console.error('Error getting unique ID:', error);
      return null;
    }
  };

  return (

    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
      />
      <ImageBackground
        source={require('../../../assets/Images/loginBackground.jpg')}
        style={styles.backgroundImage}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/Images/DTPNGE.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>BIENVENUE</Text>

          <TextInput
            style={styles.input}
            placeholder="Matricule"
            placeholderTextColor="#aaa"
            value={matricule}
            onChangeText={setMatricule}
          />

          <View style={[styles.inputContainer]}>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
            >
              <Image
                source={showPassword ? require('../../../assets/Icons/Crossed-Eye.png') : require('../../../assets/Icons/Eye.png')}
                style={styles.eyeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* <View style={styles.checkboxContainer}>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe}
                  </TouchableOpacity>
                ) : (
                    <Text>CheckBox</Text>
                //   <CheckBox
                //     value={rememberMe}
                //     onValueChange={setRememberMe}
                //     tintColors={{ true: '#fff', false: '#aaa' }}
                //   />
                )}
                <Text style={styles.checkboxLabel}>Se souvenir de moi</Text>
              </View> */}

          <TouchableOpacity style={styles.loginButton} onPress={() => goToHomePage()}>
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" />

            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}


          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.sosButton}>
            {/* <Ionicons name="home" size={24} color="#fff" /> */}
            {/* <Text style={styles.sosText}>SOS</Text> */}
          </View>
          <Text style={styles.versionText}>V 1.0</Text>
        </View>
      </ImageBackground>
      <InfoModal
        titleModal={title}
        visible={modalMessageVisible}
        Message={errorMessage}
        onClose={() => setmodalMessageVisible(false)}
      />
      
      {/* Intervention Status Alert Modal
      <Modal
        visible={showInterventionAlert}
        transparent={true}
        animationType="fade"
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.interventionAlertContainer}>
            <View style={styles.interventionAlertHeader}>
              <Image
                source={require('../../../assets/Icons/timelapse.png')}
                style={styles.interventionAlertIcon}
              />
              <Text style={styles.interventionAlertTitle}>Intervention en cours</Text>
            </View>
            
            {activeIntervention && (
              <View style={styles.interventionAlertContent}>
                <Text style={styles.interventionAlertText}>
                  Une intervention est déjà en cours depuis {activeIntervention.startTime}
                </Text>
                
                <View style={styles.interventionDetailsContainer}>
                  <View style={styles.interventionDetailRow}>
                    <Text style={styles.interventionDetailLabel}>Intervention:</Text>
                    <Text style={styles.interventionDetailValue}>{activeIntervention.noIntervention}</Text>
                  </View>
                  
                  <View style={styles.interventionDetailRow}>
                    <Text style={styles.interventionDetailLabel}>Immeuble:</Text>
                    <Text style={styles.interventionDetailValue}>{activeIntervention.codeImmeuble}</Text>
                  </View>
                  
                  <View style={styles.interventionDetailRow}>
                    <Text style={styles.interventionDetailLabel}>Durée:</Text>
                    <Text style={styles.interventionDetailValue}>{activeIntervention.duration}</Text>
                  </View>
                </View>
                
                <Text style={styles.interventionAlertWarning}>
                  ⚠️ Vous allez reprendre cette intervention existante
                </Text>
              </View>
            )}
            
            <View style={styles.interventionAlertButtons}>
              <TouchableOpacity
                style={[styles.interventionAlertButton, styles.interventionAlertButtonSecondary]}
                onPress={() => setShowInterventionAlert(false)}
              >
                <Text style={styles.interventionAlertButtonText}>Continuer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.interventionAlertButton, styles.interventionAlertButtonPrimary]}
                onPress={() => {
                  setShowInterventionAlert(false);
                  // Optionally clear the intervention state if user wants to start fresh
                  // await InterventionStateService.clearInterventionState();
                }}
              >
                <Text style={styles.interventionAlertButtonText}>Reprendre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal> */}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  screenContainer: {
    height: '100%',
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 300,
    height: 100,
    opacity: 0.8
  },
  formContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 3,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#555',
  },
  checkboxLabel: {
    color: '#ccc',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  sosButton: {
    // backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    color: '#fff',
    fontSize: 12,
  },
  versionText: {
    color: '#fff',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  interventionAlertContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  interventionAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  interventionAlertIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  interventionAlertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  interventionAlertContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  interventionAlertText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  interventionDetailsContainer: {
    width: '100%',
    marginBottom: 10,
  },
  interventionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  interventionDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  interventionDetailValue: {
    fontSize: 14,
    color: '#333',
  },
  interventionAlertWarning: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  interventionAlertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  interventionAlertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '40%',
  },
  interventionAlertButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  interventionAlertButtonSecondary: {
    backgroundColor: '#ccc',
  },
  interventionAlertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
