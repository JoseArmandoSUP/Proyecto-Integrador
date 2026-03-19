import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Obtenemos el ancho de la pantalla del dispositivo
const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  // 🌟 ESTADO PARA GUARDAR LOS PRODUCTOS DEL CARRITO
  const [carrito, setCarrito] = useState([]);

  // 🌟 Cargar el carrito automáticamente al entrar a la pantalla
  useEffect(() => {
    const cargarCarrito = async () => {
      try {
        const carritoGuardado = await AsyncStorage.getItem('carrito_compras');
        if (carritoGuardado) {
          setCarrito(JSON.parse(carritoGuardado));
        }
      } catch (error) {
        console.log("Error al cargar el carrito:", error);
      }
    };
    
    cargarCarrito();
    // Refresca automáticamente si navegas entre pestañas
    const unsubscribe = navigation.addListener('focus', cargarCarrito);
    return unsubscribe;
  }, [navigation]);

  // 🌟 FUNCIÓN PARA SUMAR O RESTAR CANTIDAD
  const modificarCantidad = async (id, cambio) => {
    let nuevoCarrito = [...carrito];
    const index = nuevoCarrito.findIndex(item => item.id_producto === id);
    
    if (index > -1) {
      nuevoCarrito[index].cantidad += cambio;
      
      // Si la cantidad llega a 0, lo borramos de la lista
      if (nuevoCarrito[index].cantidad <= 0) {
        nuevoCarrito.splice(index, 1);
      }
      
      setCarrito(nuevoCarrito);
      await AsyncStorage.setItem('carrito_compras', JSON.stringify(nuevoCarrito));
    }
  };

  // Componente reutilizable para cada item REAL del carrito
  const CartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemRow}>
        {/* Imagen del producto */}
        <View style={styles.productImage}>
          <Ionicons name="shirt" size={width * 0.15} color="#222" />
        </View>
        
        {/* Tarjeta de detalles */}
        <View style={styles.detailsCard}>
          {/* 🌟 CORRECCIÓN: Usar item.nombre_producto */}
          <Text style={styles.productName} numberOfLines={2}>{item.nombre_producto}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.totalText}>Total ({item.cantidad} artículo{item.cantidad > 1 ? 's' : ''})</Text>
            
            {/* Controles de cantidad dinámicos */}
            <View style={styles.qtyContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => modificarCantidad(item.id_producto, -1)}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.qtyValue}>{item.cantidad}</Text>
              
              <TouchableOpacity style={styles.qtyBtn} onPress={() => modificarCantidad(item.id_producto, 1)}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
            
            {/* 🌟 CORRECCIÓN: Usar item.precio en lugar de precio_venta */}
            <Text style={styles.priceText}>
              <Text style={styles.currency}>MXN</Text> $ {item.precio * item.cantidad}
            </Text>
          </View>
        </View>
      </View>
      {/* Botón comprar ahora individual */}
      <TouchableOpacity 
        style={styles.buyNowBtn}
        onPress={() => navigation.navigate('Checkout')} 
      >
        <Text style={styles.buyNowText}>Comprar ahora</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="cube" size={24} color="#1C296B" />
        </View>
        <Text style={styles.headerTitle}>Carrito</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* 🌟 SI ESTÁ VACÍO, MUESTRA UN MENSAJE */}
        {carrito.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#666', fontSize: 16 }}>
            Tu carrito está vacío 🛒
          </Text>
        ) : (
          /* 🌟 SI HAY PRODUCTOS, LOS DIBUJA TODOS */
          carrito.map((producto, index) => (
            <CartItem key={index} item={producto} />
          ))
        )}

        {/* Botón Comprar Todo (Solo aparece si hay productos) */}
        {carrito.length > 0 && (
          <TouchableOpacity 
            style={styles.buyAllBtn}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.buyAllText}>Comprar todo</Text>
          </TouchableOpacity>
        )}

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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart" size={24} color="white" />
          <Text style={styles.navText}>Carrito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: width * 0.04, 
    borderBottomWidth: 4, 
    borderBottomColor: '#1C296B',
    marginTop: 25 
  },
  logoPlaceholder: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#EAEAEA', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#000', 
    flex: 1, 
    textAlign: 'center', 
    marginRight: 50 
  },
  body: { 
    flex: 1, 
    padding: width * 0.04 
  },
  itemContainer: { 
    marginBottom: 15 
  },
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  productImage: { 
    width: width * 0.22, 
    height: width * 0.22, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  detailsCard: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#358A3F', 
    borderRadius: 10, 
    padding: width * 0.03 
  },
  productName: { 
    fontSize: width > 350 ? 14 : 12, 
    color: '#333', 
    marginBottom: 15 
  },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    flexWrap: 'wrap' 
  },
  totalText: { 
    fontSize: width > 350 ? 12 : 10, 
    fontWeight: 'bold' 
  },
  qtyContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#EEE', 
    borderRadius: 5,
    marginHorizontal: 5
  },
  qtyBtn: { 
    paddingHorizontal: 10, 
    paddingVertical: 2 
  },
  qtyText: { 
    fontSize: 16, 
    color: '#666',
    fontWeight: 'bold'
  },
  qtyValue: { 
    paddingHorizontal: 8, 
    fontSize: 14,
    fontWeight: 'bold'
  },
  currency: { 
    fontSize: 8 
  },
  priceText: { 
    fontSize: width > 350 ? 14 : 12, 
    fontWeight: 'bold' 
  },
  buyNowBtn: { 
    borderWidth: 1, 
    borderColor: '#358A3F', 
    borderRadius: 20, 
    paddingVertical: 8, 
    alignItems: 'center', 
    width: width * 0.6, 
    alignSelf: 'flex-end', 
    marginRight: width * 0.02
  },
  buyNowText: { 
    color: '#358A3F', 
    fontWeight: 'bold', 
    fontSize: width > 350 ? 12 : 11 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#EEE', 
    marginTop: 15 
  },
  buyAllBtn: { 
    backgroundColor: '#358A3F', 
    borderRadius: 25, 
    paddingVertical: 15, 
    alignItems: 'center', 
    marginVertical: 30, 
    width: width * 0.7, 
    alignSelf: 'center' 
  },
  buyAllText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#1C296B', 
    height: 60, 
    justifyContent: 'space-around', 
    alignItems: 'center' 
  },
  navItem: { 
    alignItems: 'center',
    flex: 1 
  },
  navText: { 
    color: 'white', 
    fontSize: 10, 
    marginTop: 2 
  }
});