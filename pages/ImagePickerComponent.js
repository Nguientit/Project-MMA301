import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ImagePickerComponent = ({ setImageUri, setNote, imageUri, note }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      setImageUri(uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      setImageUri(uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dish Photo</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImageFromGallery}>
          <Ionicons name="images" size={24} color="#FDEBD0" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imageButton} onPress={takePhotoWithCamera}>
          <Ionicons name="camera" size={24} color="#FDEBD0" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: selectedImage }} style={styles.preview} />
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Photo Note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note about this photo..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              placeholderTextColor="#4D5656"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E67E22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FDEBD0',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 15,
  },
  preview: {
    width: 250,
    height: 200,
  },
  noteContainer: {
    width: '100%',
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#FDEBD0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E67E22',
  },
});

export default ImagePickerComponent;