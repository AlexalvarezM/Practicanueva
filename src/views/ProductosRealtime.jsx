import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { ref, set, push, onValue } from "firebase/database";
import { realtimeDB } from "../database/firebaseconfig";

const ProductosRealtime = () => {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [productosRT, setProductosRT] = useState([]);

    const guardarEnRT = async () => {
        // Validar: ambos campos requeridos
        if (!nombre || !precio) {
            Alert.alert("Campos requeridos", "Rellena ambos campos: nombre y precio.");
            return;
        }

        try {
            const referencia = ref(realtimeDB, "productos_rt");
            const nuevoRef = push(referencia); // crea ID automático

            await set(nuevoRef, {
                nombre: nombre.trim(),
                precio: Number(precio),
            });

            setNombre("");
            setPrecio("");
            Alert.alert("Éxito", "Producto guardado en Realtime Database");
        } catch (error) {
            console.error("Error al guardar en Realtime:", error);
            Alert.alert("Error", "No se pudo guardar el producto. Revisa la consola.");
        }
    };

    useEffect(() => {
        const referencia = ref(realtimeDB, "productos_rt");

        // onValue devuelve una función que elimina el listener cuando se llama
        const unsubscribe = onValue(referencia, (snapshot) => {
            if (snapshot.exists()) {
                const dataObj = snapshot.val();
                const lista = Object.entries(dataObj).map(([id, datos]) => ({ id, ...datos }));
                setProductosRT(lista);
            } else {
                setProductosRT([]);
            }
        }, (error) => {
            console.error("Error leyendo Realtime Database:", error);
        });

        // Cleanup al desmontar
        return () => {
            if (typeof unsubscribe === "function") unsubscribe();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Prueba Realtime Database</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre producto"
                value={nombre}
                onChangeText={setNombre}
            />

            <TextInput
                style={styles.input}
                placeholder="Precio"
                keyboardType="numeric"
                value={precio}
                onChangeText={setPrecio}
            />

            <Button title="Guardar en Realtime" onPress={guardarEnRT} />

            <Text style={styles.subtitulo}>Productos en RT:</Text>

            {productosRT.length === 0 ? (
                <Text>No hay productos</Text>
            ) : (
                productosRT.map((p) => (
                    <Text key={p.id}>
                        {p.nombre} - ${p.precio}
                    </Text>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, marginTop: 50 },
    titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    subtitulo: { fontSize: 18, marginTop: 20, fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#aaa",
        padding: 8,
        marginBottom: 10,
        borderRadius: 5,
    },
});

export default ProductosRealtime;