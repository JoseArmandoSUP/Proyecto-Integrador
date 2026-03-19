import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CheckoutScreen({ navigation }) {
  const [clienteInfo, setClienteInfo] = useState(null);
  const [tarjetaInfo, setTarjetaInfo] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [totalPagar, setTotalPagar] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarDatosDelBackend();
      cargarCarrito();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarDatosDelBackend = async () => {
    setCargando(true);
    try {
      const idUsuario = await AsyncStorage.getItem('id_usuario');
      if (!idUsuario) return;

      const response = await fetch(`http://192.168.137.97:4000/api/cuenta/${idUsuario}`);
      const data = await response.json();

      if (data.success) {
        setClienteInfo(data.cliente);
        setTarjetaInfo(data.tarjeta);
      }
    } catch (error) {
      console.error("Error cargando datos del checkout:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCarrito = async () => {
    try {
      const carritoGuardado = await AsyncStorage.getItem('carrito_compras');
      if (carritoGuardado) {
        const productos = JSON.parse(carritoGuardado);
        setCarrito(productos);
        
        let total = 0;
        productos.forEach(item => {
          total += item.precio * item.cantidad;
        });
        setTotalPagar(total);
      } else {
        setCarrito([]);
        setTotalPagar(0);
      }
    } catch (error) {
      console.log("Error al cargar el carrito:", error);
    }
  };

  // 🌟 FUNCIÓN CORREGIDA PARA PREVENIR ERRORES DEL SERVIDOR
  const procesarCompraBD = async () => {
    if (carrito.length === 0) {
      return Alert.alert("Carrito vacío", "Agrega productos antes de comprar.");
    }
    if (!clienteInfo?.calle_numero || !tarjetaInfo) {
      return Alert.alert("Faltan datos", "Por favor completa tu dirección y método de pago en tu Perfil antes de continuar.");
    }

    setProcesandoPago(true);

    try {
      const idUsuario = await AsyncStorage.getItem('id_usuario');
      
      const response = await fetch(`http://192.168.137.97:4000/api/cuenta/comprar/${idUsuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrito })
      });

      // Leemos la respuesta como texto primero para evitar el error del "<"
      const textoRespuesta = await response.text();
      
      try {
        const data = JSON.parse(textoRespuesta);

        if (data.success) {
          Alert.alert("¡Compra Exitosa!", "Tu pago fue aprobado y registrado en el sistema. ¡Gracias!", [
            { 
              text: "Ir a la Tienda", 
              onPress: async () => {
                await AsyncStorage.removeItem('carrito_compras'); // Vaciamos el carrito local
                navigation.navigate('Store');
              } 
            }
          ]);
        } else {
          Alert.alert("Error", data.message);
        }
      } catch (parseError) {
        console.error("El servidor falló y mandó esto:", textoRespuesta);
        Alert.alert("Error del servidor", "Hubo un problema procesando el pago en la base de datos.");
      }

    } catch (error) {
      console.error("Error al pagar:", error);
      Alert.alert("Error de Red", "No se pudo conectar con el servidor para procesar el pago.");
    } finally {
      setProcesandoPago(false);
    }
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1C296B" />
        <Text style={{ marginTop: 10 }}>Cargando información...</Text>
      </View>
    );
  }

  const nombreCompleto = clienteInfo?.nombre ? `${clienteInfo.nombre} ${clienteInfo.apellido_P || ''}` : 'No registrado';
  const correo = clienteInfo?.correo_electronico_usuario || clienteInfo?.correo_electronico || 'No registrado';
  const telefono = clienteInfo?.no_telefono || 'No registrado';
  
  let direccion = 'Aún no registras una dirección de envío.';
  if (clienteInfo?.calle_numero) {
    direccion = `${clienteInfo.calle_numero}, ${clienteInfo.ciudad}, ${clienteInfo.pais}. C.P: ${clienteInfo.codigo_postal}`;
  }
  
  const ultimos4 = tarjetaInfo?.numero_tarjeta ? tarjetaInfo.numero_tarjeta.slice(-4) : 'XXXX';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="cube" size={24} color="#1C296B" />
        </View>
        <Text style={styles.headerTitle}>Confirmar compra</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Tu pedido</Text>
        
        {carrito.length === 0 ? (
          <Text style={{ color: '#666', marginBottom: 15 }}>No hay productos en el pedido.</Text>
        ) : (
          carrito.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.productImage}>
                <Ionicons name="shirt" size={width * 0.15} color="#222" />
              </View>
              <View style={styles.detailsCard}>
                <Text style={styles.productName} numberOfLines={2}>{item.nombre_producto}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.totalText}>Cant: {item.cantidad}</Text>
                  <Text style={styles.priceText}>
                    <Text style={styles.currency}>MXN</Text> $ {item.precio * item.cantidad}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {carrito.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.granTotalText}>Total a pagar:</Text>
            <Text style={styles.granTotalMonto}>$ {totalPagar}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Cliente</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>{nombreCompleto}</Text>
            <Text style={styles.infoText}>{correo}</Text>
            <Text style={styles.infoText}>{telefono}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.changeBtnText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Dirección de envío</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>{direccion}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.changeBtnText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoTextContainer}>
            {tarjetaInfo ? (
              <>
                <Text style={styles.infoText}>{tarjetaInfo.nombre_tarjeta}</Text>
                <Text style={styles.infoText}>Tarjeta **** {ultimos4}</Text>
              </>
            ) : (
              <Text style={styles.infoText}>No tienes tarjeta registrada</Text>
            )}
          </View>
          <TouchableOpacity style={styles.changeBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.changeBtnText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.payBtn}
          onPress={procesarCompraBD}
          disabled={procesandoPago}
        >
          {procesandoPago ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payBtnText}>Aceptar y pagar</Text>
          )}
        </TouchableOpacity>
        
      </ScrollView>

      {/* Barra de Navegación Inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Store')}>
          <Ionicons name="bag-handle-outline" size={24} color="white" />
          <Text style={styles.navText}>Tienda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="white" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={24} color="white" />
          <Text style={styles.navText}>Carrito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: width * 0.04, borderBottomWidth: 4, borderBottomColor: '#1C296B', marginTop: 25 },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTitle: { fontSize: width > 350 ? 20 : 18, fontWeight: 'bold', color: '#000', flex: 1, textAlign: 'center', marginRight: 50 },
  body: { flex: 1, padding: width * 0.05 },
  sectionTitle: { fontSize: width > 350 ? 16 : 14, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productImage: { width: width * 0.22, height: width * 0.22, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  detailsCard: { flex: 1, borderWidth: 1, borderColor: '#358A3F', borderRadius: 10, padding: width * 0.035 },
  productName: { fontSize: width > 350 ? 14 : 12, color: '#333', marginBottom: 15, fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  totalText: { fontSize: width > 350 ? 12 : 10, fontWeight: 'bold', color: '#666' },
  currency: { fontSize: 8 },
  priceText: { fontSize: width > 350 ? 14 : 12, fontWeight: 'bold', color: '#1C296B' },

  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0F0F0', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
  granTotalText: { fontSize: 16, fontWeight: 'bold' },
  granTotalMonto: { fontSize: 18, fontWeight: 'bold', color: '#1C296B' },

  infoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#358A3F', borderRadius: 10, padding: width * 0.04, marginBottom: 10 },
  infoTextContainer: { flex: 1, paddingRight: 10 },
  infoText: { fontSize: width > 350 ? 12 : 11, color: '#333', marginBottom: 3 },
  changeBtn: { backgroundColor: '#358A3F', paddingVertical: width * 0.015, paddingHorizontal: width * 0.035, borderRadius: 15 },
  changeBtnText: { color: 'white', fontSize: width > 350 ? 12 : 10 },
  payBtn: { backgroundColor: '#358A3F', borderRadius: 25, paddingVertical: width * 0.04, alignItems: 'center', marginVertical: 30, width: width * 0.7, alignSelf: 'center' },
  payBtnText: { color: 'white', fontWeight: 'bold', fontSize: width > 350 ? 16 : 14 },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1C296B', height: 60, justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: 'white', fontSize: 10, marginTop: 2 }
});