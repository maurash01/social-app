import React, { useEffect,useState } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Alert, Image, Keyboard, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, Text, TextInput } from 'react-native-paper';
import app from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';

const AddPost = ({ db, fetchTodos, modalVisible, setModalVisible, userName }) => {

  const [textInput, setTextInput] = useState('');
  const [submitting, setSubmitting] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadFile(result.assets[0].uri);
    }
  };

  const generateTimestamp = () => {

    return new Date().toISOString();
  }

  const uploadFile = async (uri) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, 'feed-images/${generateTimestamp()}.jpg');

    try {

      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {

          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '%done');
        },
        (error) => {
          console.error("Error Uploading image:", error);
        },
        () => {

          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            setDownloadUrl(downloadURL);

          });
        }
      );
    } catch (error) {
      console.error('Error uploading image', error);
    }
  }

  const addNewPost = async () => {
    console.log(textInput);
    if (!textInput || !downloadUrl) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const postData = {
      user: userName,
      title: textInput,
      image: downloadUrl,
      likes: 0,
      createdAt: new Date()
    }

    try {
      setSubmitting(true);
      const docRef = await addDoc(collection(db, "feeds"), postData);
      setSubmitting(false);
      Keyboard.dismiss();
      console.log("Document written with ID: ", docRef.id);
      // setSnackVisible(true);
      setModalVisible(false);
      setTextInput('');
      fetchTodos();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [])


  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}>


      <View style={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.title}>Add New Post</Text>
          <TextInput
            mode='outlined'
            style={styles.input}
            value={textInput}
            onChangeText={setTextInput}
            placeholder='Post Title'
          />
        </View>
        {image ? <Pressable onPress={pickImage}>
          <Image source={{ uri: image }} style={{
            height: 300,
            resizeMode: 'contain',
          }} />
        </Pressable> : (

          <TouchableOpacity
            style={styles.cameraPlaceholder}
            onPress={pickImage}
          >
            <Icon source='camera' size={100} color='#ccc' />
          </TouchableOpacity>
        )}
        <Button style={{ borderRadius: 5, marginTop: 20 }} mode='contained' onPress={addNewPost} icon="send">  POST</Button>
      </View>
    </Modal >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30
  },
  input: {
    width: '100%',
    marginBottom: 10
  },
  title: {
    marginBottom: 30,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cameraPlaceholder: {
    height: 300,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
  }
})

export default AddPost;