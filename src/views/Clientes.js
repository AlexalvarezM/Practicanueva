import React, { useEffect, useState } from "react";
import {View, StyleSheet} from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, doc, getDocs, deleteDoc } from "firebase/firestore";
import FormularioClientes from "../components/FormularioClientes";
import TablaClientes from "../components/TablaClientes";
import TituloPromedio from "../components/TituloPromedio";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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

  useEffect(() =>{
    cargarDatos();
  },[]);

  return(
    <View style={styles.container}>
      <FormularioClientes cargarDatos={cargarDatos}/>
      

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