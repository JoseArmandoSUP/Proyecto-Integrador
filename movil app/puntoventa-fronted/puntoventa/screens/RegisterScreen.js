import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';

export default function RegisterScreen({ navigation }) { // <-- Agregamos navigation
  // 1. Estados para guardar lo que el usuario escribe
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  // 2. Función que se ejecuta al presionar "Registrarse"
  const handleRegister = async () => {
    // Validamos que los campos importantes no estén vacíos
    if (!nombre || !correo || !password) {
      Alert.alert('Atención', 'Nombre, correo y contraseña son obligatorios');
      return;
    }

    try {
      // ⚠️ ¡MUY IMPORTANTE! ⚠️
      // Cambia "192.168.X.X" por la misma IP que usaste en el LoginScreen
   const urlDelBackend = 'http://192.168.137.97:4000/api/registro';

      const response = await fetch(urlDelBackend, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: nombre,
          correo: correo,
          password: password
        })
      });

      const data = await response.json();

      // 3. Revisamos qué respondió el servidor
      if (data.success) {
        Alert.alert('¡Éxito!', 'Cuenta creada correctamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') } // Lo regresamos al Login
        ]);
      } else {
        Alert.alert('Error', data.message); // Ejemplo: "El correo ya existe"
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar al servidor backend. Verifica tu IP.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.title}>Crear cuenta nueva</Text>

      {/* 4. Conectamos los inputs con sus respectivos estados */}
      <TextInput 
        style={styles.input} 
        placeholder="Nombre" 
        placeholderTextColor="#A0A0A0" 
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Correo electrónico" 
        placeholderTextColor="#A0A0A0" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Número de teléfono" 
        placeholderTextColor="#A0A0A0" 
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        placeholderTextColor="#A0A0A0" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />

      {/* 5. Asignamos la función al botón */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleRegister}
      >
        <Text style={styles.primaryButtonText}>Registrarse</Text>
      </TouchableOpacity>

      {/* Botón opcional para regresar por si se arrepiente */}
      <TouchableOpacity 
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={{ color: '#1C296B', textDecorationLine: 'underline' }}>
          Ya tengo cuenta. Volver al Login.
        </Text>
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
  title: {
    fontSize: 18,
    color: '#1C296B',
    fontWeight: 'bold',
    marginBottom: 30,
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
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});