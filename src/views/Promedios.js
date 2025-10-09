import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import TituloPromedio from "../components/TituloPromedio.js";
import FormularioEdades from "../components/FormularioEdades.js";
import TablaEdades from "../components/TablaEdades.js";
import ListaEdades from "../components/ListaEdades.js";

const Promedios = () => {
  const [edades, setEdades] = useState([]);
  const [promedio, setPromedio] = useState(null);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "edades"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEdades(data);
      if (data.length > 0) calcularPromedioAPI(data);
      else setPromedio(null);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  const calcularPromedioAPI = async (lista) => {
    try {
      const response = await fetch(
        "https://kb1eixlgtd.execute-api.us-east-2.amazonaws.com/calcularpromediopulper",
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ edades: lista }) }
      );
      const data = await response.json();
      setPromedio(data.promedio || null);
    } catch (error) {
      console.error("Error al calcular promedio en API:", error);
    }
  };

  // Eliminar un registro
  const eliminarEdad = async (id) => {
    try {
      await deleteDoc(doc(db, "edades", id)); 
      cargarDatos(); // recarga lista 
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Cargar cuando se monta el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      <TituloPromedio promedio={promedio} />
      <FormularioEdades cargarDatos={cargarDatos} />
      <ListaEdades edades={edades} />
      <TablaEdades 
        edades={edades} 
        eliminarEdad={eliminarEdad}
        cargarDatos={cargarDatos}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Promedios;