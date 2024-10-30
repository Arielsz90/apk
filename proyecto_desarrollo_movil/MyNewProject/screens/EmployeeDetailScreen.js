import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../src/firebaseConfig'; // Asegúrate de que la ruta sea correcta
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const EmployeeDetailScreen = ({ route, navigation }) => {
    const { employee } = route.params; // Obtén los datos del empleado desde la navegación
    const [imageUri, setImageUri] = useState(null);
    const [name, setName] = useState(employee.name);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [editingId] = useState(employee.id); // ID del empleado que se está editando

    const selectImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Se necesitan permisos para acceder a la galería');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        try {
            const employeeRef = doc(db, 'employees', editingId);
            await updateDoc(employeeRef, { name });

            if (password) {
                await reauthenticateUser();
                const auth = getAuth();
                await updatePassword(auth.currentUser, password);
                Alert.alert('Contraseña actualizada correctamente');
            }

            Alert.alert('Información actualizada', 'Los cambios han sido guardados.');
            navigation.goBack(); // Regresa a la pantalla anterior
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            Alert.alert('Error', 'No se pudo guardar la información. Inténtalo de nuevo.');
        }
    };

    const reauthenticateUser = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && currentPassword) {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            return reauthenticateWithCredential(user, credential);
        } else {
            throw new Error('Faltan credenciales de autenticación');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
            </View>
            <Button title="Seleccionar imagen" onPress={selectImage} />
            <Text style={styles.title}>Editar información</Text>
            <TextInput
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Contraseña actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Nueva contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
        </View>
    );
};



// STYLES 
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center', // Centra verticalmente
        alignItems: 'center', // Centra horizontalmente
        backgroundColor: '#fff',
        backgroundColor: "#005159",
        color: "#fff",
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 10,
        textAlign: "center",
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 2,
        marginBottom: 10,
        width: '100%', // Asegúrate de que ocupe el ancho disponible
        textAlign: "center",
        borderRadius: 50,
        backgroundColor: "#fff",
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imageContainer: {
        alignItems: 'center', // Centra la imagen horizontalmente
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 150, // Cambiar esto si se quiere que sea más circular
    },
});

export default EmployeeDetailScreen;