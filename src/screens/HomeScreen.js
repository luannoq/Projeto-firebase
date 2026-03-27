import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = [];
      snapshot.forEach((docSnap) => notesData.push({ id: docSnap.id, ...docSnap.data() }));
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar as notas. Verifique os índices ou permissões.');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = (id) => {
    Alert.alert('Deletar Nota', 'Tem certeza que deseja apagar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'notes', id));
          } catch (error) {
            Alert.alert('Erro ao deletar', error.message);
          }
      }}
    ]);
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardText} numberOfLines={2}>{item.content}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('NoteModal', { note: item })}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Olá, {user?.email}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar nota por título..."
        value={search}
        onChangeText={setSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
             <Text style={styles.emptyText}>Nenhuma nota encontrada.</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NoteModal')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center', paddingTop: 40 },
  headerText: { fontSize: 16, fontWeight: 'bold', maxWidth: '80%' },
  logoutBtn: { padding: 8, backgroundColor: '#ff3b30', borderRadius: 5 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  searchInput: { margin: 15, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  card: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, padding: 15, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  cardContent: { marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardText: { fontSize: 14, color: '#555' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  editBtn: { marginRight: 15 },
  deleteBtn: {},
  actionText: { color: '#007AFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#007AFF', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold' }
});
