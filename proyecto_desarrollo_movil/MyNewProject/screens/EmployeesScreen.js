import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, TouchableWithoutFeedback, Image, StyleSheet, Alert, Modal } from 'react-native';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import Svg, { Path } from 'react-native-svg';

export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Nuevo estado para el modal de detalles
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Nuevo estado para el empleado seleccionado

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
      await updateDoc(employeeRef, { name, email, username }); // Actualiza también el email y el username

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
      await addDoc(collection(db, 'employees'), { name, email, username });
    }
    setName('');
    setEmail('');
    setCurrentPassword('');
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

  // Función para abrir el modal de detalles
  const openDetailModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };


  // Iconos SVG para editar eliminar y ver
  const ViewIcon = ({ onPress }) => {
    return ( 
      <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="30"
          height="30"
          strokeWidth="2.5"
        >
          <Path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
          <Path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
        </Svg>
      </TouchableOpacity>
    );
  };
  const EditIcon = ({ onPress }) => {
    return ( 
      <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
        <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black" // Color negro
        strokeLinecap="round"
        strokeLinejoin="round"
        width="30"
        height="30"
        strokeWidth="2.5"
      >
        <Path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
        <Path d="M13.5 6.5l4 4" />
      </Svg>
      </TouchableOpacity>
    );
  };
  const DeleteIcon = ({ onPress }) => {
    return ( 
      <TouchableOpacity onPress={onPress} style={styles.iconContainer}>
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black" // Color negro
          strokeLinecap="round"
          strokeLinejoin="round"
          width="30"
          height="30"
          strokeWidth="2.5"
        >
          <Path d="M4 7h16" />
          <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
          <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          <Path d="M10 12l4 4m0 -4l-4 4" />
        </Svg>
      </TouchableOpacity>
    );
  };

  // Icono + para el agregar empleado: 
  const PlusIcon = () => {
    return ( 
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          width={24} // Puedes ajustar el tamaño
          height={24} // Puedes ajustar el tamaño
        >
          <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/battaglia.jpg')} style={styles.backgroundImage} />
      <Text style={styles.title}>Lista de Empleados</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <PlusIcon />
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
              placeholder="Ingresar Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Ingresar Usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              placeholder="Nombre del empleado"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Ingrese una contraseña"
              value={currentPassword}
              onChangeText={setCurrentPassword}
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

      {/* Modal para ver detalles del empleado */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDetailModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedEmployee && (
                <>
                  <Text style={styles.modalTitle}>Detalles del Empleado</Text>
                  <Text style={styles.label}>Nombre: {selectedEmployee.name}</Text>
                  <Text style={styles.label}>Email: {selectedEmployee.email}</Text>
                  <Text style={styles.label}>Usuario: {selectedEmployee.username}</Text>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeRow}>
            <Text>{item.name}</Text>
            <View style={styles.buttonsRow}>
              <ViewIcon onPress={() => openDetailModal(item)}/> 
              <EditIcon onPress={() => handleEdit(item)}/> 
              <DeleteIcon onPress={() => handleDelete(item.id)}/> 
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
    borderRadius: 15,
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
    alignItems: 'center',
  },
  iconContainer: {
    marginHorizontal: 5,
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
    backgroundColor: '#12b931',
    padding: 10,
    borderRadius: 5,
    borderRadius: 10,
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
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
