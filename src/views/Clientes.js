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

// Función auxiliar para convertir ArrayBuffer a base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

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
        setClientes(null) // Corrección: setPromedio(null) ?
      }
    }catch (error){
      console.error("Error al obtener documentos", error);
    }
  };

  const cargarDatosFirebase = async (nombreColeccion) => {

  if (!nombreColeccion || typeof nombreColeccion !== 'string') {
    console.error("Error: Se requiere un nombre de colección válido.");
    return { [nombreColeccion]: [] };
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
    return { [nombreColeccion]: [] };
  }
};


const exportarDatos = async () => {
  try {
    const datos = await cargarDatosFirebase("clientes");
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

  // --- NUEVA FUNCIÓN PARA GENERAR EXCEL ---
  const generarExcel = async () => {
    try {
      // 1. Obtener solo datos de "clientes"
      console.log("Cargando clientes para Excel...");
      const snapshot = await getDocs(collection(db, "clientes"));
      const clientesParaExcel = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (clientesParaExcel.length === 0) {
        throw new Error("No hay datos en la colección 'clientes'.");
      }
      console.log("Clientes para Excel:", clientesParaExcel);

      // 2. Llamar a tu API Gateway (¡Usando tu URL!)
      const response = await fetch("https://m93lnwukg4.execute-api.us-east-2.amazonaws.com/generarexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: clientesParaExcel }), // Envía los datos de clientes
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // 3. Obtención de ArrayBuffer y conversión a base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      // 4. Ruta para guardar el archivo temporalmente
      const fileUri = FileSystem.documentDirectory + "reporte_clientes.xlsx";

      // 5. Escribir el archivo Excel en el sistema de archivos
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 6. Compartir el archivo generado
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Descargar Reporte de Clientes',
        });
      } else {
        alert("Compartir no disponible.");
      }

      alert("Excel de clientes generado y listo para descargar.");

    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error: " + error.message);
    }
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

  useEffect(() =>{
    // Cargar datos al montar. No ejecutar exportarDatos() automáticamente —
    // el usuario puede exportar con el botón "Exportar".
    cargarDatos();
  },[]);

  return(
    <View style={styles.container}>
      <FormularioClientes cargarDatos={cargarDatos}/>
      
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar (JSON)" onPress={exportarDatos} />
      </View>

      {/* --- BOTÓN NUEVO (Generar Excel) --- */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel" onPress={generarExcel} />
      </View>
      {/* ---------------------------------- */}

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