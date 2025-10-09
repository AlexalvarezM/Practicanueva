import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import ListaProductos from "../components/ListaProductos";
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
    });

  const cargarDatos = async () => {
    try {
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

    const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "Productos", id));
      cargarDatos(); // recarga lista 
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

    const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

    const guardarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {

        await addDoc(collection(db, "Productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        cargarDatos(); //Recarga lista

        setNuevoProducto({nombre: "", precio: ""});
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar producto: ", error);
    }
  };

    const actualizarProducto = async () => {
    try{
      if(nuevoProducto.nombre && nuevoProducto.precio) {
        
        await updateDoc(doc(db, "Productos", productoId), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });

        setNuevoProducto({nombre: "", precio: ""});

        setModoEdicion(false); //Volver al modo registro
        setProductoId(null);

        cargarDatos(); //Recargar Lista
      } else {
        alert("Por favor, complete todos los campos");
      }
    } catch (error) {
      console.error("Error al actualizar producto: ", error);
    }
  };

    const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
    });
    setProductoId(producto.id);
    setModoEdicion(true)
  };

  useEffect(() => {
    cargarDatos();
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
      <ListaProductos productos={productos} />
      <TablaProductos 
      productos={productos} 
      eliminarProducto={eliminarProducto}
      editarProducto={editarProducto}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;