import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from '../contexts/AuthContext';

export default function NoteModal({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const note = route.params?.note;
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erro', 'Título e conteúdo são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (note) {
        const noteRef = doc(db, 'notes', note.id);
        await updateDoc(noteRef, {
          title,
          content,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'notes'), {
          userId: user.uid,
          title,
          content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro ao salvar', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{note ? 'Editar Nota' : 'Nova Nota'}</Text>

      <TextInput
        style={styles.inputTitle}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.inputContent}
        placeholder="Conteúdo"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  inputTitle: { fontSize: 18, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 10, marginBottom: 20 },
  inputContent: { flex: 1, fontSize: 16, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#8e8e93' },
  saveBtn: { backgroundColor: '#007AFF' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});