import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig";
import { doc, deleteDoc } from "firebase/firestore";

const BotonEliminarEdad = ({ id, eliminarEdad }) => {
  const borrarEdad = async () => {
    try {
      await deleteDoc(doc(db, "edades", id));
      eliminarEdad(id);
    } catch (error) {
      console.error("Error eliminando edad:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.boton} onPress={borrarEdad}>
      <Text style={styles.texto}>🗑️</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boton: {
    padding: 6,
    backgroundColor: "#f19090ff",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  texto: {
    color: "white",
    fontWeight: "bold",
  },
});

export default BotonEliminarEdad;