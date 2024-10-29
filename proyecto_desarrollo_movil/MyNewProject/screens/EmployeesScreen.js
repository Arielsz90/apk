import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const employeeList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setEmployees(employeeList);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async () => {
    if (editingId) {
      const employeeRef = doc(db, 'employees', editingId);
      await updateDoc(employeeRef, { name });

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
    setShowModal(false);
    fetchEmployees();
  };

  const handleEdit = (employee) => {
    navigation.navigate('EmployeeDetailScreen', { employee });
  };

  const handleDelete = async (employeeId) => {
    const employeeRef = doc(db, 'employees', employeeId);
    await deleteDoc(employeeRef);
    fetchEmployees();
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

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>Agregar Empleado</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Editar Empleado' : 'Agregar Empleado'}</Text>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeRow}>
            <Text>{item.name}</Text>
            <View style={styles.buttonsRow}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.verButton}>Ver</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButton}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
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
    backgroundColor: 'white',
    color: 'black',
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  verButton: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButton: {
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#00bfff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#00bfff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
