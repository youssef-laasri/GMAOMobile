import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../../Presentation/Screens/HomeScreen'
import LoginScreen from '../../Presentation/Screens/LoginScreen'
import screenNames from './navigationNames'
import MaintenanceScreen from '../../Presentation/Screens/MaintenanceScreen'
import DrapeauxScreen from '../../Presentation/Screens/DrapeauxScreen'
import AlertesScreen from '../../Presentation/Screens/AlertesScreen'
import PlanningScreen from '../../Presentation/Screens/PlanningScreen'
import GMAOScreen from '../../Presentation/Screens/GMAOScreen'
import AstreinteScreen from '../../Presentation/Screens/AstreinteScreen'
import DetailIntervention from '../../Presentation/Components/DetailIntervention'
import FormulaireInterventionScreen from '../../Presentation/Screens/FormulaireInterventionScreen'
import RecordAudioScreen from '../../Presentation/Screens/RecordAudioScreen'
import DevisAvantTravauxScreen from '../../Presentation/Screens/DevisAvantTravauxScreen'
import ArticlesDevisScreen from '../../Presentation/Screens/ArticlesDevisScreen'
import LocalisationsScreen from '../../Presentation/Screens/LocalisationScreen'
import VisionCameraScreen from '../../Presentation/Components/VisionCameraScreen'
import MapScreen from '../../Presentation/Screens/MapScreen'


const Stack = createStackNavigator()

// Custom bottom-up transition configuration
const bottomUpTransition = {
  gestureDirection: 'vertical',
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
  // You can also create a fully custom transition:
  /*
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }),
  */
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 200,
      },
    },
  },
};

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...bottomUpTransition
      }}>
      <Stack.Screen name={screenNames.LoginScreen} component={LoginScreen} />
      <Stack.Screen name={screenNames.HomeScreen} component={HomeScreen} />
      <Stack.Screen name={screenNames.PlanningScreen} component={PlanningScreen} />
      <Stack.Screen name={screenNames.GMAOScreen} component={GMAOScreen} />
      <Stack.Screen name={screenNames.AstreintScreen} component={AstreinteScreen} />
      <Stack.Screen name={screenNames.AdminScreen} component={MaintenanceScreen} />
      <Stack.Screen name={screenNames.DrapeauxScreen} component={DrapeauxScreen} />
      <Stack.Screen name={screenNames.AlertesScreen} component={AlertesScreen} />
      <Stack.Screen name={screenNames.DetailInterventionScreen} component={DetailIntervention} />
      <Stack.Screen name={screenNames.FormulaireInterventionScreen} component={FormulaireInterventionScreen} />
      <Stack.Screen name={screenNames.RecoredAudioScreen} component={RecordAudioScreen} />
      <Stack.Screen name={screenNames.DevisAvantTravauxScreen} component={DevisAvantTravauxScreen} />
      <Stack.Screen name={screenNames.ArticlesDevisScreen} component={ArticlesDevisScreen} />
      <Stack.Screen name={screenNames.LocalisationScreen} component={LocalisationsScreen} />
      <Stack.Screen name="VisionCamera" component={VisionCameraScreen} />
      <Stack.Screen name={screenNames.MapScreen} component={MapScreen} />



    </Stack.Navigator>
  )
}