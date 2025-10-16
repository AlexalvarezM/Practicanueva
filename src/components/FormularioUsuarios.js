import React from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";

const FormularioUsuarios = ({ actualizarUsuario, modoEdicion, nuevoUsuario, manejoCambio, guardarUsuario }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>
                {modoEdicion ? "Actualizar Usuario" : "Registro de usuarios"}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre del usuario"
                value={nuevoUsuario.nombre}
                onChangeText={(nombre) => manejoCambio("nombre", nombre)}
            />
            <TextInput
                style={styles.input}
                placeholder="correo"
                value={nuevoUsuario.correo}
                onChangeText={(correo) => manejoCambio("correo", correo)}
            />
             <TextInput
                style={styles.input}
                placeholder="telefono"
                value={nuevoUsuario.telefono}
                onChangeText={(telefono) => manejoCambio("telefono", telefono)}
            />
            <TextInput
                style={styles.input}
                placeholder="edad"
                value={nuevoUsuario.edad}
                onChangeText={(edad) => manejoCambio("edad", edad)}
                keyboardType="numeric"
            />

            <Button 
                title={modoEdicion ? "Actualizar" : "Guardar"}
                onPress={modoEdicion ? actualizarUsuario : guardarUsuario}   
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#25c510ff", padding: 10, marginBottom: 10 }
});

export default FormularioUsuarios;