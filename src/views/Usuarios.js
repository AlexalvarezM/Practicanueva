import React, { useState, useEffect, act } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../database/firebaseconfig.js';
import FormularioUsuarios from '../components/FormularioUsuarios.js';
import ListaUsuarios from '../components/ListaUsuarios.js';
import TablaUsuarios from '../components/TablaUsuarios.js';

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

      <ListaUsuarios usuarios={usuarios}/>
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