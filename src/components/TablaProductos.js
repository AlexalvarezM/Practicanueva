import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BotonEliminarProducto from "./BotonEliminarProducto.js";
import BotonEditarProducto from "./BotonEditarProducto.js";

const TablaProductos = ({ productos, eliminarProducto, cargarDatos }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Productos</Text>

      {/* Encabezado de la tabla */}
      <View style={[styles.fila, styles.encabezado]}>
        <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Precio</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
      </View>

      {/* Contenido de la tabla */}
      <ScrollView>
        {productos.map((item) => (
          <View key={item.id} style={styles.fila}>
            <Text style={styles.celda}>{item.nombre}</Text>
            <Text style={styles.celda}>C${item.precio}</Text>
            
            {/* Celda de acciones */}
            <View style={[styles.celdaAcciones]}>
              <BotonEditarProducto id={item.id} nombreInicial={item.nombre} precioInicial={item.precio} cargarDatos={cargarDatos}  />
              <BotonEliminarProducto id={item.id} eliminarProducto={eliminarProducto} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch"
  },

  titulo: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10 
  },

  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    alignItems: "center",
  },

  encabezado: {
    backgroundColor: "#dcedf3ff",
  },

  celda: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
  },

  celdaAcciones: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  
  textoEncabezado: {
    fontWeight: "bold",
    fontSize: 17,
    textAlign: "center",
  },
});

export default TablaProductos;