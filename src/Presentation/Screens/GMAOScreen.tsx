import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../Components/Header';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { apiService } from '../../Application/Services/apiServices';
import { InterventionPlanningDTO, PlanningDTOOutput } from '../../Application/ApiCalls';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { useNavigation } from '@react-navigation/native';
import Loader from '../Components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GMAOScreen() {
  const [title, setText] = useState('GMAO');
  const [searchText, setSearchText] = useState('');
  const [rotated, setRotated] = useState(false);
  const { navigate } = useNavigation();

  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');

  // const [filteredData, setFilteredData] = useState<InterventionPlanningDTO>();

  const [notificationsItems, setNotificationsItems] = useState<InterventionPlanningDTO[]>([]);

  const fetchDataPlanning = async () => {
    try {
      const response = await apiService.getGMAO();;
      const json = await response.result;
      setNotificationsItems(json?.interventionEnAttente as [])
      setLoading(false)
    } catch (err) {
      // setError('Failed to fetch data');
      console.error(err);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataPlanning()
  }, [])

  const [sortBy, setSortBy] = useState('date');
  // Separate filter function
  const filterData = (data, searchTerm) => {
    if (!searchTerm) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return (
        item.codeImmeuble?.toLowerCase().includes(searchLower) ||
        item.designation?.toLowerCase().includes(searchLower) ||
        item.datePrevu?.toLowerCase().includes(searchLower)
      );
    });
  };

  const parseDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === '01/01/0001 00:00:00') {
      return new Date('1900-01-01'); // Default for invalid dates
    }

    try {
      // Split date and time parts
      const [datePart, timePart] = dateTimeString.split(' ');

      if (!datePart) return new Date('1900-01-01');

      // Parse date part (dd/mm/yyyy)
      const [day, month, year] = datePart.split('/');

      if (!day || !month || !year) return new Date('1900-01-01');

      // Parse time part (HH:mm:ss) - optional
      let hours = '00', minutes = '00', seconds = '00';
      if (timePart) {
        const timeParts = timePart.split(':');
        hours = timeParts[0] || '00';
        minutes = timeParts[1] || '00';
        seconds = timeParts[2] || '00';
      }

      // Create date object
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );

      return isNaN(date.getTime()) ? new Date('1900-01-01') : date;
    } catch (error) {
      return new Date('1900-01-01');
    }
  };

  // Separate sort function
  const sortData = (data, sortField, order) => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        // Handle special date case
        if (a.datePrevu?.startsWith('01/01/0001') && b.datePrevu?.startsWith('01/01/0001')) return 0;
        if (a.datePrevu?.startsWith('01/01/0001')) return 1;
        if (b.datePrevu?.startsWith('01/01/0001')) return -1;

        const dateA = parseDateTime(a.datePrevu);
        const dateB = parseDateTime(b.datePrevu);

        comparison = dateA - dateB;
      }
      else if (sortField === 'code') {
        comparison = (a.codeImmeuble || '').localeCompare(b.codeImmeuble || '');
      }
      else if (sortField === 'designation') {
        comparison = (a.designation || '').localeCompare(b.designation || '');
      }

      return order === 'asc' ? comparison : -comparison;
    });
  };

  // Combined data processing using useMemo
  const processedData = useMemo(() => {
    const filtered = filterData(notificationsItems, searchText);
    const sorted = sortData(filtered, sortBy, sortOrder);
    console.log(sorted, 'ikgkjg');

    return sorted;
  }, [notificationsItems, searchText, sortBy, sortOrder]);

  // Individual action handlers
  const handleSearch = (text) => {
    setSearchText(text);
  };

  const handleSort = (field) => {
    console.log(field, '999999999999999');
    setRotated(!rotated)
    if (sortBy === field) {
      // Toggle order if same field
      console.log(sortBy, '999999999999999');
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      console.log(sortOrder, '999999999999999');
    } else {
      // New field, default to ascending

      setSortBy(field);
      setSortOrder('asc');
    }
  };
  function goToDetail(noIntervention: string) {
    navigate(screenNames.DetailInterventionScreen, {
      noInterventionParam: noIntervention
    })
  }

  const renderNotification = (notification: any) => {
    return (
      <TouchableOpacity
        key={notification.noIntervention}
        style={styles.notificationContainer}
        onPress={() => goToDetail(notification.noIntervention)}
      >
        <View style={styles.notification}>
          <Text style={styles.buildingCode}>{notification.codeImmeuble}</Text>
          <Text style={styles.address}>{notification.adressImmeuble}</Text>
          <Text style={styles.issue}>{notification.designation}</Text>
          <Text style={styles.date}>{notification.datePrevu === '01/01/0001 00:00:00' ? '*****' : notification.datePrevu}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const renderTabContent = () => {
    return (
      <ScrollView >
        <SafeAreaView style={styles.container}>
          {notificationsItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {"Pas d'intervention GMAO"}
              </Text>
            </View>
          ) : (
            <View>
              {processedData.map(notification => renderNotification(notification))}
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} />
      {loading && (<Loader />)}


      {!loading && (
        <View style={styles.searchContainer}>
          <Image style={styles.searchIcon}
            source={require('../../../assets/Icons/search.png')} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtre"
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.filterButton} onPress={() => handleSort('date')}>
            <Image style={[
              styles.filterIcon,
              { transform: [{ rotate: rotated ? "180deg" : "0deg" }] },
            ]}

              source={require('../../../assets/Icons/filterList.png')} />
          </TouchableOpacity>
        </View>
      )}
      {/* Content */}
      {!loading && (renderTabContent())}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  filterIcon: {
    marginTop: 12,
    marginRight: 2,
    width: 40,
    height: 25,
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
  filterButton: {
    padding: 8,
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
  notificationContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    paddingTop: 5
  },
  notification: {
    paddingLeft: 14,
    paddingVertical: 4,
  },
  buildingCode: {
    fontSize: 18,
    fontWeight: '700',
    // marginBottom: 0,
    fontFamily: 'Poppins-Medium',
    // borderWidth : 1,
    padding: 0,
    lineHeight: 20

  },
  address: {
    fontSize: 10.8,
    marginBottom: 1,
    lineHeight: 17

  },
  issue: {
    fontSize: 12,
    // fontWeight: 'bold',
    marginBottom: 1,
  },
  date: {
    fontSize: 13,
    // fontStyle: 'italic',
  },

})