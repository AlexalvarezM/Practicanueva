import React from "react";
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ListaUsuarios = ({ usuarios }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Usuarios</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <Text style={styles.item}>
            {item.nombre} - {item.correo} - {item.telefono} - {item.edad}
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default ListaUsuarios;