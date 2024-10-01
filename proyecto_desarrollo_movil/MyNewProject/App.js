import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Importa íconos para las estrellas

const juegodetronos = require('./assets/juego of tronos.jpg');
const resistencia = require('./assets/resistencia1.jpg');
const sacary = require('./assets/sacary.jpg');
const soyleyenda = require('./assets/soyleyenda.jpg');
const wonka = require('./assets/wonka.jpg');

export default function App() {
  // Datos de las películas con imágenes y rating inicial en 0
  const [peliculas, setPeliculas] = useState([
    { id: '1', titulo: 'Game of thrones', calificacion: 0, imagen:juegodetronos },
    { id: '2', titulo: 'Resistencia', calificacion: 0, imagen:resistencia },
    { id: '3', titulo: 'Scary Movie', calificacion: 0, imagen: sacary },
    { id: '4', titulo: 'Soy Leyenda', calificacion: 0, imagen: soyleyenda },
    { id: '5', titulo: 'Charlie y la fabrica de chocolates', calificacion: 0, imagen: wonka },
  ]);

  // Función para actualizar la calificación de una película
  const calificarPelicula = (id, estrellas) => {
    setPeliculas((prevPeliculas) =>
      prevPeliculas.map((pelicula) =>
        pelicula.id === id ? { ...pelicula, calificacion: estrellas } : pelicula
      )
    );
  };

  // Renderizar cada película con su imagen, título y estrellas para clasificar
  const renderizarPelicula = ({ item }) => {
    return (
      <View style={styles.peliculaContainer}>
        <Image source={item.imagen} style={styles.imagenPelicula} />
        <Text style={styles.tituloPelicula}>{item.titulo}</Text>
        <View style={styles.estrellasContainer}>
          {[1, 2, 3, 4, 5].map((estrella) => (
            <TouchableOpacity key={estrella} onPress={() => calificarPelicula(item.id, estrella)}>
              <FontAwesome
                name={estrella <= item.calificacion ? 'star' : 'star-o'}
                size={32}
                color={estrella <= item.calificacion ? '#FFD700' : '#CCCCCC'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Clasificación de Películas y Series 🎬</Text>
      <FlatList
        data={peliculas} // Datos de las películas
        renderItem={renderizarPelicula} // Función para renderizar cada película
        keyExtractor={(item) => item.id.toString()} // Asigna la clave única a cada elemento
      />
    </View>
  );
}

// Estilos para la aplicación
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  peliculaContainer: {
    backgroundColor:'#EEEEEE',
    borderRadius: 38,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  imagenPelicula: {
    width: 150,
    height: 220,
    borderRadius: 8,
    marginBottom: 10,
  },
  tituloPelicula: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  estrellasContainer: {
    flexDirection: 'row',
  },
});
