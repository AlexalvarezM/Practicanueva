import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert } from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

const FormularioProductos = ({ cargarDatos }) => {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  const guardarProducto = async () => {
    if (nombre.trim() && precio.trim()) {
      try {
        await addDoc(collection(db, "Productos"), {
          nombre: nombre.trim(),
          precio: parseFloat(precio),
        });
        setNombre("");
        setPrecio("");
        cargarDatos(); // Volver a cargar los datos
      } catch (error) {
        console.error("Error al guardar el producto: ", error);
      }
    } else {
      Alert.alert("Por favor, complete todos los campos.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro de Productos</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />
      <Button title="Guardar" onPress={guardarProducto} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default FormularioProductos;