import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

export default function RecoverPasswordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.title}>Recuperar contraseña</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Correo" 
        placeholderTextColor="#A0A0A0" 
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Nueva contraseña" 
        placeholderTextColor="#A0A0A0" 
        secureTextEntry 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Confirmar contraseña" 
        placeholderTextColor="#A0A0A0" 
        secureTextEntry 
      />

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
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