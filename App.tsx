/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import MainStack from './src/Infrastructure/Navigation/mainStack';
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { CartProvider } from './src/Infrastructure/Contexte/ArticlesContext';
import { InterventionProvider } from './src/Infrastructure/Contexte/InterventionContext';
import { ReferentielProvider } from './src/Infrastructure/Contexte/ReferentielContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';


function App(): React.JSX.Element {
  return (

    <ReferentielProvider>
      <CartProvider>
        <InterventionProvider>
          <SafeAreaProvider>
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
