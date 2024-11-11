import React from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import {storage } from "../src/firebaseConfig";

import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Importación modular para trabajar con el storage
import { err } from "react-native-svg";


export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      imageFirebase: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQz34OmNVyIMh1rguNfXC3MBk7Qq3DTduJVVg&s"
    }
  }
  uploadImage = (uri) => {
    return new Promise((resolve, reject) => {
      const file = uri;
      const blob = new Blob([file], {type: "image/jpeg"});
      resolve(blob)
    });

  };

  openGallery = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status) {
      const resultadoImagen = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1 
      })
      if (resultadoImagen.canceled === false) {
        const imageUri = resultadoImagen.assets[0]?.uri;
        
        this.uploadImage(imageUri).then(resolve => {

          const storageRef = ref(storage, "images/miavatar");
          const uploadTask = uploadBytesResumable(storageRef, resolve)
          console.log("Subir archivo: "+ uploadTask)

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Progreso de la carga: " + progress + "%");
            },
            (error) => {
              console.log("Error al cargar la imagen", error);
            },
            () => {

              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log('Archivo disponible en:', downloadURL);
                this.setState({ imageFirebase: downloadURL });
              }).catch((err) => {
                console.log ("Error al obtener la URL de descarga", err)
                });
            }
          );
        }).catch((error) => {
          console.log(error);  // Capturamos cualquier error durante la carga
        });
      } else {
        console.log("Imagen no seleccionada");
      }
    } else {
      console.log("No se concedieron permisos para acceder a la galería");
    }
  };

  checkImage = () => {
    const { imageFirebase} = this.state;

    if (imageFirebase) {
      return (
        <Image
          style={{width:300, height:300}}
          source={{ uri: imageFirebase}} 
        />
      );
    }
    return null;
  };
  
  render() {
    return (
      <View style={styles.container}>
        {this.checkImage()}
        <Button
          onPress={() => this.openGallery()}
          title="Seleccionar una imagen"
          color="#000"
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20, 
  },
});