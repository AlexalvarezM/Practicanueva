import React, { useEffect, useState } from "react";
// --- CAMBIO: Se añadió Alert ---
import { View, StyleSheet, Button, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
// --- NUEVA IMPORTACIÓN (Según docx) ---
import * as DocumentPicker from "expo-document-picker";

// Función auxiliar para convertir ArrayBuffer a base64 (Sin cambios)
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const Productos = () => {
  console.log('Renderizando componente Productos');
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    });

  const cargarDatos = async () => {
    try {
      console.log('Entrando a cargarDatos');
      const querySnapshot = await getDocs(collection(db, "Productos")); 
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
      console.log("Productos traídos:", data);
    } catch (error) {
      console.error("Error al obtener documentos: ", error);
    }
  };

  // Función para cargar datos genéricos de una colección (para exportar)
  const cargarDatosFirebase = async (nombreColeccion) => {
    // (Esta función no tiene cambios)
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
    // (Esta función no tiene cambios)
    try {
      const collectionName = "Productos";
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

  const generarExcel = async () => {
    // (Esta función no tiene cambios)
    try {
      console.log("Cargando productos para Excel...");
      const snapshot = await getDocs(collection(db, "Productos"));
      const productosParaExcel = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (productosParaExcel.length === 0) {
        throw new Error("No hay datos en la colección 'Productos'.");
      }
      console.log("Productos para Excel:", productosParaExcel);

      const response = await fetch("https://0s69wpyd0e.execute-api.us-east-2.amazonaws.com//extraerexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: productosParaExcel }), 
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const fileUri = FileSystem.documentDirectory + "reporte_productos.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Descargar Reporte de Productos',
        });
      } else {
        alert("Compartir no disponible.");
      }
      alert("Excel de productos generado y listo para descargar.");

    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error: " + error.message);
    }
  };

  // --- INICIO: NUEVA FUNCIÓN BASADA EN EL DOCX ---
  // Adaptada de "extraerYGuardarMascotas" [cite: 44] a "Productos"
  const extraerYGuardarProductos = async () => {
    try {
      // 1. Abrir selector de documentos
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
        return;
      }

      const { uri, name } = result.assets[0];
      console.log(`Archivo seleccionado: ${name} en ${uri}`);

      // 2. Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3. Enviar a Lambda para procesar (¡USANDO TU URL!)
      const response = await fetch("https://6b90o177hg.execute-api.us-east-2.amazonaws.com/extraerexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivoBase64: base64 }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP en Lambda: ${response.status}`);
      }

      // La Lambda debe devolver: { datos: [...] }
      const body = await response.json();
      const { datos } = body; 

      if (!datos || !Array.isArray(datos) || datos.length === 0) {
        Alert.alert("Error", "No se encontraron datos en el Excel o el archivo está vacío.");
        return;
      }

      console.log("Datos extraídos del Excel:", datos);

      // 4. Guardar cada fila en la colección 'Productos'
      let guardados = 0;
      let errores = 0;

      for (const producto of datos) {
        try {
          // Asegúrate que los headers de tu Excel coincidan (ej. 'nombre', 'precio')
          await addDoc(collection(db, "Productos"), {
            nombre: producto.nombre || "",
            // Usamos parseFloat como en tu función 'guardarProducto'
            precio: parseFloat(producto.precio) || 0, 
          });
          guardados++;
        } catch (err) {
          console.error("Error guardando producto:", producto, err);
          errores++;
        }
      }

      Alert.alert(
        "Éxito",
        `Se guardaron ${guardados} productos en la colección. Errores: ${errores}`,
        [{ text: "OK" }]
      );
      
      cargarDatos(); // Recargar los datos de la tabla

    } catch (error) {
      console.error("Error en extraerYGuardarProductos:", error);
      Alert.alert("Error", `Error procesando el Excel: ${error.message}`);
    }
  };
  // --- FIN: NUEVA FUNCIÓN ---


  const eliminarProducto = async (id) => {
    // (Esta función no tiene cambios)
    try {
      await deleteDoc(doc(db, "Productos", id));
      cargarDatos(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const manejoCambio = (nombre, valor) => {
    // (Esta función no tiene cambios)
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarProducto = async () => {
    // (Esta función no tiene cambios)
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await addDoc(collection(db, "Productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        cargarDatos(); 
        setNuevoProducto({nombre: "", precio: ""});
      } else {
        alert("Por favor, complete todos loscampos.");
      }
    } catch (error) {
      console.error("Error al registrar producto: ", error);
    }
  };

  const actualizarProducto = async () => {
    // (Esta función no tiene cambios)
    try{
      if(nuevoProducto.nombre && nuevoProducto.precio) {
        await updateDoc(doc(db, "Productos", productoId), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        setNuevoProducto({nombre: "", precio: ""});
        setModoEdicion(false); 
        setProductoId(null);
        cargarDatos(); 
      } else {
        alert("Por favor, complete todos los campos");
      }
    } catch (error) {
      console.error("Error al actualizar producto: ", error);
    }
  };

  const editarProducto = (producto) => {
    // (Esta función no tiene cambios)
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
    });
    setProductoId(producto.id);
    setModoEdicion(true)
  };
  
  // (Funciones de consulta de prueba sin cambios)
  const pruebaConsulta1 = async () => {
    try {
      console.log('Entrando a pruebaConsulta1');
      const q = query(
        collection(db, "ciudades"), 
        where("pais", "==", "Guatemala"),
        orderBy("poblacion", "desc"),
        limit(2)
      );
      const snapshot = await getDocs(q);
      console.log('pruebaConsulta1 snapshot size:', snapshot.size);
      console.log("---------Consulta1--------------")
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}`)
      })
    }
    catch (error) {
      console.error('Error en pruebaConsulta1:', error);
    }
  }

  useEffect(() => {
    console.log('useEffect Productos montado - ejecutando cargarDatos y pruebaConsulta1');
    cargarDatos();
    pruebaConsulta1();
  }, []);

  const ejecutarConsultasSolicitadas = async () => {
    // (Esta función no tiene cambios)
    // ...
  };

  useEffect(() => {
    ejecutarConsultasSolicitadas();
  }, []);

  return (
    <View style={styles.container}>
      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
        />
      
      {/* BOTÓN DE EXPORTAR JSON */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar (JSON)" onPress={exportarDatos} />
      </View>
      
      {/* BOTÓN GENERAR EXCEL */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel" onPress={generarExcel} />
      </View>
      
      {/* --- INICIO: NUEVO BOTÓN (Según docx) [cite: 45] --- */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Extraer Productos desde Excel" onPress={extraerYGuardarProductos} />
      </View>
      {/* --- FIN: NUEVO BOTÓN --- */}

      <TablaProductos 
        productos={productos} 
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
        cargarDatos={cargarDatos}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;