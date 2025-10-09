import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/components/Home';
import Clientes from './src/views/Clientes';
import Productos from './src/views/Productos';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Clientes" component={Clientes} />
        <Stack.Screen name="Productos" component={Productos} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}