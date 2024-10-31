import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import Svg, { Circle, Path } from 'react-native-svg';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Empleados');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/battaglia.jpg')} style={styles.backgroundImage} />
      <View style={styles.form}>
        <View style={styles.icono}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            width="100"
            height="100"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="#ffffff"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <Path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <Path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <Path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
          </Svg>
        </View>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 28,
    textAlign: 'center',
    color:'#fff',
  },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white', // Fondo blanco para el input
    color: 'black', // Texto en negro dentro del input
  },
  form: {
    backgroundColor: "#246a7099",
    padding: 20,
    borderRadius: 20,
    borderColor: "#000",
    borderWidth: 1,
  },
  buttonText: {
    paddingHorizontal: 15,
    paddingVertical: 15,  
    backgroundColor: "#1092a388",
    textAlign: "center",  
    borderRadius: 20,
    marginTop: 10,
    color: "#fff",
    fontSize: 20,
    borderColor: "#000",
    borderWidth: 1,
  },
  icono: {
    alignItems: "center"
  }
});
