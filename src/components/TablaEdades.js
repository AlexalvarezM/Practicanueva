import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import BotonEditarEdad from "./BotonEditarEdad.js";
import BotonEliminarEdad from "./BotonEliminarEdad.js";

const TablaEdades = ({ edades, eliminarEdad, cargarDatos }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tabla de Edades</Text>

      {/* Encabezado de la tabla */}
      <View style={[styles.fila, styles.encabezado]}>
        <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Edad</Text>
        <Text style={[styles.celda, styles.textoEncabezado]}>Acciones</Text>
      </View>

      {/* Contenido de la tabla */}
      <ScrollView>
        {edades.map((item) => (
          <View key={item.id} style={styles.fila}>
            <Text style={styles.celda}>{item.nombre}</Text>
            <Text style={styles.celda}>{item.edad}</Text>
            <View style={styles.celdaAcciones}>
              <BotonEditarEdad
                id={item.id}
                nombreInicial={item.nombre}
                edadInicial={item.edad}
                cargarDatos={cargarDatos}
              />
              <BotonEliminarEdad id={item.id} eliminarEdad={eliminarEdad} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignSelf: "stretch" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    alignItems: "center",
  },
  encabezado: { backgroundColor: "#dcedf3ff" },
  celda: { flex: 1, fontSize: 16, textAlign: "center" },
  celdaAcciones: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  textoEncabezado: { fontWeight: "bold", fontSize: 17, textAlign: "center" },
});

export default TablaEdades;
