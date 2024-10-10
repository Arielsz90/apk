import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(''); // Contraseña actual
  const [email, setEmail] = useState(''); // Correo electrónico del usuario

  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const employeeList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setEmployees(employeeList);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Función para agregar o actualizar empleados
  const handleSave = async () => {
    if (editingId) {
      const employeeRef = doc(db, 'employees', editingId);
      await updateDoc(employeeRef, { name });
      
      // Reautenticar y luego actualizar la contraseña
      if (password !== '') {
        try {
          await reauthenticateUser();
          await updatePassword(getAuth().currentUser, password);
          Alert.alert('Contraseña actualizada correctamente');
        } catch (error) {
          console.error('Error al actualizar la contraseña:', error);
          Alert.alert('Error', 'La contraseña actual no es válida. Por favor, inténtalo de nuevo.');
        }
      }
    } else {
      await addDoc(collection(db, 'employees'), { name });
    }
    setName('');
    setPassword('');
    setEditingId(null);
    fetchEmployees();
  };

  // Función para editar un empleado
  const handleEdit = (employee) => {
    setName(employee.name);
    setEditingId(employee.id);
  };

  // Función para eliminar un empleado
  const handleDelete = async (employeeId) => {
    const employeeRef = doc(db, 'employees', employeeId);
    await deleteDoc(employeeRef);
    fetchEmployees();
  };

  // Reautenticación del usuario
  const reauthenticateUser = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && currentPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword); // Contraseña actual
      return reauthenticateWithCredential(user, credential);
    } else {
      throw new Error('Faltan credenciales de autenticación');
    }
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      navigation.navigate('Login');
    });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/battaglia.jpg')} style={styles.backgroundImage} />
      <Text style={styles.title}>Lista de Empleados</Text>
      <TextInput
        placeholder="Nombre del empleado"
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
      <Button title={editingId ? 'Actualizar Empleado' : 'Agregar Empleado'} onPress={handleSave} />

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeRow}>
            <Text>{item.name}</Text>
            <View style={styles.buttonsRow}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButton}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundImage: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    opacity: 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white', // Fondo blanco para el input
    color: 'black', // Texto en negro dentro del input
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10, // Espacio interno en cada fila de empleado
    backgroundColor: 'white', // Fondo blanco para cada fila de empleado
    borderRadius: 5, // Bordes redondeados opcionales
  },
  employeeText: {
    color: 'black', // Color del texto de los empleados (puedes ajustarlo a blanco si lo prefieres)
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  editButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
  },
});
