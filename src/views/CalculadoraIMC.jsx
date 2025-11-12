import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ref, set, push, onValue } from "firebase/database";
import { realtimeDB } from '../database/firebaseconfig';

const CalculadoraIMC = () => {
  const [nombre, setNombre] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [registrosIMC, setRegistrosIMC] = useState([]);

  const calcularIMC = (peso, altura) => {
    const alturaMetros = Number(altura) / 100; // Convertir cm a metros
    return (Number(peso) / (alturaMetros * alturaMetros)).toFixed(2);
  };

  const guardarEnRT = async () => {
    if (!nombre || !peso || !altura) {
      alert("Rellena todos los campos");
      return;
    }

    const imcCalculado = calcularIMC(peso, altura);

    try {
      const referencia = ref(realtimeDB, "registros_imc");
      const nuevoRef = push(referencia); // crea ID automático

      await set(nuevoRef, {
        nombre,
        peso: Number(peso),
        altura: Number(altura),
        imc: Number(imcCalculado),
      });

      setNombre("");
      setPeso("");
      setAltura("");

      alert(`IMC calculado: ${imcCalculado}. Registro guardado en Realtime`);
    } catch (error) {
      console.log("Error al guardar:", error);
    }
  };

  const leerRT = () => {
    const referencia = ref(realtimeDB, "registros_imc");

    onValue(referencia, (snapshot) => {
      if (snapshot.exists()) {
        // snapshot.val() devuelve un objeto {id: {data}}
        const dataObj = snapshot.val();

        // convertir ese objeto en un array limpio
        const lista = Object.entries(dataObj).map(([id, datos]) => ({
          id,
          ...datos,
        }));

        setRegistrosIMC(lista);
      } else {
        setRegistrosIMC([]);
      }
    });
  };

  useEffect(() => {
    leerRT();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calculadora de IMC</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setPeso}
      />

      <TextInput
        style={styles.input}
        placeholder="Altura (cm)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setAltura}
      />

      <Button title="Calcular y Guardar IMC" onPress={guardarEnRT} />

      <Text style={styles.subtitulo}>Registros de IMC:</Text>

      {registrosIMC.length === 0 ? (
        <Text>No hay registros</Text>
      ) : (
        registrosIMC.map((r) => (
          <Text key={r.id}>
            {r.nombre} - Peso: {r.peso} kg, Altura: {r.altura} cm, IMC: {r.imc}
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

export default CalculadoraIMC;