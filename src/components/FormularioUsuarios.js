import React, {useState} from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

const FormularioUsuarios = ({
  nuevoUsuario,
  manejoCambio,
  guardarUsuario,
  actualizarUsuario,
  modoEdicion
}) => {

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Actualizar Usuario" : "Registro de Usuario"}
      </Text>

      <TextInput 
        style={styles.input}
        placeholder="Nombre"
        value={nuevoUsuario.nombre}
        onChangeText={(nombre) => manejoCambio("nombre", nombre)}
      />
      <TextInput 
        style={styles.input}
        placeholder="Correo"
        value={nuevoUsuario.correo}
        onChangeText={(correo) => manejoCambio("correo", correo)}
      />
      <TextInput 
        style={styles.input}
        placeholder="Teléfono"
        value={nuevoUsuario.telefono}
        onChangeText={(telefono) => manejoCambio("telefono", telefono)}
        keyboardType="numeric"
      />
      <TextInput 
        style={styles.input}
        placeholder="Edad"
        value={nuevoUsuario.edad}
        onChangeText={(edad) => manejoCambio("edad", edad)}
        keyboardType="numeric"
      />
      <Button
        title={modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarUsuario : guardarUsuario}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10
  },
  input: {
    borderRadius: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10
  },
});

export default FormularioUsuarios;