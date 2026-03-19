import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal, Dimensions, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) { 
  const [activeModal, setActiveModal] = useState(null); 
  const [idUsuario, setIdUsuario] = useState(null);

  // ESTADOS PARA DATOS PERSONALES
  const [nombre, setNombre] = useState('');
  const [apellidoP, setApellidoP] = useState('');
  const [apellidoM, setApellidoM] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rfc, setRfc] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('');
  const [cfdi, setCfdi] = useState('');

  // ESTADOS PARA DIRECCIÓN
  const [pais, setPais] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [cp, setCp] = useState('');

  // ESTADOS PARA TARJETA
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaExp, setFechaExp] = useState('');

  useEffect(() => {
    const cargarTodo = async () => {
      const id = await AsyncStorage.getItem('id_usuario');
      if (id) {
        setIdUsuario(id);
        obtenerDatosGuardados(id);
      }
    };
    cargarTodo();
    const unsubscribe = navigation.addListener('focus', () => cargarTodo());
    return unsubscribe;
  }, [navigation]);

  const obtenerDatosGuardados = async (id) => {
    try {
      const resp = await fetch(`http://192.168.137.97:4000/api/cuenta/${id}`);
      const texto = await resp.text(); 
      try {
        const data = JSON.parse(texto);
        if (data.success) {
          
          if (data.cliente) {
            setNombre(data.cliente.nombre || '');
            setApellidoP(data.cliente.apellido_P || '');
            setApellidoM(data.cliente.apellido_M || '');
            setCorreo(data.cliente.correo_electronico_usuario || data.cliente.correo_electronico || '');
            setTelefono(data.cliente.no_telefono || '');
            setRfc(data.cliente.rfc || '');
            setRegimenFiscal(data.cliente.regimen_fiscal || '');
            setCfdi(data.cliente.cfdi || '');
            setPais(data.cliente.pais || '');
            setDireccion(data.cliente.calle_numero || '');
            setCiudad(data.cliente.ciudad || '');
            setCp(data.cliente.codigo_postal || '');
          }
          
          // 🌟 NUEVO: Cargamos los datos de la tarjeta si existen
          if (data.tarjeta) {
            setNombreTarjeta(data.tarjeta.nombre_tarjeta || '');
            setNumeroTarjeta(data.tarjeta.numero_tarjeta || '');
            setFechaExp(data.tarjeta.fecha_expiracion || '');
          }

        }
      } catch (e) {
        console.log("Error JSON:", texto);
      }
    } catch (error) {
      console.log("Error de red", error);
    }
  };

  const guardarDatosPersonales = async () => {
    if (!idUsuario) return Alert.alert('Error', 'Inicia sesión de nuevo.');
    try {
      const resp = await fetch(`http://192.168.137.97:4000/api/cuenta/personales/${idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre, apellido_P: apellidoP, apellido_M: apellidoM, correo, 
          no_telefono: telefono, rfc, regimen_fiscal: regimenFiscal, cfdi 
        })
      });
      const data = await resp.json();
      if (data.success) {
        Alert.alert('Éxito', 'Datos personales guardados');
        setActiveModal(null);
        obtenerDatosGuardados(idUsuario);
      } else { Alert.alert('Error', data.message); }
    } catch (error) { Alert.alert('Error', 'Fallo conexión'); }
  };

  const guardarDireccion = async () => {
    if (!idUsuario) return Alert.alert('Error', 'Inicia sesión de nuevo.');
    try {
      const resp = await fetch(`http://192.168.137.97:4000/api/cuenta/direccion/${idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pais, direccion, ciudad, cp })
      });
      const data = await resp.json();
      if (data.success) {
        Alert.alert('Éxito', 'Dirección guardada');
        setActiveModal(null);
        obtenerDatosGuardados(idUsuario);
      } else { Alert.alert('Error', data.message); }
    } catch (error) { Alert.alert('Error', 'Fallo conexión'); }
  };

  const guardarTarjeta = async () => {
    if (!idUsuario) return Alert.alert('Error', 'Inicia sesión de nuevo.');
    try {
      const resp = await fetch(`http://192.168.137.97:4000/api/cuenta/tarjeta/${idUsuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_tarjeta: nombreTarjeta, numero_tarjeta: numeroTarjeta, fecha_expiracion: fechaExp })
      });
      const data = await resp.json();
      if (data.success) {
        Alert.alert('Éxito', 'Tarjeta guardada');
        setActiveModal(null);
        obtenerDatosGuardados(idUsuario); // Refrescar tarjeta
      } else { Alert.alert('Error', data.message); }
    } catch (error) { Alert.alert('Error', 'Fallo conexión'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header de Mi Cuenta */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi cuenta</Text>
        <View style={styles.userInfoRow}>
          <View style={styles.textContainer}>
            <Text style={styles.userName} numberOfLines={1}>
              {(nombre || apellidoP) ? `${nombre} ${apellidoP}`.trim() : 'Usuario sin nombre'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {correo || 'Cargando correo...'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setActiveModal('personal')}>
            <Feather name="edit" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* ================= DIRECCIÓN ================= */}
        <Text style={styles.sectionTitle}>Ajustes de localización</Text>
        <Text style={styles.subTitle}>Direcciones de envío</Text>
        
        {direccion ? (
          <View style={styles.savedInfoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>País:</Text> {pais}</Text>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>Calle:</Text> {direccion}</Text>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>Ciudad:</Text> {ciudad}</Text>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>C.P.:</Text> {cp}</Text>
            </View>
            <TouchableOpacity style={styles.editBtnSmall} onPress={() => setActiveModal('address')}>
              <Text style={styles.editBtnSmallText}>Editar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.description}>El costo de envío y tiempo de entrega pueden variar dependiendo de la dirección.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setActiveModal('address')}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
              <Text style={styles.addButtonText}>Registrar dirección de envío</Text>
            </TouchableOpacity>
          </>
        )}
        
        <View style={styles.divider} />

        {/* ================= TARJETA ================= */}
        <Text style={styles.sectionTitle}>Ajustes de pagos</Text>
        <Text style={styles.subTitle}>Metodos de pago</Text>
        
        {numeroTarjeta ? (
          <View style={styles.savedInfoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>Titular:</Text> {nombreTarjeta}</Text>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>Tarjeta:</Text> **** {numeroTarjeta.slice(-4)}</Text>
              <Text style={styles.savedInfoText}><Text style={{fontWeight: 'bold'}}>Expira:</Text> {fechaExp}</Text>
            </View>
            <TouchableOpacity style={styles.editBtnSmall} onPress={() => setActiveModal('card')}>
              <Text style={styles.editBtnSmallText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.description}>No tienes ningún método de pago guardado en este momento.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setActiveModal('card')}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
              <Text style={styles.addButtonText}>Añadir nueva tarjeta</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={async () => {
          await AsyncStorage.clear();
          navigation.navigate('Login');
        }}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Store')}>
          <Ionicons name="bag-handle-outline" size={24} color="white" />
          <Text style={styles.navText}>Tienda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={24} color="white" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Checkout')}>
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text style={styles.navText}>Carrito</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL 1: DATOS PERSONALES */}
      <Modal visible={activeModal === 'personal'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Datos Personales y Fiscales</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nombre(s)</Text>
              <TextInput style={styles.modalInput} value={nombre} onChangeText={setNombre} />
              
              <Text style={styles.label}>Apellido Paterno</Text>
              <TextInput style={styles.modalInput} value={apellidoP} onChangeText={setApellidoP} />

              <Text style={styles.label}>Apellido Materno</Text>
              <TextInput style={styles.modalInput} value={apellidoM} onChangeText={setApellidoM} />
              
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput style={styles.modalInput} value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>Número de Teléfono</Text>
              <TextInput style={styles.modalInput} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

              <Text style={styles.label}>RFC</Text>
              <TextInput style={styles.modalInput} value={rfc} onChangeText={setRfc} autoCapitalize="characters" />

              <Text style={styles.label}>Régimen Fiscal</Text>
              <TextInput style={styles.modalInput} value={regimenFiscal} onChangeText={setRegimenFiscal} />

              <Text style={styles.label}>Uso de CFDI</Text>
              <TextInput style={styles.modalInput} value={cfdi} onChangeText={setCfdi} />

              <TouchableOpacity style={styles.saveButton} onPress={guardarDatosPersonales}>
                <Text style={styles.saveButtonText}>Guardar Todo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DIRECCIÓN */}
      <Modal visible={activeModal === 'address'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: width * 0.1 }]}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Dirección de envío</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>País/región de envío</Text>
              <TextInput style={styles.modalInput} value={pais} onChangeText={setPais} />
              <Text style={styles.label}>Dirección (Calle y número)</Text>
              <TextInput style={styles.modalInput} value={direccion} onChangeText={setDireccion} />
              <Text style={styles.label}>Ciudad</Text>
              <TextInput style={styles.modalInput} value={ciudad} onChangeText={setCiudad} />
              <Text style={styles.label}>Código postal</Text>
              <TextInput style={styles.modalInput} value={cp} onChangeText={setCp} keyboardType="numeric" />

              <TouchableOpacity style={styles.saveButton} onPress={guardarDireccion}>
                <Text style={styles.saveButtonText}>Guardar Dirección</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TARJETA */}
      <Modal visible={activeModal === 'card'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tarjeta de Crédito / Débito</Text>
            <Text style={styles.label}>Nombre de la tarjeta</Text>
            <TextInput style={styles.modalInput} value={nombreTarjeta} onChangeText={setNombreTarjeta} />
            <Text style={styles.label}>Número de tarjeta</Text>
            <TextInput style={styles.modalInput} value={numeroTarjeta} onChangeText={setNumeroTarjeta} keyboardType="numeric" />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Fecha (MM/AA)</Text>
                <TextInput style={styles.modalInput} placeholder="MM/AA" value={fechaExp} onChangeText={setFechaExp} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput style={styles.modalInput} placeholder="CVV" keyboardType="numeric" secureTextEntry />
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={guardarTarjeta}>
              <Text style={styles.saveButtonText}>Guardar Tarjeta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { backgroundColor: '#1C296B', padding: width * 0.05, paddingTop: width * 0.1, paddingBottom: width * 0.08, marginTop: 25 },
  headerTitle: { color: 'white', fontSize: width > 350 ? 18 : 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { flex: 1, paddingRight: 10 },
  userName: { color: 'white', fontSize: width > 350 ? 18 : 16, fontWeight: 'bold' },
  userEmail: { color: '#B0B5D1', fontSize: width > 350 ? 14 : 12, textDecorationLine: 'underline' },
  body: { flex: 1, padding: width * 0.05 },
  sectionTitle: { fontSize: width > 350 ? 12 : 11, color: '#999', marginBottom: 10 },
  subTitle: { fontSize: width > 350 ? 16 : 14, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  description: { fontSize: width > 350 ? 12 : 11, color: '#666', marginBottom: 20 },
  
  // Estilos del botón de "Añadir"
  addButton: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: width * 0.04, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  addButtonText: { marginLeft: 10, fontSize: width > 350 ? 14 : 12, color: '#000' },
  
  // 🌟 NUEVOS ESTILOS PARA LAS TARJETAS GUARDADAS
  savedInfoCard: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#358A3F', borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  savedInfoText: { fontSize: width > 350 ? 13 : 11, color: '#333', marginBottom: 3 },
  editBtnSmall: { backgroundColor: '#358A3F', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  editBtnSmallText: { color: 'white', fontSize: width > 350 ? 12 : 10, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  logoutButton: { alignItems: 'flex-end', marginTop: 20, marginBottom: 40 },
  logoutText: { color: '#666', fontSize: width > 350 ? 14 : 12, textDecorationLine: 'underline' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1C296B', height: 60, justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: 'white', fontSize: 10, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#EBEFEB', borderRadius: 20, padding: width * 0.05, maxHeight: '85%' },
  closeIcon: { alignSelf: 'flex-end', marginBottom: 10 },
  modalTitle: { fontSize: width > 350 ? 16 : 14, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: width > 350 ? 12 : 11, color: '#333', marginBottom: 5, marginLeft: 5 },
  modalInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: width * 0.03, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { backgroundColor: '#358A3F', borderRadius: 20, padding: width * 0.03, alignItems: 'center', marginTop: 10, width: width * 0.35, alignSelf: 'center', marginBottom: 20 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: width > 350 ? 14 : 12 }
});