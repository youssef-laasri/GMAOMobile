import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../Components/Header';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { apiService } from '../../Application/Services/apiServices';
import { DrapeauxOutput } from '../../Application/ApiCalls/generated/models';
import Loader from '../Components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InterventionApi, Configuration, DeleteDrapeauxInput } from '../../Application/ApiCalls/generated';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DrapeauxScreen() {
  const [title, setText] = useState('DRAPEAUX');

  const [searchText, setSearchText] = useState('');

  const [data, setData] = useState<DrapeauxOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    // Fetch data on screen load
    const fetchData = async () => {
      try {
        const response = apiService.getDrapeaux();
        console.log(response, 'sdsds');

        const json = (await response).result;
        setData(json as []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.codeImmeuble?.toLowerCase().includes(searchLower) ||
      item.designation?.toLowerCase().includes(searchLower) ||
      item.dateRealise?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedItems(new Set());
  };

  const handleItemSelect = (itemId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Aucune sélection', 'Veuillez sélectionner au moins un élément à supprimer.');
      return;
    }

    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer ${selectedItems.size} élément(s) sélectionné(s) ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        Alert.alert('Erreur', 'Token d\'authentification non trouvé.');
        return;
      }

      // Use the same base URL as in apiServices
      const BASE_URL = "https://gmao.groupe-dt.fr";
      const interventionApi = new InterventionApi(new Configuration({
        basePath: BASE_URL,
      }));

      console.log('🗑️ Starting deletion of items:', Array.from(selectedItems));
      console.log('🔑 Using token:', token ? `Present (${token.substring(0, 10)}...)` : 'Missing');
      console.log('🌐 Base URL:', BASE_URL);

      // Create the delete input with all selected items
      const deleteInput: DeleteDrapeauxInput = {
        noIntervention: Array.from(selectedItems)
      };

      console.log('📦 Delete input:', deleteInput);
      console.log('📦 Delete input JSON:', JSON.stringify(deleteInput));

      // Try the generated API client first
      let result;
      try {
        result = await interventionApi.apiInterventionDeleteDrapeauPost({
          token: token,
          deleteDrapeauxInput: deleteInput,
        });
        console.log('✅ Delete result (API client):', result);
      } catch (apiError) {
        console.log('⚠️ API client failed, trying direct fetch:', apiError);

        // Fallback to direct fetch
        const response = await fetch(`${BASE_URL}api/Intervention/DeleteDrapeau?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deleteInput),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        result = await response.json();
        console.log('✅ Delete result (direct fetch):', result);
      }

      // Check if the result indicates success
      if (result.status === '10000') {
        // Remove deleted items from local state
        setData(prevData => prevData.filter(item => !selectedItems.has(item.noIntervention as string)));

        // Reset selection and exit delete mode
        setSelectedItems(new Set());
        setIsDeleteMode(false);
        const response = apiService.getDrapeaux();
        console.log(response, 'sdsds');

        const json = (await response).result;
        setData(json as []);
      } else {
        throw new Error('La réponse du serveur indique un échec de la suppression.');
      }

    } catch (error: any) {
      console.error('❌ Error deleting items:', error);

      // Provide more specific error messages
      let errorMessage = 'Une erreur est survenue lors de la suppression.';

      if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      } else if (error.status) {
        errorMessage = `Erreur HTTP ${error.status}: ${error.statusText || 'Erreur de communication'}`;
      } else if (error.response) {
        // Handle response errors
        const status = error.response.status;
        const statusText = error.response.statusText;
        errorMessage = `Erreur HTTP ${status}: ${statusText}`;

        // Try to get more details from response body
        if (error.response.data) {
          console.log('Response data:', error.response.data);
          if (typeof error.response.data === 'string') {
            errorMessage += ` - ${error.response.data}`;
          } else if (error.response.data.message) {
            errorMessage += ` - ${error.response.data.message}`;
          }
        }
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = ({ item }: { item: DrapeauxOutput }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => isDeleteMode ? handleItemSelect(item.noIntervention as string) : null}
      disabled={!isDeleteMode}
    >
      <View style={styles.itemContent}>
        {isDeleteMode && (
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              selectedItems.has(item.noIntervention as string) && styles.checkboxSelected
            ]}>
              {selectedItems.has(item.noIntervention as string) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </View>
        )}
        <View style={styles.itemTextContainer}>
          <Text style={styles.code}>{item.codeImmeuble}</Text>
          <Text style={styles.description}>{item.designation}</Text>
          <Text style={styles.date}>{item.dateRealise}</Text>
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} onDeleteModeToggle={handleDeleteModeToggle} />
      {loading && (<Loader />)}

      {/* Search Bar    */}

      {!loading && (<View style={styles.searchContainer}>
        {/* <Icon name="comments" size={20} color="#999" style={styles.searchIcon} /> */}
        <Image style={styles.searchIcon}
          source={require('../../../assets/Icons/search.png')} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filtre"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>)}
      {!loading && isDeleteMode && selectedItems.size > 0 && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteSelected}
            disabled={isDeleting}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting ? 'Suppression...' : `Supprimer (${selectedItems.size})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && (<FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.noIntervention as string}
        style={styles.list}
      />)}
    </SafeAreaView>

  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  searchIcon: {
    marginTop: 8,
    marginRight: 4,
    width: 25,
    height: 25,
  },
  searchInput: {
    flex: 1,
    height: 35,
    fontSize: 16,
    borderBottomWidth: 1,
    // borderBottomColor : '#475c9f',
    paddingBottom: 3, // Reduce space inside input
  },
  list: {
    flex: 1,
  },
  item: {
    backgroundColor: '#FFF',
  },
  itemContent: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTextContainer: {
    flex: 1,

  },
  code: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: 'black',
    fontSize: 14,
    padding: 2,
  },
  date: {
    color: 'black',
    padding: 2,
    fontSize: 14,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginLeft: 1,
  },
  deleteButtonContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    padding: 16,
  },
  navButton: {
    alignItems: 'center',
  }
})