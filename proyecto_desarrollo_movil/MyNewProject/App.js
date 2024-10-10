import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeesScreen from './screens/EmployeesScreen';
import Login from './screens/Login'; // Asegúrate de crear este archivo

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Empleados" component={EmployeesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
