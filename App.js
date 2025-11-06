import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/components/Home';
import Clientes from './src/views/Clientes';
import Productos from './src/views/Productos';
import Promedios from './src/views/Promedios';
import Usuarios from './src/views/Usuarios';
import Login from './src/components/Login';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/database/firebaseconfig';


const Stack = createNativeStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={usuario ? "Home" : "Login"}>
        {!usuario ? (
          <Stack.Screen name="Login">
            {(props) => (
              <Login {...props} onLoginSuccess={() => setUsuario(auth.currentUser)} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
            {(props) => (
                <Home {...props} cerrarSesion={() => cerrarSesion(props.navigation)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Clientes">
            {(props) => (
                <Clientes {...props} cerrarSesion={() => cerrarSesion(props.navigation)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Productos">
              {(props) => (
                <Productos {...props} cerrarSesion={() => cerrarSesion(props.navigation)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Promedios" >
               {(props) => (
                <Promedios {...props} cerrarSesion={() => cerrarSesion(props.navigation)} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Usuarios">
               {(props) => (
                <Usuarios {...props} cerrarSesion={() => cerrarSesion(props.navigation)} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 