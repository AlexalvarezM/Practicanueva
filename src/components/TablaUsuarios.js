import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BotonEliminarUsuario from './BotonEliminarUsuario';


const TablaUsuarios = ({ usuarios, eliminarUsuario, editarUsuario }) => {

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Tabla de usuarios</Text>

            <View style={[styles.fila, styles.encabezado]}>
                <Text style={[styles.celda, styles.textoEncabezado]}>Nombre</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Correo</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Telefono</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Edad</Text>
                <Text style={[styles.celda, styles.textoEncabezado]}>Accion</Text>
            </View>

            {/* Lista de usuarios */}
            <ScrollView>
                {(!usuarios || usuarios.length === 0) ? (
                    <View style={styles.fila}>
                        <Text style={styles.celda}>No hay usuarios</Text>
                    </View>
                ) : (
                    usuarios.map((item) => (
                        <View key={item.id} style={styles.fila}>
                            <Text style={styles.celda}>{item.nombre}</Text>
                            <Text style={styles.celda}>{item.correo}</Text>
                            <Text style={styles.celda}>{item.telefono}</Text>
                            <Text style={styles.celda}>{item.edad}</Text>
                            <View style={styles.celdaAcciones}>
                                <BotonEliminarUsuario id={item.id} eliminarUsuario={eliminarUsuario} />
                                <TouchableOpacity
                                    style={styles.botonActualizar}
                                    onPress={() => editarUsuario(item)}
                                >
                                    <Text>🖊️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width:"109%",
        backgroundColor: "#ffffffff",
        flex: 1,
       marginLeft:-16,
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
        alignItems: "center"
    },
    encabezado: {
        backgroundColor: "#d48d7bff"
    },
    celda: {
        flex: 1,
        fontSize: 16,
        textAlign: "center"
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
        textAlign: "center"
    },
    botonActualizar: {
        padding: 4,
        borderRadius: 5,
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#facf7fff"
    }
});

export default TablaUsuarios;