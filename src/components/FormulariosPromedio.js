import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { db } from "../database/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";
import TituloPromedio from "./TituloPromedios";

const FormularioEdades = ({ cargarDatos }) => {
    const [nombre, setNombre] = useState("");
    const [edad, setEdad] = useState("");

    const guardarEdades = async () => {
        if (nombre && edad) {
            try {
                await addDoc(collection(db, "promedio"), {
                    nombre: nombre,
                    edad: Number(edad),
                });
                setNombre("");
                setEdad("");
                cargarDatos(); // Volver a cargar la lista
            } catch (error) {
                console.error("Error al registrar edades:", error);
            }
        } else {
            alert("Por favor, complete todos los campos.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Registro de edades</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre del cliente"
                value={nombre}
                onChangeText={setNombre}
            />
            <TextInput
                style={styles.input}
                placeholder="edad del cliente"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
            />
            <Button title="Guardar" onPress={guardarEdades} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#25c510ff", padding: 10, marginBottom: 10 }
});

export default FormularioEdades;