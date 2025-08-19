import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../Components/Header';
import MapView, { PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';

interface MapScreenProps {
    navigation: any;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
    const [mapError, setMapError] = useState<string | null>(null);
    const [useGoogleMaps, setUseGoogleMaps] = useState(true);
    const [mapStatus, setMapStatus] = useState<string>('Initializing...');
    const [useSimpleMap, setUseSimpleMap] = useState(false);
    const [loadingEnabled, setLoadingEnabled] = useState(true);

    useEffect(() => {
        console.log('MapScreen mounted');
        console.log('PROVIDER_GOOGLE:', PROVIDER_GOOGLE);
        console.log('MapView component:', MapView);
        console.log('UrlTile component:', UrlTile);
        setMapStatus('Component loaded');
        
        // Auto-test OpenStreetMap after 3 seconds if Google Maps shows black screen
        const timer = setTimeout(() => {
            if (useGoogleMaps) {
                console.log('Auto-testing OpenStreetMap to check if issue is with Google Maps...');
                setUseGoogleMaps(false);
                setMapStatus('Auto-switched to OpenStreetMap for testing');
            }
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);

    const handleMapReady = () => {
        console.log('Map is ready!');
        console.log('Current map provider:', useGoogleMaps ? 'Google Maps' : 'OpenStreetMap');
        setMapError(null);
        setMapStatus('Map loaded successfully');
    };

    const handleMapError = (error: any) => {
        console.error('Map error occurred:', error);
        setMapError('Map error: ' + JSON.stringify(error));
        setMapStatus('Map error occurred');
    };

    const handleMapLoad = () => {
        console.log('Map load event fired');
        setMapStatus('Map load event fired');
    };

    const handleMapLoadError = (error: any) => {
        console.error('Map load error:', error);
        setMapError('Map load error: ' + JSON.stringify(error));
        setMapStatus('Map load error occurred');
    };

    const toggleMapProvider = () => {
        setUseGoogleMaps(!useGoogleMaps);
        setMapError(null);
        setMapStatus(`Switched to ${!useGoogleMaps ? 'Google Maps' : 'OpenStreetMap'}`);
    };

    const testGoogleMaps = () => {
        console.log('Testing Google Maps...');
        console.log('Current provider:', useGoogleMaps ? 'PROVIDER_GOOGLE' : 'Default');
        console.log('PROVIDER_GOOGLE value:', PROVIDER_GOOGLE);
        console.log('MapView component type:', typeof MapView);
        console.log('MapView component:', MapView);
        
        // Test if we can create a MapView instance
        try {
            const testMapView = MapView;
            console.log('MapView is available:', !!testMapView);
        } catch (error) {
            console.error('Error creating MapView:', error);
            setMapError('MapView creation failed: ' + error);
        }
        
        // Check for common Google Maps issues
        if (useGoogleMaps) {
            console.log('⚠️ If you see a black screen, the issue is likely:');
            console.log('1. Invalid/expired Google Maps API key');
            console.log('2. Maps SDK for Android not enabled in Google Cloud Console');
            console.log('3. Billing not enabled on Google Cloud project');
            console.log('4. API key restricted to wrong package name');
            console.log('5. Device missing Google Play Services');
            
            setMapStatus('Testing Google Maps... Check console for troubleshooting info');
        }
        
        // Test basic MapView creation
        try {
            console.log('Testing basic MapView creation...');
            const basicMapView = (
                <MapView
                    style={{ width: 100, height: 100 }}
                    initialRegion={{
                        latitude: 0,
                        longitude: 0,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }}
                />
            );
            console.log('Basic MapView created successfully:', !!basicMapView);
        } catch (error) {
            console.error('Error creating basic MapView:', error);
            setMapError('Basic MapView creation failed: ' + error);
        }
        
        setMapStatus('Testing Google Maps...');
    };

    const testApiKey = async () => {
        try {
            setMapStatus('Testing API key...');
            console.log('Testing Google Maps API key...');
            
            // Test the API key with a simple request
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/staticmap?center=Paris,France&zoom=10&size=400x400&key=AIzaSyBKK8p_qYhRUnaxMtZ2aDp0w-SZOlfNeSA`
            );
            
            if (response.ok) {
                console.log('✅ API key is valid! Response status:', response.status);
                setMapStatus('API key is valid!');
                setMapError(null);
            } else {
                console.log('❌ API key error. Response status:', response.status);
                const errorText = await response.text();
                console.log('Error details:', errorText);
                setMapStatus('API key error - check console');
                setMapError('API key error: ' + response.status);
            }
        } catch (error) {
            console.error('❌ Error testing API key:', error);
            setMapStatus('Error testing API key');
            setMapError('API key test failed: ' + error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header titleCom="CARTE" />
            <View style={styles.controlsContainer}>
                <Text style={styles.statusText}>Status: {mapStatus}</Text>
                <TouchableOpacity style={styles.toggleButton} onPress={toggleMapProvider}>
                    <Text style={styles.toggleButtonText}>
                        Switch to {useGoogleMaps ? 'OpenStreetMap' : 'Google Maps'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.testButton} onPress={testGoogleMaps}>
                    <Text style={styles.testButtonText}>Test Google Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.testButton, { backgroundColor: '#ff9800' }]} 
                    onPress={() => setUseSimpleMap(!useSimpleMap)}
                >
                    <Text style={styles.testButtonText}>
                        {useSimpleMap ? 'Use Complex Map' : 'Use Simple Map'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.testButton, { backgroundColor: '#9c27b0' }]} 
                    onPress={() => {
                        setLoadingEnabled(!loadingEnabled);
                        setMapStatus(`Loading ${loadingEnabled ? 'disabled' : 'enabled'} - check if map appears`);
                    }}
                >
                    <Text style={styles.testButtonText}>
                        {loadingEnabled ? 'Disable' : 'Enable'} Loading Indicator
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.testButton, { backgroundColor: '#607d8b' }]} 
                    onPress={testApiKey}
                >
                    <Text style={styles.testButtonText}>Test API Key</Text>
                </TouchableOpacity>
            </View>
            {mapError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{mapError}</Text>
                </View>
            )}
            <View style={styles.mapContainer}>
                {/* Test view to see if container is working */}
                <View style={styles.testView}>
                    <Text style={styles.testText}>Map Container Test - If you see this, container is working</Text>
                </View>
                
                {/* Conditional MapView rendering for testing */}
                {true ? (
                    useSimpleMap ? (
                        <View style={[styles.map, { backgroundColor: '#4CAF50' }]}>
                            <Text style={styles.simpleMapText}>Simple Map Test - Green Background</Text>
                            <Text style={styles.simpleMapText}>If you see this, the issue is with MapView</Text>
                        </View>
                    ) : (
                        <MapView
                            style={styles.map}
                            provider={useGoogleMaps ? PROVIDER_GOOGLE : undefined}
                            initialRegion={{
                                latitude: 48.8566,
                                longitude: 2.3522,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                            onMapReady={handleMapReady}
                            onMapLoaded={handleMapLoad}
                            loadingEnabled={loadingEnabled}
                            loadingIndicatorColor="#666666"
                            loadingBackgroundColor="#ffffff"
                        >
                            {!useGoogleMaps && (
                                <UrlTile
                                    urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maximumZ={19}
                                    tileSize={256}
                                />
                            )}
                        </MapView>
                    )
                ) : (
                    <View style={styles.alternativeMapView}>
                        <Text style={styles.alternativeText}>Alternative Map View (MapView disabled)</Text>
                    </View>
                )}
                
                {/* Fallback test view */}
                <View style={styles.fallbackView}>
                    <Text style={styles.fallbackText}>Fallback Test View</Text>
                    <Text style={styles.fallbackText}>If you see this, MapView is not rendering</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    controlsContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    statusText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    toggleButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 5,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    testButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    testButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#f44336',
    },
    errorText: {
        color: '#c62828',
        fontSize: 12,
        textAlign: 'center',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    testView: {
        height: 100,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    testText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    alternativeMapView: {
        height: 100,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    alternativeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    fallbackView: {
        height: 100,
        backgroundColor: '#ffeb3b', // Yellow background for fallback
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    fallbackText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    simpleMapText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default MapScreen;
