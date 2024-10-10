import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { db } from '../src/firebaseConfig'; 
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

export default function EmployeesScreen({ navigation }) {
  const [name, setName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Función para obtener los empleados
  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'empleados'));
    const employeeList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setEmployees(employeeList);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Función para agregar o actualizar empleados
  const handleSave = async () => {
    if (editingId) {
      const employeeRef = doc(db, 'empleados', editingId);
      await updateDoc(employeeRef, { name });
    } else {
      await addDoc(collection(db, 'empleados'), { name });
    }
    setName('');
    setEditingId(null);
    fetchEmployees(); // Refresca la lista
  };

  // Función para editar un empleado
  const handleEdit = (employee) => {
    setName(employee.name);
    setEditingId(employee.id);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      navigation.navigate('Login');
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Lista de Empleados</Text>
      <TextInput
        placeholder="Nombre del empleado"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      <Button title={editingId ? 'Actualizar Empleado' : 'Agregar Empleado'} onPress={handleSave} />
      
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Text style={{ color: 'blue' }}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}
