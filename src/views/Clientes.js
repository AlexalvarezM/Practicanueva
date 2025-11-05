import React, { useEffect, useState } from "react";
import {View, StyleSheet, Button} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";
import FormularioClientes from "../components/FormularioClientes";
import TablaClientes from "../components/TablaClientes";
import TituloPromedio from "../components/TituloPromedio";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";


const Clientes = () =>{

  const calcularPromedioAPI = async (lista) => {
  try {
    const response = await fetch("https://g6tek5o9xf.execute-api.us-east-2.amazonaws.com/promedio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edades: lista }),
    });

    const data = await response.json();
    setPromedio(data.promedio || null);
  } catch (error) {
    console.error("Error al calcular promedio en API:", error);
  }
};


  const eliminarCliente = async (id)=>{
      try{
        await deleteDoc(doc(db, "clientes", id));
        cargarDatos();
      }catch (error){
        console.error("Error al eliminar", error)
      }
    }
  
  const [clientes, setClientes] = useState([]);
  const [promedio, setPromedio] = useState(null);


  const cargarDatos = async () =>{
    try{
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const data = querySnapshot.docs.map((doc) =>({
        id:doc.id,
        ...doc.data(),
      }));
      setClientes(data);
      console.log("Clientes", data);

      if(data.length > 0){
        calcularPromedioAPI(data);
      }else{
        setClientes(null)
      }
    }catch (error){
      console.error("Error al obtener documentos", error);
    }
  };

  const cargarDatosFirebase = async (nombreColeccion) => {

  if (!nombreColeccion || typeof nombreColeccion !== 'string') {
    console.error("Error: Se requiere un nombre de colección válido.");
    return;
  }

  try {
    const datosExportados = {};

    // Obtener la referencia a la colección específica
    const snapshot = await getDocs(collection(db, nombreColeccion));

    // Mapear los documentos y agregarlos al objeto de resultados
    datosExportados[nombreColeccion] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return datosExportados;
  } catch (error) {
    console.error(`Error extrayendo datos de la colección '${nombreColeccion}':`, error);
  }
};


const exportarDatos = async () => {
  try {
    const datos = await cargarDatosFirebase("productos");
    console.log("Datos cargados:", datos);

    // Formatea los datos para el archivo y el portapapeles
    const jsonString = JSON.stringify(datos, null, 2);

    const baseFileName = "datos_firebase.txt";

    // Copiar datos al portapapeles
    await Clipboard.setStringAsync(jsonString);
    console.log("Datos (JSON) copiados al portapapeles.");

    // Verificar si la función de compartir está disponible
    if (!(await Sharing.isAvailableAsync())) {
      alert("La función Compartir/Guardar no está disponible en tu dispositivo");
      return;
    }

    // Guardar el archivo temporalmente
    const fileUri = FileSystem.cacheDirectory + baseFileName;

    // Escribir el contenido JSON en el caché temporal
    await FileSystem.writeAsStringAsync(fileUri, jsonString);

    // Abrir el diálogo de compartir
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: 'Compartir datos de Firebase (JSON)'
    });

    alert("Datos copiados al portapapeles y listos para compartir.");

  } catch (error) {
    console.error("Error al exportar y compartir:", error);
    alert("Error al exportar o compartir: " + error.message);
  }
};


  useEffect(() =>{
    cargarDatos();
    exportarDatos();
  },[]);

  return(
    <View style={styles.container}>
      <FormularioClientes cargarDatos={cargarDatos}/>
      
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar" onPress={exportarDatos} />
      </View>

      <TablaClientes
      clientes={clientes}
      eliminarCliente={eliminarCliente}
      
      />
      <TituloPromedio 
      promedio={promedio} />
      
    </View>
    
  );
};

const styles= StyleSheet.create({
  container:{
    flex:1,
    padding:20
  }
})

export default Clientes;