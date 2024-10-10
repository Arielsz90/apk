import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { db } from '../src/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
    } else {
      await addDoc(collection(db, 'employees'), { name });
    }
    setName('');
    setEditingId(null);
    fetchEmployees();
  };

  const handleEdit = (employee) => {
    setName(employee.name);
    setEditingId(employee.id);
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
      <TextInput
        placeholder="Nombre del empleado"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button title={editingId ? 'Actualizar Empleado' : 'Agregar Empleado'} onPress={handleSave} />
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.employeeRow}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Text style={styles.editButton}>Editar</Text>
            </TouchableOpacity>
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
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  editButton: {
    color: 'blue',
    borderBottomColor: 'blue',
  },
});
