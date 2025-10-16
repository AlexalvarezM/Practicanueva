import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function Home({ navigation, cerrarSesion }) {
  return (
    <View style={styles.container}>
       <Button title="Cerrar Sesión" onPress={cerrarSesion} />
       
      <View style={styles.botones}>
        <Button title="Ir a Clientes" onPress={() => navigation.navigate('Clientes')} />
      </View>
      <View style={styles.botones}>
        <Button title="Ir a Productos" onPress={() => navigation.navigate('Productos')} />
      </View>
        <View style={styles.botones}>
        <Button title="Ir a promedio" onPress={() => navigation.navigate('Promedios')} />
      </View>
       <View style={styles.botones}>
        <Button title="Ir a usuario" onPress={() => navigation.navigate('Usuarios')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:"#ffffffff",
    padding: 20,
  },
  botones: {
    marginBottom: 25,
    borderRadius:20
  },
});