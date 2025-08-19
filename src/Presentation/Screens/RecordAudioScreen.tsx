import { View, Text, TouchableOpacity, StyleSheet, Image, PermissionsAndroid, Platform, Alert, Button, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs'; // For file system access
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


const audioRecorderPlayer = new AudioRecorderPlayer();

const RecordAudioScreen = ({ route, navigation }) => {
  const [title, setText] = useState('Enregistrement');
  const [matricule, setMatricule] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(180); // 3 minutes in seconds
  const [recordTime, setRecordTime] = useState('00:00');
  const { noInterventionParam } = route.params

  useEffect(() => {
    const fetchmatricule = async () => {
      try {
        const mat = await AsyncStorage.getItem('@matricule')
        setMatricule(mat as string)
      } catch (err) {
        // setError('Failed to fetch data');
        console.error(err);
      } finally {
        // setLoading(false);
      }
    };
    fetchmatricule()

    const backAction = () => {
      const { routes, index } = navigation.getState();
      const currentRoute = routes[index].name;
      if (currentRoute == "RecoredAudioScreen") {
        navigation.goBack();
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
    let interval = null;

    if (isRecording && recordingTime > 0) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime - 1);
      }, 1000);
    }
    // requestPermissions();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingTime]);

  const formatDateString = (dateStr) => {
    if (!dateStr) return null;

    // If already in Date format, use appendToForm which will format it
    if (dateStr instanceof Date) {
      // Format as dd/mm/yyyy HH:mm:ss
      const day = String(dateStr.getDate()).padStart(2, '0');
      const month = String(dateStr.getMonth() + 1).padStart(2, '0');
      const year = dateStr.getFullYear();
      const hours = String(dateStr.getHours()).padStart(2, '0');
      const minutes = String(dateStr.getMinutes()).padStart(2, '0');
      const seconds = String(dateStr.getSeconds()).padStart(2, '0');

      return `${day}-${month}-${year}`;
    }

    // Check if already in correct format
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
      return dateStr; // Already formatted correctly
    }

    // Parse and format
    try {
      const date = new Date(dateStr);
      // Format code...
    } catch (e) {
      // Fallback to original
    }
  };
  const [fileName, setFileName] = useState(`recording_${formatDateString(new Date())}_${noInterventionParam}_${matricule}.amr`);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      console.log('stopRecord');

      stopRecording();
    } else {
      console.log('startrecord');

      startRecording();
    }
  };


  // record audio

  const [recordPath, setRecordPath] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('Not Recorded');
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {

        const audioCheck = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        return (
          grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions via Info.plist
  };

  // Start recording to cache
  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      setRecordingStatus('Permission Denied - Check Settings');
      console.log('Permission denied');
      return;
    }
    const timestamp = formatDateString(new Date());
    const fileName = `recording_${timestamp}_${noInterventionParam}__${matricule}.amr`;
    setFileName(fileName)
    const path = Platform.select({
      ios: `${RNFS.CachesDirectoryPath}/${fileName}`,
      android: `${RNFS.CachesDirectoryPath}/${fileName}`,
    });
    console.log('Recording path:', `${RNFS.CachesDirectoryPath}`, path);

    try {
      const uri = await audioRecorderPlayer.startRecorder(path);
      console.log('Recording started:', uri);
      setRecordPath(uri);
      setIsRecording(true);
      setRecordingStatus('Recording...');
    } catch (error) {
      setRecordingStatus('Failed to Start Recording');
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      navigation.goBack();
      navigation.navigate(screenNames.FormulaireInterventionScreen, { recordPath, status: recordingStatus });
      console.log('Recording stopped, file saved at:', result);


    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Start playback
  const startPlayback = async () => {
    if (!recordPath) {
      setRecordingStatus('No recording available to play');
      console.log('No recording available');
      return;
    }
    const fileExists = await RNFS.exists(recordPath);
    console.log('File exists:', fileExists);
    if (fileExists) {
      const fileInfo = await RNFS.stat(recordPath);
      console.log('File size:', fileInfo.size); // Check if file has content
    } else {
      setRecordingStatus('Recording Failed: File Not Found');
    }

    try {
      console.log('Playback started', recordPath);

      await audioRecorderPlayer.startPlayer(recordPath);
      setIsPlaying(true);
      setRecordingStatus('Playing...');
      console.log('Playback started');

      // Optional: Listen for playback completion
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          stopPlayback(); // Auto-stop when playback finishes
        }
      });
    } catch (error) {
      console.error('Failed to start playback:', error);
      setRecordingStatus('Playback Failed');
    }
  };
  // Stop playback
  const stopPlayback = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
      setRecordingStatus('Recording Saved Successfully');
      console.log('Playback stopped');
    } catch (error) {
      console.error('Failed to stop playback:', error);
      setRecordingStatus('Playback Stop Failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} />

      <View style={styles.content}>
        {/* Microphone Icon */}
        <View style={styles.micContainer}>
          <Image
            source={require('./../../../assets/Icons/mic.png')}
            style={styles.micIcon}
          />
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          <Text style={styles.fileNameText}>{fileName}</Text>
        </View>


        {/* Record Button */}
        <View>
          {!isRecording && <TouchableOpacity
            style={styles.recordButton}
            onPress={toggleRecording}
          >

            <View style={styles.recordButtonInner} />

          </TouchableOpacity>
          }
          {isRecording &&
            <View style={styles.containerStopCancelButton}>
              <TouchableOpacity
                onPress={toggleRecording}
              >
                <View style={styles.cancelButton}>
                  <View style={styles.xLine1} />
                  <View style={styles.xLine2} />
                </View>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.stopButton}
                onPress={toggleRecording}
              >
                <View style={styles.stopButtonInner} />

              </TouchableOpacity>
            </View>}
        </View>

      </View>
    </SafeAreaView >
  )
};

const styles = StyleSheet.create({
  container: {
    height: '100%'
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  micContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  micIcon: {
    width: 100,
    height: 150,
    tintColor: '#3b5998',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  fileNameText: {
    color: '#3b5998',
    marginTop: 10,
  },
  recordButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cc0000',
    marginBottom: 10,
  },
  recordButtonInner: {
    width: 15,
    height: 15,
    borderRadius: 20,
    backgroundColor: '#cc0000',
  },
  containerStopCancelButton: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  // Stop button style (blue circle with square)
  stopButton: {
    backgroundColor: '#3b5998',
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',

  },
  stopButtonInner: {
    width: 15,
    height: 15,
    backgroundColor: 'white',
  },
  cancelButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    // backgroundColor: '#3b5998',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine1: {
    position: 'absolute',
    width: 25,
    height: 3,
    backgroundColor: '#3b5998',
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    position: 'absolute',
    width: 25,
    height: 3,
    backgroundColor: '#3b5998',
    transform: [{ rotate: '-45deg' }],
  },

})


export default RecordAudioScreen;