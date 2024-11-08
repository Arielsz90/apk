import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, TouchableWithoutFeedback, Image, StyleSheet, Alert, Modal, Button } from 'react-native';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Svg, { Path } from 'react-native-svg';

{/** Importaciones para la imagen */}
import * as ImagePicker from 'expo-image-picker';
import profileimage from "../assets/profile-placeholder.png";
import { storage } from '../src/firebaseConfig';


export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Nuevo estado para el modal de detalles
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Nuevo estado para el empleado seleccionado
  const [image, setImage] = useState(profileimage);

  
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  // Función para subir la imagen a Firebase Storage
  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image);  // Obtén la imagen en formato de blob
      const blob = await response.blob();  // Convierte a blob

      // Crea una referencia en Firebase Storage
      const storageRef = ref(storage, `images/${Date.now()}.jpg`);  // Aquí se usa un nombre único

      // Subimos el archivo
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Puedes agregar un progreso de subida si lo deseas
        },
        (error) => {
          Alert.alert("Error", error.message);  // Muestra error en caso de fallo
        },
        () => {
          // Una vez que la imagen se haya subido correctamente
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            // Aquí puedes guardar la URL en Firestore o usarla directamente
          });
        }
      );
    } else {
      Alert.alert("No image selected", "Please select an image to upload.");
    }
  };


  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const employeeList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setEmployees(employeeList);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);


  const handleSave = async () => {
    // Obtener la referencia de autenticación
    const auth = getAuth(); 
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, currentPassword);
      const user = userCredential.user; // Obtienes el UID del usuario creado

      // Añadir empleado al firestore
      await addDoc(collection(db, 'employees'), {
        name,
        userId: user.uid,
        email,
        createdAt: new Date().toISOString(),
      });
  
      // Limpiar campos después de guardar.
      setName('');
      setEmail('');
      setCurrentPassword('');
      setShowModal(false);
  
      // Recargar lista de empleados.
      await fetchEmployees();
      Alert.alert('Éxito', 'Empleado agregado correctamente');
    } catch (error) {
      console.error('Error saving employee:', error);
      Alert.alert('Error', 'Hubo un problema al agregar el empleado: ' + error.message);
    }
  };

  const handleEdit = (employee) => {
    navigation.navigate('EmpleadoDetalle', { employee });
  };


{/* Importate añadir al momento de eliminar un empleado se borre tambien su cuenta. */}
  const handleDelete = async (employeeId) => {
    const employeeRef = doc(db, 'employees', employeeId);
    await deleteDoc(employeeRef);
    fetchEmployees();
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

  return (
    <View style={styles.container}>
      <Image source={require('../assets/battaglia.jpg')} style={styles.backgroundImage} />
      <Text style={styles.title}>Lista de Empleados</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>Agregar Empleado</Text>
      </TouchableOpacity>

      {/* Modal para Agregar empleado*/}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Empleado</Text>
            
            <TextInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput placeholder="Nombre del empleado" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Contraseña" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry
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
                  <Text style={styles.label}>User ID: {selectedEmployee.userId}</Text>
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
      <Button title="Agregar Imagen" onPress={pickImage} />
      {image && <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.image} />}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

{/* Estilos para esta pagina */}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
// IMAGEN 
  image: {   
    width: 100,          // Ancho de la imagen
    height: 100,         // Alto de la imagen
    borderRadius: 50,    // Hace que la imagen sea redonda
    borderWidth: 2,      // Borde alrededor de la imagen
    borderColor: '#ccc', // Color del borde
    margin: 10,          // Espacio alrededor de la imagen
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
  editButton: {
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
