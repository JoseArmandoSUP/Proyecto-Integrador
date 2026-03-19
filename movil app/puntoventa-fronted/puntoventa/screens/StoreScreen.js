import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StoreScreen({ navigation }) {
  const [productosTotales, setProductosTotales] = useState([]); 
  const [productosFiltrados, setProductosFiltrados] = useState([]); 
  const [cargando, setCargando] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');

  const categoriasMenu = ['Todo', 'Electrónica', 'Ropa', 'Alimentos'];

  useEffect(() => {
    obtenerProductos();
    const unsubscribe = navigation.addListener('focus', () => {
      obtenerProductos();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let resultado = productosTotales;

    if (categoriaActiva !== 'Todo') {
      resultado = resultado.filter(item => {
        if (!item.nombre_categoria) return false;
        return item.nombre_categoria.trim().toLowerCase() === categoriaActiva.trim().toLowerCase();
      });
    }

    if (busqueda.trim() !== '') {
      const textoBusqueda = busqueda.trim().toLowerCase();
      resultado = resultado.filter(item => {
        const nombre = item.nombre_producto ? item.nombre_producto.toLowerCase() : '';
        const desc = item.descripcion ? item.descripcion.toLowerCase() : '';
        return nombre.includes(textoBusqueda) || desc.includes(textoBusqueda);
      });
    }

    setProductosFiltrados(resultado);
  }, [busqueda, categoriaActiva, productosTotales]);

  const obtenerProductos = async () => {
    try {
      const response = await fetch('http://192.168.137.97:4000/api/productos');
      const data = await response.json();
      
      if (data.success) {
        setProductosTotales(data.data);
        setProductosFiltrados(data.data); 
      } else {
        console.log("Error al cargar:", data.message);
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = async (producto) => {
    try {
      const carritoGuardado = await AsyncStorage.getItem('carrito_compras');
      let carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      const index = carrito.findIndex(item => item.id_producto === producto.id_producto);
      let cantidadActualEnCarrito = index > -1 ? carrito[index].cantidad : 0;

      if (cantidadActualEnCarrito >= producto.cantidad_disponible) {
        Alert.alert("Límite de stock", `Solo hay ${producto.cantidad_disponible} unidades disponibles de ${producto.nombre_producto}.`);
        return false; 
      }

      if (index > -1) {
        carrito[index].cantidad += 1; 
      } else {
        carrito.push({ ...producto, cantidad: 1 }); 
      }

      await AsyncStorage.setItem('carrito_compras', JSON.stringify(carrito));
      Alert.alert("¡Agregado!", `${producto.nombre_producto} se añadió a tu carrito 🛒`);
      return true; 

    } catch (error) {
      console.log("Error al guardar en carrito:", error);
      return false;
    }
  };

  const renderProducto = ({ item }) => {
    const estaAgotado = item.cantidad_disponible <= 0;

    return (
      <View style={styles.card}>
        
        {item.nombre_categoria && (
          <Text style={styles.catBadge}>{item.nombre_categoria}</Text>
        )}

        <Image 
          source={{ uri: 'https://via.placeholder.com/150/000000/FFFFFF?text=Producto' }} 
          style={styles.productImage} 
        />
        
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>MXN</Text>
          <Text style={styles.price}>$ {item.precio}</Text>
        </View>
        
        <Text style={styles.productDesc} numberOfLines={2}>
          {item.nombre_producto} - {item.descripcion}
        </Text>

        <Text style={[styles.stockText, estaAgotado && styles.stockAgotado]}>
          {estaAgotado ? "Agotado" : `Disponibles: ${item.cantidad_disponible}`}
        </Text>
        
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.cartButton, estaAgotado && { opacity: 0.5 }]} 
            disabled={estaAgotado}
            onPress={() => agregarAlCarrito(item)}
          >
            <Ionicons name="cart-outline" size={16} color={estaAgotado ? "#999" : "#358A3F"} />
            <Text style={[styles.cartButtonText, estaAgotado && { color: '#999' }]}>Agregar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.buyButton, estaAgotado && { backgroundColor: '#999' }]} 
            disabled={estaAgotado}
            onPress={async () => {
              const seAgrego = await agregarAlCarrito(item);
              if(seAgrego) navigation.navigate('Cart'); 
            }}>
            <Text style={styles.buyButtonText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tienda</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar producto..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
           <TouchableOpacity onPress={() => setBusqueda('')}>
             <Ionicons name="close-circle" size={20} color="#999" />
           </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoriasMenu}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.categoryTab, categoriaActiva === item && styles.categoryTabActive]}
              onPress={() => setCategoriaActiva(item)}
            >
              <Text style={[styles.categoryText, categoriaActiva === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 🌟 ENVOLVIMOS ESTA PARTE EN UN VIEW CON flex: 1 */}
      <View style={{ flex: 1 }}>
        {cargando ? (
          <ActivityIndicator size="large" color="#1C296B" style={{ marginTop: 50 }} />
        ) : productosFiltrados.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
            No encontramos productos para tu búsqueda.
          </Text>
        ) : (
          <FlatList
            data={productosFiltrados} 
            keyExtractor={(item) => item.id_producto.toString()}
            numColumns={2}
            contentContainerStyle={styles.productList}
            renderItem={renderProducto}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Store')}>
          <Ionicons name="bag-handle" size={24} color="white" />
          <Text style={styles.navText}>Tienda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="white" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={24} color="white" />
          <Text style={styles.navText}>Carrito</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: '#1C296B', marginTop: 25 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 15, paddingHorizontal: 15, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#DDD', backgroundColor: '#F9F9F9' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  
  categoriesContainer: { paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#358A3F' },
  categoryTab: { paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#EEE' },
  categoryTabActive: { backgroundColor: '#1C296B' },
  categoryText: { fontSize: 14, color: '#666', fontWeight: '500' },
  categoryTextActive: { color: '#FFF', fontWeight: 'bold' },
  
  productList: { padding: 10 },
  card: { flex: 1, backgroundColor: '#EAEAEA', margin: 5, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#358A3F' },
  
  catBadge: { position: 'absolute', top: 5, left: 5, backgroundColor: '#358A3F', color: 'white', fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, zIndex: 1, overflow: 'hidden' },

  productImage: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 10, marginTop: 10 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', alignSelf: 'flex-start', width: '100%', backgroundColor: '#F0F0F0', padding: 5, borderRadius: 5, borderWidth: 1, borderColor: '#358A3F' },
  currency: { fontSize: 10, color: '#666', marginRight: 5 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  productDesc: { fontSize: 10, color: '#333', textAlign: 'center', marginVertical: 8, height: 30 },
  stockText: { fontSize: 11, color: '#358A3F', fontWeight: 'bold', marginBottom: 8 },
  stockAgotado: { color: '#D32F2F' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 5 },
  cartButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#358A3F', borderRadius: 15, paddingVertical: 4, paddingHorizontal: 5, flex: 1, marginRight: 5 },
  cartButtonText: { fontSize: 10, color: '#358A3F', marginLeft: 2 },
  buyButton: { backgroundColor: '#358A3F', borderRadius: 15, paddingVertical: 4, paddingHorizontal: 10, flex: 1, alignItems: 'center', justifyContent: 'center' },
  buyButtonText: { fontSize: 10, color: '#FFF', fontWeight: 'bold' },
  bottomNav: { flexDirection: 'row', backgroundColor: '#1C296B', height: 60, justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: 'white', fontSize: 10, marginTop: 2 }
});