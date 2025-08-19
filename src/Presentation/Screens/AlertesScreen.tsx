import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header'
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { apiService } from '../../Application/Services/apiServices';
import { AlerteDTO } from '../../Application/ApiCalls';
import Loader from '../Components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlertesScreen() {
  const [title, setText] = useState('ALERTES');

  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AlerteDTO[]>([]);
  useEffect(() => {
    // Fetch data on screen load
    const fetchData = async () => {
      try {
        const response = apiService.getAlertes();
        console.log(await response,'response');
        
        const json = (await response).result

        setData(json as []);
        console.log(data,'data');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const filteredData =  data.filter(item => {
      const searchLower = searchText.toLowerCase();
      return (
        item.info_Immeuble?.codeImmeuble?.toLowerCase().includes(searchLower) ||
        item.info_Intervention?.article?.toLowerCase().includes(searchLower) ||
        item.personnel?.nomInterv?.toLowerCase().includes(searchLower) ||
        item.personnel?.prenomInterv?.toLowerCase().includes(searchLower)
      );
    });

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.code}>{item.info_Immeuble?.codeImmeuble}</Text>
        <Text style={styles.description}>{item.info_Intervention?.article}</Text>
        <Text style={styles.description}>{item.personnel?.nomInterv} {item.personnel?.prenomInterv}</Text>
        <Text style={styles.date}>{item.info_Intervention?.dateRealise}</Text>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} />
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
      { !loading && (data.length == 0 || data.length == undefined ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas d'alerte
          </Text>
        </View>
      ) : (
        <View>
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
          /></View>
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
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    height: '100%',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold'
  }
})