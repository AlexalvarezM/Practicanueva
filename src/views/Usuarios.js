import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Button } from 'react-native';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebaseconfig.js';
import FormularioUsuarios from '../components/FormularioUsuarios.js';
import ListaUsuarios from '../components/ListaUsuarios.js';
import TablaUsuarios from '../components/TablaUsuarios.js';
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

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    edad: "",
  });

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Usuarios"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(data);
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
      const collectionName = "Usuarios";
      const datos = await cargarDatosFirebase(collectionName);
      console.log("Datos cargados:", datos);
      if (!datos || !datos[collectionName] || datos[collectionName].length === 0) {
        console.error("No se obtuvieron datos para exportar o la colección está vacía.");
        Alert.alert("No hay datos para exportar", `Revisa que la colección '${collectionName}' exista y tenga documentos.`);
        return;
      }
      const jsonString = JSON.stringify(datos, null, 2);
      const baseFileName = "datos_firebase.txt";
      await Clipboard.setStringAsync(jsonString);
      console.log("Datos (JSON) copiados al portapapeles.");
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Función no disponible", "La función Compartir/Guardar no está disponible en tu dispositivo");
        return;
      }
      const fileUri = FileSystem.cacheDirectory + baseFileName;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Compartir datos de Firebase (JSON)' });
      Alert.alert("Exportado", "Datos copiados al portapapeles y listos para compartir.");
    } catch (error) {
      console.error("Error al exportar y compartir:", error);
      Alert.alert("Error", "Error al exportar o compartir: " + (error.message || error));
    }
  };

  // --- NUEVA FUNCIÓN PARA GENERAR EXCEL ---
  const generarExcel = async () => {
    try {
      // 1. Obtener solo datos de "Usuarios"
      console.log("Cargando usuarios para Excel...");
      const snapshot = await getDocs(collection(db, "Usuarios"));
      const usuariosParaExcel = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (usuariosParaExcel.length === 0) {
        throw new Error("No hay datos en la colección 'Usuarios'.");
      }
      console.log("Usuarios para Excel:", usuariosParaExcel);

      // 2. Llamar a tu API Gateway (¡Usando tu URL!)
      const response = await fetch("https://m93lnwukg4.execute-api.us-east-2.amazonaws.com/generarexcel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datos: usuariosParaExcel }), // Envía los datos de usuarios
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // 3. Obtención de ArrayBuffer y conversión a base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      // 4. Ruta para guardar el archivo temporalmente
      const fileUri = FileSystem.documentDirectory + "reporte_usuarios.xlsx";

      // 5. Escribir el archivo Excel en el sistema de archivos
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 6. Compartir el archivo generado
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Descargar Reporte de Usuarios',
        });
      } else {
        alert("Compartir no disponible.");
      }

      alert("Excel de usuarios generado y listo para descargar.");

    } catch (error) {
      console.error("Error generando Excel:", error);
      alert("Error: " + error.message);
    }
  };
  // --- FIN DE LA NUEVA FUNCIÓN ---

  const eliminarUsuario = async (id) => {
    try{
      await deleteDoc(doc(db, "Usuarios", id));
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar: ", error);
    }
  };

  const manejoCambio = (nombre, valor) => {
    setNuevoUsuario((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const guardarUsuario = async () => {
    const datosValidados = await validarDatos(nuevoUsuario);
    if(datosValidados) {
      try {
        await addDoc(collection(db, "Usuarios"), {
          nombre: datosValidados.nombre,
          correo: datosValidados.correo,
          telefono: parseInt(datosValidados.telefono),
          edad: parseInt(datosValidados.edad),
        });
        cargarDatos();
        setNuevoUsuario({nombre: "", correo: "", telefono: "", edad: "",})
        Alert.alert("Éxito", "Usuario registrado correctamente.");
      } catch (error) {
        console.error("Error al registrar usuario:", error);
      }
    }
  };

  const actualizarUsuario = async () => {
    const datosValidados = await validarDatos(nuevoUsuario);
    if (datosValidados) {
      try {
        await updateDoc(doc(db, "Usuarios", usuarioId), {
          nombre: datosValidados.nombre,
          correo: datosValidados.correo,
          telefono: parseInt(datosValidados.telefono),
          edad: parseInt(datosValidados.edad),
        });
        setNuevoUsuario({nombre: "", correo: "", telefono:"", edad: ""});
        setModoEdicion(false); //Volver al modo registro
        setUsuarioId(null);
        cargarDatos(); //Recargar Lista
        Alert.alert("Éxito", "Usuario actualizado correctamente.");
      } catch (error) {
        console.error ("Error al actualizar usuario:", error);
      }
    }
  };

  const editarUsuario = (usuario) => {
    setNuevoUsuario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono.toString(),
      edad: usuario.edad.toString(),
    });
    setUsuarioId(usuario.id);
    setModoEdicion(true)
  };

  const validarDatos = async (datos) => {
    try{
      const response = await fetch("https://zntx5r359a.execute-api.us-east-2.amazonaws.com/validarusuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultado = await response.json();

      if(resultado.success) {
        return resultado.data; //Datos limpios y validados
      } else {
        Alert.alert("Errores en los datos", resultado.errors.join("\n"));
        return null;
      }
    } catch (error) {
      console.error("Error al validar con Lambda:", error);
      Alert.alert("Error", "No se pudo validar la información con el servidor.");
      return null;
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <View style={styles.container}>
      <FormularioUsuarios
        nuevoUsuario={nuevoUsuario}
        manejoCambio={manejoCambio}
        guardarUsuario={guardarUsuario}
        actualizarUsuario={actualizarUsuario}
        modoEdicion={modoEdicion}
      />

      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar (JSON)" onPress={exportarDatos} />
      </View>

      {/* --- BOTÓN NUEVO (Generar Excel) --- */}
      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel" onPress={generarExcel} />
      </View>
      {/* ---------------------------------- */}
     
      <TablaUsuarios
        usuarios={usuarios}
        editarUsuario={editarUsuario}
        eliminarUsuario={eliminarUsuario}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default Usuarios;