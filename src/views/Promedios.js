import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import TituloPromedio from "../components/TituloPromedio.js";
import FormularioEdades from "../components/FormularioEdades.js";
import TablaEdades from "../components/TablaEdades.js";
import ListaEdades from "../components/ListaEdades.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

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

  const cargarDatosFirebase = async (nombreColeccion) => {
    if (!nombreColeccion || typeof nombreColeccion !== 'string') {
      console.error("Error: Se requiere un nombre de colección válido.");
      return { [nombreColeccion]: [] };
    }
    try {
      const datosExportados = {};
      console.log(`Obteniendo documentos de la colección '${nombreColeccion}'...`);
      const snapshot = await getDocs(collection(db, nombreColeccion));
      datosExportados[nombreColeccion] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return datosExportados;
    } catch (error) {
      console.error(`Error extrayendo datos de la colección '${nombreColeccion}':`, error);
      return { [nombreColeccion]: [] };
    }
  };

  const exportarDatos = async () => {
    try {
      const collectionName = "edades";
      const datos = await cargarDatosFirebase(collectionName);
      console.log("Datos cargados:", datos);
      if (!datos || !datos[collectionName] || datos[collectionName].length === 0) {
        console.error("No se obtuvieron datos para exportar o la colección está vacía.");
        alert(`No hay datos para exportar. Revisa que la colección '${collectionName}' exista y tenga documentos.`);
        return;
      }
      const jsonString = JSON.stringify(datos, null, 2);
      const baseFileName = "datos_firebase.txt";
      await Clipboard.setStringAsync(jsonString);
      console.log("Datos (JSON) copiados al portapapeles.");
      if (!(await Sharing.isAvailableAsync())) {
        alert("La función Compartir/Guardar no está disponible en tu dispositivo");
        return;
      }
      const fileUri = FileSystem.cacheDirectory + baseFileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Compartir datos de Firebase (JSON)' });
      alert("Datos copiados al portapapeles y listos para compartir.");
    } catch (error) {
      console.error("Error al exportar y compartir:", error);
      alert("Error al exportar o compartir: " + (error.message || error));
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
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar" onPress={exportarDatos} />
      </View>
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