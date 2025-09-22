/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import MainStack from './src/Infrastructure/Navigation/mainStack';
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { CartProvider } from './src/Infrastructure/Contexte/ArticlesContext';
import { InterventionProvider } from './src/Infrastructure/Contexte/InterventionContext';
import { ReferentielProvider } from './src/Infrastructure/Contexte/ReferentielContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import KeepAwake from 'react-native-keep-awake';


function App(): React.JSX.Element {
  useEffect(() => {
    // Keep screen awake while app is running
    KeepAwake.activate();
    
    return () => {
        // Cleanup when app unmounts
        KeepAwake.deactivate();
    };
}, []);
  return (

    <ReferentielProvider>
      <CartProvider>
        <InterventionProvider>
          <SafeAreaProvider>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor="#FFFFFF" 
              translucent={false}
            />
            <NavigationContainer>
              <MainStack />
            </NavigationContainer>
          </SafeAreaProvider>
        </InterventionProvider>
      </CartProvider>
    </ReferentielProvider>

  );
}



export default App;
