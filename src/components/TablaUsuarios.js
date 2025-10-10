import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import BotonEliminarUsuario from './BotonEliminarUsuario';

const TablaUsuarios = ({ usuarios, eliminarUsuario, editarUsuario }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Usuarios</Text>

      {/*Encabezado de la tabla */}
      <View style={[styles.fila, styles.encabezado]}>
        <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Correo</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Teléfono</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Edad</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
      </View>

      {/* Contenido de la tabla */}
      <ScrollView>
        {usuarios.map((item) => (
          <View key={item.id} style={styles.fila}>
            <Text style={styles.celda}>{item.nombre}</Text>
            <Text style={styles.celda}>{item.correo}</Text>
            <Text style={styles.celda}>{item.telefono}</Text>
            <Text style={styles.celda}>{item.edad}</Text>
            {/* Celda de acciones */}
            <View style={[styles.celdaAcciones]}>
              <TouchableOpacity
                style={styles.botonActualizar}
                onPress={() => editarUsuario(item)}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
              <BotonEliminarUsuario id={item.id} eliminarUsuario={eliminarUsuario} />
            </View>
          </View>
        ))}
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignSelf: "stretch",
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

  botonActualizar: {
    padding: 4,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#99c99aff",
  },
});


export default TablaUsuarios;