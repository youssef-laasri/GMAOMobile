import { View, Text, StyleSheet, TouchableOpacity, BackHandler, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../Components/Header';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import screenNames from '../../Infrastructure/Navigation/navigationNames';
import { apiService } from '../../Application/Services/apiServices';
import { InterventionPlanningDTO, PlanningDTOOutput } from '../../Application/ApiCalls/generated';
import Loader from '../Components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';

const PlanningScreen = ({ navigation }) => {
  const [title, setText] = useState('PLANNING');
  const [activeTab, setActiveTab] = useState('JOUR');
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(true);


  const [notifications, setNotifications] = useState<PlanningDTOOutput>();

  const [notificationsItems, setNotificationsItems] = useState<InterventionPlanningDTO[]>([]);

  const [notificationsItemsEnAttente, setNotificationsItemsEnAttente] = useState<InterventionPlanningDTO[]>([]);

  const [notificationsHistoriqueItems, setNotificationsHistoriqueItems] = useState<InterventionPlanningDTO[]>([]);

  const fetchDataPlanning = async () => {
    try {
      const response = await apiService.getPlanning();;
      const json = await response.result;
      setNotifications(json);
      setNotificationsHistoriqueItems(json?.historiqueIntervention as [])
      setNotificationsItems(notifications?.interventionJour as [])
      setNotificationsItemsEnAttente(notifications?.interventionEnAttente as [])
      updateTabCount("JOUR", notifications?.interventionJour?.length)
      updateTabCount("EN_ATTENTE", notifications?.interventionEnAttente?.length)
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
  },[notificationsItems, notificationsItemsEnAttente, notificationsHistoriqueItems])


  const updateTabCount = (tabId, newCount) => {
    setTabs(currentTabs =>
      currentTabs.map(tab =>
        tab.id === tabId ? { ...tab, nbrOfItem: newCount } : tab
      )
    );
  };

  function changeTab(idTab: string) {
    setActiveTab(idTab)
    switch (idTab) {
      case "JOUR":

        break;
      case "EN_ATTENTE":

        break;

      default:
        break;
    }


  }


  const [tabs, setTabs] = useState([
    { id: 'JOUR', label: 'JOUR ', nbrOfItem: 0 },
    { id: 'EN_ATTENTE', label: 'EN ATTENTE ', nbrOfItem: 0 },
    { id: 'HISTORIQUE', label: 'HISTORIQUE', nbrOfItem: 0 }
  ]);
  const renderTabContent = () => {
    return (
      <View>
        {notificationsItems?.length === 0 && activeTab === 'JOUR' ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Pas d'intervention du jour
            </Text>
          </View>
        ) : notificationsItemsEnAttente?.length === 0 && activeTab === 'EN_ATTENTE' ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Pas d'intervention en attente
            </Text>
          </View>
        ) : notificationsHistoriqueItems?.length === 0 && activeTab === 'HISTORIQUE' ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Pas d'intervention dans l'historique
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollViewStyle}>
            {activeTab === 'JOUR' && notificationsItems?.map(notification => renderNotification(notification))}
            {activeTab === 'EN_ATTENTE' && notificationsItemsEnAttente?.map(notification => renderNotification(notification))}
            {activeTab === 'HISTORIQUE' && notificationsHistoriqueItems?.map(notification => renderHistorique(notification))}
          </ScrollView>
        )}
      </View>
    );
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
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ backgroundColor: notification.codeEtat.codeCouleurCaractere, width: 9 }}></Text>
          <View style={styles.notification}>
            <Text style={styles.buildingCode}>{notification.codeImmeuble}</Text>
            <Text style={styles.address}>{notification.adressImmeuble}</Text>
            <Text style={styles.issue}>{notification.designation}</Text>
            <Text style={styles.date}>{notification.datePrevu}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHistorique = (notification: any) => {
    return (
      <TouchableOpacity
        key={notification.noIntervention}
        style={styles.notificationContainer}
        onPress={() => console.log('')}
      >
        <View style={styles.notification}>
          <Text style={styles.buildingCode}>{notification.codeImmeuble}</Text>
          <Text style={styles.address}>{notification.adressImmeuble}</Text>
          <Text style={styles.issue}>{notification.designation}</Text>
          <Text style={styles.date}>{notification.datePrevu}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // if (loading) return <ActivityIndicator size="large" />;
  return (
    <SafeAreaView style={styles.container}>
      <Header titleCom={title} />
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => changeTab(tab.id)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel
              ]}
            >
              {tab.label} {tab.nbrOfItem > 0 && <Text>({tab.nbrOfItem})</Text>}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading && (<Loader />)}


      {/* Tab Indicator */}
      {!loading && (<View style={styles.tabIndicatorContainer}>
        {tabs.map((tab) => (
          <View
            key={tab.id}
            style={[
              styles.tabIndicator,
              activeTab === tab.id && styles.activeTabIndicator
            ]}
          />
        ))}
      </View>
      )}
      {/* Content */}
      {!loading && renderTabContent()}


    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerList: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    color: '#3F51B5',
  },
  activeTabButton: {
    // Active state styling if needed
  },
  tabLabel: {
    fontSize: 13,
    color: '#3F51B5',
    // fontWeight: 'bold',
    fontFamily: 'Poppins-Medium'
  },
  activeTabLabel: {
    color: '#3F51B5',
    // fontWeight: '600',
    fontWeight: 'bold',

  },
  tabIndicatorContainer: {
    flexDirection: 'row',
    height: 2,
  },
  tabIndicator: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  activeTabIndicator: {
    backgroundColor: '#3F51B5',
  },
  emptyContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth : 1, 
    height: '100%'
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold'
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
  scrollViewStyle: {
     marginBottom: '28%',
    // flex: 1,
    // height: '86%',
    // borderWidth : 1,
  },
})

export default PlanningScreen;