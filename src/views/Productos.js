import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";

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
      // --- CORRECCIÓN ---
      // Cambiado de "Productos" a "productos" (minúscula)
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
      // --- CORRECCIÓN ---
      // Cambiado de "Productos" a "productos" (minúscula)
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
          // --- CORRECCIÓN ---
          // Cambiado de "Productos" a "productos" (minúscula)
        await addDoc(collection(db, "Productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        cargarDatos(); //Recarga lista
        setNuevoProducto({nombre: "", precio: ""});
      } else {
        alert("Por favor, complete todos loscampos.");
      }
    } catch (error) {
      console.error("Error al registrar producto: ", error);
    }
  };

  const actualizarProducto = async () => {
    try{
      if(nuevoProducto.nombre && nuevoProducto.precio) {
          // --- CORRECCIÓN ---
          // Cambiado de "Productos" a "productos" (minúscula)
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
  
  const pruebaConsulta1 = async () => {
    try {
      console.log('Entrando a pruebaConsulta1');
      const q = query(
        collection(db, "ciudades"), // Esta ya estaba bien (minúscula)
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

  // Ejecuta todas las consultas solicitadas y muestra resultados en consola
  const ejecutarConsultasSolicitadas = async () => {
    try {
      // 1) Las 2 ciudades más pobladas de Guatemala (población desc, limit 2)
      console.log('--- 1) Top 2 ciudades Guatemala (población desc) ---');
      try {
        const q1 = query(collection(db, 'ciudades'), where('pais', '==', 'Guatemala'), orderBy('poblacion', 'desc'), limit(2));
        const s1 = await getDocs(q1);
        s1.forEach(d => console.log(d.id, d.data()));
      } catch (err) {
        console.error('Error consulta 1:', err);
      }

      // 2) Ciudades de Honduras con población > 700k, ordenadas por nombre asc, limit 3
      console.log('--- 2) Honduras población >700k, ordenar por nombre asc, limit 3 ---');
      try {
        const q2 = query(collection(db, 'ciudades'), where('pais', '==', 'Honduras'), where('poblacion', '>', 700000));
        const s2 = await getDocs(q2);
        const arr2 = [];
        s2.forEach(d => arr2.push({ id: d.id, ...d.data() }));
        arr2.sort((a,b) => a.nombre.localeCompare(b.nombre));
        arr2.slice(0,3).forEach(d => console.log(d.id, d));
      } catch (err) {
        console.error('Error consulta 2:', err);
      }

      // 4) Ciudades centroamericanas con población <= 300k, ordenadas por país desc, limit 4
      console.log('--- 4) Ciudades centroamericanas <=300k, ordenar por país desc, limit 4 ---');
      try {
        const paisesCA = ['Guatemala','Honduras','El Salvador','Nicaragua','Costa Rica','Panama','Belize'];
        const q4 = query(collection(db, 'ciudades'), where('poblacion', '<=', 300000), where('pais', 'in', paisesCA));
        const s4 = await getDocs(q4);
        const arr4 = [];
        s4.forEach(d => arr4.push({ id: d.id, ...d.data() }));
        arr4.sort((a,b) => b.pais.localeCompare(a.pais)); // país desc
        arr4.slice(0,4).forEach(d => console.log(d.id, d));
      } catch (err) {
        console.error('Error consulta 4:', err);
      }

      // 5) 3 ciudades con población > 900k, ordenadas por nombre
      console.log('--- 5) 3 ciudades con población >900k ordenadas por nombre ---');
      try {
        const q5 = query(collection(db, 'ciudades'), where('poblacion', '>', 900000));
        const s5 = await getDocs(q5);
        const arr5 = [];
        s5.forEach(d => arr5.push({ id: d.id, ...d.data() }));
        arr5.sort((a,b) => a.nombre.localeCompare(b.nombre));
        arr5.slice(0,3).forEach(d => console.log(d.id, d));
      } catch (err) {
        console.error('Error consulta 5:', err);
      }

      // 6) Lista ciudades guatemaltecas ordenadas por población desc, limit(5) por seguridad
      console.log('--- 6) Ciudades Guatemala (población desc) limit 5 ---');
      try {
        const q6 = query(collection(db, 'ciudades'), where('pais', '==', 'Guatemala'), orderBy('poblacion', 'desc'), limit(5));
        const s6 = await getDocs(q6);
        s6.forEach(d => console.log(d.id, d.data()));
      } catch (err) {
        console.error('Error consulta 6:', err);
      }

      // 7) Ciudades con población entre 200k y 600k, ordenadas por país asc, limit 5
      console.log('--- 7) Ciudades 200k-600k ordenadas por país asc limit 5 ---');
      try {
        const q7 = query(collection(db, 'ciudades'), where('poblacion', '>=', 200000), where('poblacion', '<=', 600000));
        const s7 = await getDocs(q7);
        const arr7 = [];
        s7.forEach(d => arr7.push({ id: d.id, ...d.data() }));
        arr7.sort((a,b) => a.pais.localeCompare(b.pais));
        arr7.slice(0,5).forEach(d => console.log(d.id, d));
      } catch (err) {
        console.error('Error consulta 7:', err);
      }

      // 8) Top 5 ciudades con mayor población en general, ordenadas por región desc luego por población desc
      console.log('--- 8) Top 5 por población, orden por región desc (si existe) ---');
      try {
        const q8 = query(collection(db, 'ciudades'));
        const s8 = await getDocs(q8);
        const arr8 = [];
        s8.forEach(d => arr8.push({ id: d.id, ...d.data() }));
        arr8.sort((a,b) => {
          // ordenar por region desc si existe, si no, por pais desc
          const regA = a.region || a.pais || '';
          const regB = b.region || b.pais || '';
          if (regA !== regB) return regB.localeCompare(regA);
          return (b.poblacion || 0) - (a.poblacion || 0);
        });
        arr8.slice(0,5).forEach(d => console.log(d.id, d));
      } catch (err) {
        console.error('Error consulta 8:', err);
      }
    } catch (error) {
      console.error('Error ejecutando consultas solicitadas:', error);
    }
  }

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

