import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
// 🌟 NUEVO: Importamos AsyncStorage para guardar el ID en la memoria
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  // 1. Estados para guardar lo que escribe el usuario
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  // 2. Función para conectarse al backend
  const handleLogin = async () => {
    // Validar que no deje campos vacíos
    if (!correo || !password) {
      Alert.alert('Atención', 'Por favor ingresa tu correo y contraseña');
      return;
    }

    try {
      // Tu IP actual
      const urlDelBackend = 'http://192.168.137.97:4000/api/login';

      const response = await fetch(urlDelBackend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: correo,
          password: password
        })
      });

      const data = await response.json();

      // 3. Revisar qué respondió el servidor
      if (data.success) {
        // 🌟 NUEVO: Guardamos el token y el id_usuario en el celular
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('id_usuario', data.usuario.id_usuario.toString());
        
        // Si el login es correcto, lo dejamos pasar a la Tienda
        navigation.navigate('Store');
      } else {
        // Si la contraseña o correo están mal, mostramos el error
        Alert.alert('Error de acceso', data.message);
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor backend. Verifica tu IP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Icono de usuario */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <View style={styles.avatarHead} />
          <View style={styles.avatarBody} />
        </View>
      </View>

      {/* 4. Conectamos los Inputs con los estados */}
      <TextInput 
        style={styles.input} 
        placeholder="Correo electrónico" 
        placeholderTextColor="#A0A0A0" 
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none" // Evita que la primera letra se ponga mayúscula sola
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        placeholderTextColor="#A0A0A0" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />

      {/* 5. Al presionar, ejecuta la función handleLogin */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleLogin} 
      >
        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('Recover')} 
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('Register')} 
      >
        <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#358A3F', 
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avatarHead: {
    width: 35,
    height: 35,
    backgroundColor: 'white',
    borderRadius: 17.5,
    marginBottom: 5,
  },
  avatarBody: {
    width: 70,
    height: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  input: {
    width: '90%',
    backgroundColor: '#1C296B', 
    color: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#358A3F', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  forgotPassword: {
    marginBottom: 40,
  },
  forgotText: {
    color: '#333',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#1C296B', 
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    position: 'absolute',
    bottom: 50,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});