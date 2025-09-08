import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { SqlLIteService } from '../../Application/Services/SqlLiteService';
import Loader from '../Components/loader';
import { ImmeubleDTO, ImmeubleInfoDTO } from '../../Application/ApiCalls';
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../../Application/Services/apiServices-enhanced';

export default function AstreinteScreen() {
  const [title, setText] = useState('Immeubles');
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);  // Percentage loading
  const [totalItems, setTotalItems] = useState(0); // Total number of items to load
  const [currentPage, setCurrentPage] = useState(1);
  const [PrevcurrentPage, setPrevCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [immeubles, setImmeubles] = useState<Array<ImmeubleDTO>>([]);
  const itemsPerPage = 400;
  const fetchAndStoreImmeubles = async () => {
    const db = await SqlLIteService.getDBConnection();
    let page = 1;
    let hasMorePages = true;
    let total = 0;
    let allItems: any[] = [];

    try {

      let checkImmeubleExist = await SqlLIteService.checkIfTableExists(db, 'immeubles')
      console.log(checkImmeubleExist);
      if (!checkImmeubleExist) {
        console.log('gfjfkjhfljhfjfjkfkjfkjkjfjhfjhhf');
        
        await SqlLIteService.createImmeubleTable(db);
        const getNbrOfImmeubles = await apiService.getImmeublesPagination(page, 1);
        while (hasMorePages) {

          const res = await apiService.getImmeublesPagination(page, itemsPerPage);

          const items = res?.result || [];

          if (items.length > 0) {
            if (total === 0) total = res.nbrItems || 0;

            // Store in memory (optional)
            allItems.push(...items);

            // Insert into DB
            await Promise.all(items.map(item => SqlLIteService.insertImmeuble(db, item.immeubleInfo)));
            const newProgress = Math.round((page * itemsPerPage / total) * 100);
            console.log(newProgress, ' ', page * itemsPerPage);

            setProgress(newProgress > 100 ? 100 : newProgress);

            page += 1;
          } else {
            hasMorePages = false;
          }

        }
        setImmeubles(allItems); // Or update gradually if needed
        setProgress(100);
        setLoading(false);
      }
    } catch (error) {
      setHasMore(false);
      console.error("Error fetching/storing:", error);
    } finally {

    }
  };

  const fetchImmeublesFromSQLlITE = async (nbrOfItems) => {
    const db = await SqlLIteService.getDBConnection();
    let page = 0;
    let hasMorePages = true;
    let total = 0;
    let allItems: any[] = [];

    try {
      while (hasMorePages) {

        const res = await SqlLIteService.getImmeubles(db, page * itemsPerPage, itemsPerPage);

        const items = res || [];
        if (allItems.length < nbrOfItems) {
          if (total === 0) total = nbrOfItems || 0;

          // Store in memory (optional)
          allItems.push(...items);

          const newProgress = Math.round((page * itemsPerPage / total) * 100);
          setProgress(newProgress > 100 ? 100 : newProgress);
          page += 1;
        }
        else {
          hasMorePages = false;
        }

      }
      setImmeubles(allItems); // Or update gradually if needed
      setProgress(100);
      setLoading(false);
    } catch (error) {
      setHasMore(false);
      console.error("Error fetching/storing:", error);
    } finally {

    }
  };

  useEffect(() => {
    fetchAndStoreImmeubles();
  }, [immeubles]);
  useEffect(() => {

    const loadInitialData = async () => {
      const db = await SqlLIteService.getDBConnection();
      let checkImmeubleExist = await SqlLIteService.checkIfTableExists(db, 'immeubles')
      setLoading(true);
      if (checkImmeubleExist) {
        let NbrOfimm = await SqlLIteService.getNbrsOfImmeubles(db)
        console.log(NbrOfimm);
        if(NbrOfimm == 0){
          await SqlLIteService.deleteTable(db, 'immeubles');
          fetchAndStoreImmeubles();
        }
        if (NbrOfimm > 0) {
          try {
            const db = await SqlLIteService.getDBConnection();
            fetchImmeublesFromSQLlITE(NbrOfimm)
          } catch (error) {
            console.error("Error loading initial data:", error);
            setLoading(false);
          }
        }
      }
    };

    loadInitialData();
  }, []);
  const { navigate } = useNavigation();
  function goToDetail(codeImmeuble: string) {
    navigate(screenNames.DetailInterventionScreen, {
      codeImmeuble: codeImmeuble
    })
  }

  const filteredData = immeubles.filter(item => {
    const searchLower = searchText.toLowerCase();
    return (
      item.immeubleInfo?.code?.toLowerCase().includes(searchLower) ||
      item.immeubleInfo?.adresse?.toLowerCase().includes(searchLower)
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => goToDetail(item.immeubleInfo?.code)}>
      {item.immeubleInfo?.vingtquatre == 'Oui' && (<Text style={{ backgroundColor: '#475c9f', width: 7 }}></Text>)}
      {item.immeubleInfo?.vingtquatre == 'Non' && (<Text style={{ width: 7 }}></Text>)}
      <View style={{ padding: 5 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.immeubleInfo?.code}</Text>
        <Text>{item.immeubleInfo?.adresse}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} />

      <View style={styles.searchContainer}>
        <Image style={styles.searchIcon}
          source={require('../../../assets/Icons/search.png')} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filtre"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {loading && (
        <View style={styles.loaderContainer}>

          <Loader />
          <Text style={styles.textChargement}>Chargement {progress}%</Text>
        </View>
      )}
      {!loading && (immeubles.length == 0 || immeubles.length == undefined ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas d'immeuble
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => item.immeubleInfo?.code ?? index.toString()}
            renderItem={renderItem}
            onEndReachedThreshold={0.5} // Load more when 50% from bottom
          />
        </View>
      )
      )}
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
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    padding: 2,
  },
  date: {
    padding: 2,
    fontSize: 14,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#DDD',
    marginLeft: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    padding: 16,
  },
  navButton: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
  },
  loaderContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 150
  },
  textChargement: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
})