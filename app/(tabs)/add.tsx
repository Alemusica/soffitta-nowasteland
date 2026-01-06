/**
 * Add Item Screen - Soffitta NoWasteLand
 * 
 * Swiss Typography Design - Economia circolare
 * Riuso, non prestito/baratto/vendita
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useItemsStore } from '@/stores/itemsStore';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import {
  ITEM_LABELS,
  LABEL_INFO,
  COMMON_ROOMS,
  COMMON_FURNITURE,
  ItemLabel,
} from '@/constants/labels';
import { ItemCondition, ItemVisibility } from '@/lib/database.types';
import { VoiceInput } from '@/components/VoiceInput';
import { useColors } from '@/stores/themeStore';

type InputMode = 'manual' | 'voice';

export default function AddItemScreen() {
  const colors = useColors();
  const { addItem, categories } = useItemsStore();
  const { user } = useAuthStore();
  
  // Input mode
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [condition, setCondition] = useState<ItemCondition>('buono');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(['disponibile']);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Location
  const [locationRoom, setLocationRoom] = useState('');
  const [locationRoomCustom, setLocationRoomCustom] = useState('');
  const [locationFurniture, setLocationFurniture] = useState('');
  const [locationFurnitureCustom, setLocationFurnitureCustom] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  
  // Visibility - semplificato: solo privato o riuso
  const [visibility, setVisibility] = useState<ItemVisibility>('private');
  
  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Toggle label
  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };
  
  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };
  
  // Take photo
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Errore', 'Permesso fotocamera negato');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };
  
  // Upload image
  const uploadImage = async (uri: string) => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      const filename = `${user.id}/${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const { error } = await supabase.storage
        .from('item-photos')
        .upload(filename, blob, { contentType: 'image/jpeg' });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filename);
      
      setPhotos((prev) => [...prev, publicUrl]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Errore', 'Impossibile caricare l\'immagine');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };
  
  // Get final room name
  const getFinalRoom = () => {
    if (locationRoom === 'Altro' && locationRoomCustom) {
      return locationRoomCustom;
    }
    return locationRoom;
  };
  
  // Get final furniture name
  const getFinalFurniture = () => {
    if (locationFurniture === 'Altro' && locationFurnitureCustom) {
      return locationFurnitureCustom;
    }
    return locationFurniture;
  };
  
  // Reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId(null);
    setCondition('buono');
    setSelectedLabels(['disponibile']);
    setPhotos([]);
    setLocationRoom('');
    setLocationRoomCustom('');
    setLocationFurniture('');
    setLocationFurnitureCustom('');
    setLocationDetail('');
    setVisibility('private');
  };
  
  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Inserisci un nome per l\'oggetto');
      return;
    }
    
    if (!user) {
      Alert.alert('Errore', 'Devi essere loggato');
      return;
    }
    
    setIsLoading(true);
    
    const { data, error } = await addItem({
      owner_id: user.id,
      name: name.trim(),
      description: description.trim() || null,
      category_id: categoryId,
      condition,
      labels: selectedLabels,
      photos,
      location_room: getFinalRoom() || null,
      location_furniture: getFinalFurniture() || null,
      location_detail: locationDetail || null,
      visibility,
      sharing_mode: null, // Rimosso - economia orizzontale pura
      price_cents: null,  // Rimosso - tutto gratuito
    });
    
    setIsLoading(false);
    
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert(
        '✓ Aggiunto',
        `"${name}" è nella tua soffitta`,
        [{ 
          text: 'OK', 
          onPress: () => {
            resetForm();
            router.push('/(tabs)');
          }
        }]
      );
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
    >
      {/* Mode toggle - Minimal */}
      <View style={[styles.modeToggle, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.modeButton, 
            inputMode === 'manual' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setInputMode('manual')}
        >
          <Text style={[
            styles.modeText, 
            { color: inputMode === 'manual' ? '#fff' : colors.textMuted }
          ]}>
            Scrivi
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton, 
            inputMode === 'voice' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setInputMode('voice')}
        >
          <Text style={[
            styles.modeText, 
            { color: inputMode === 'voice' ? '#fff' : colors.textMuted }
          ]}>
            Parla
          </Text>
        </TouchableOpacity>
      </View>
      
      {inputMode === 'voice' ? (
        // VOICE MODE
        <View style={styles.voiceMode}>
          <VoiceInput
            onTranscription={(text) => {
              setName(text);
              setInputMode('manual');
              Alert.alert(
                '✓ Trascritto',
                `"${text}"\n\nRivedi e completa.`,
                [{ text: 'OK' }]
              );
            }}
            onError={(error) => {
              Alert.alert('Errore', error);
            }}
            placeholder="Tieni premuto e parla"
          />
          
          <Text style={[styles.voiceHint, { color: colors.textMuted }]}>
            Es: "Cacciavite a stella, nel cassetto della scrivania in studio"
          </Text>
        </View>
      ) : (
        // MANUAL MODE
        <>
          {/* Nome - Campo principale */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>NOME</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Cosa hai trovato?"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>
          
          {/* Foto */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>FOTO</Text>
            <View style={styles.photosRow}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoThumb}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {photos.length < 3 && (
                <TouchableOpacity
                  style={[styles.photoAdd, { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                  }]}
                  onPress={pickImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Categoria */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORIA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      categoryId === cat.id && { 
                        backgroundColor: colors.primary + '20', 
                        borderColor: colors.primary 
                      },
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={styles.chipIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.chipText,
                      { color: categoryId === cat.id ? colors.primary : colors.textSecondary }
                    ]}>
                      {cat.name_it}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Ubicazione */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DOVE</Text>
            
            {/* Stanza */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {COMMON_ROOMS.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      locationRoom === room.name && { 
                        backgroundColor: colors.primary + '20', 
                        borderColor: colors.primary 
                      },
                    ]}
                    onPress={() => {
                      setLocationRoom(room.name);
                      if (room.name !== 'Altro') setLocationRoomCustom('');
                    }}
                  >
                    <Text style={styles.chipIcon}>{room.emoji}</Text>
                    <Text style={[
                      styles.chipText,
                      { color: locationRoom === room.name ? colors.primary : colors.textSecondary }
                    ]}>
                      {room.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            {/* Campo custom per "Altro" stanza */}
            {locationRoom === 'Altro' && (
              <TextInput
                style={[styles.inputSmall, { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                  color: colors.text,
                  marginTop: 8 
                }]}
                value={locationRoomCustom}
                onChangeText={setLocationRoomCustom}
                placeholder="Specifica dove..."
                placeholderTextColor={colors.textMuted}
              />
            )}
            
            {/* Mobile */}
            <View style={{ marginTop: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {COMMON_FURNITURE.map((furniture) => (
                    <TouchableOpacity
                      key={furniture.id}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        locationFurniture === furniture.name && { 
                          backgroundColor: colors.primary + '20', 
                          borderColor: colors.primary 
                        },
                      ]}
                      onPress={() => {
                        setLocationFurniture(furniture.name);
                        if (furniture.name !== 'Altro') setLocationFurnitureCustom('');
                      }}
                    >
                      <Text style={styles.chipIcon}>{furniture.emoji}</Text>
                      <Text style={[
                        styles.chipText,
                        { color: locationFurniture === furniture.name ? colors.primary : colors.textSecondary }
                      ]}>
                        {furniture.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              {/* Campo custom per "Altro" mobile */}
              {locationFurniture === 'Altro' && (
                <TextInput
                  style={[styles.inputSmall, { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    color: colors.text,
                    marginTop: 8 
                  }]}
                  value={locationFurnitureCustom}
                  onChangeText={setLocationFurnitureCustom}
                  placeholder="Specifica contenitore..."
                  placeholderTextColor={colors.textMuted}
                />
              )}
            </View>
            
            {/* Dettaglio */}
            <TextInput
              style={[styles.inputSmall, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text,
                marginTop: 12 
              }]}
              value={locationDetail}
              onChangeText={setLocationDetail}
              placeholder="Dettaglio posizione (opzionale)"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          
          {/* Condizione */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CONDIZIONE</Text>
            <View style={styles.chipsRow}>
              {[
                { value: 'nuovo', label: 'Nuovo' },
                { value: 'ottimo', label: 'Ottimo' },
                { value: 'buono', label: 'Buono' },
                { value: 'usato', label: 'Usato' },
                { value: 'da_riparare', label: 'Da riparare' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    condition === c.value && { 
                      backgroundColor: colors.primary + '20', 
                      borderColor: colors.primary 
                    },
                  ]}
                  onPress={() => setCondition(c.value as ItemCondition)}
                >
                  <Text style={[
                    styles.chipText,
                    { color: condition === c.value ? colors.primary : colors.textSecondary }
                  ]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>NOTE</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Dettagli, difetti, dimensioni..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Riuso - Economia circolare */}
          <View style={[styles.reuseSection, { 
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border 
          }]}>
            <View style={styles.reuseHeader}>
              <View>
                <Text style={[styles.reuseTitle, { color: colors.text }]}>
                  ♻️ Disponibile per riuso
                </Text>
                <Text style={[styles.reuseSubtitle, { color: colors.textMuted }]}>
                  Visibile ai vicini che cercano
                </Text>
              </View>
              <Switch
                value={visibility === 'public'}
                onValueChange={(v) => setVisibility(v ? 'public' : 'private')}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={visibility === 'public' ? colors.primary : colors.textMuted}
              />
            </View>
            
            {visibility === 'public' && (
              <Text style={[styles.reuseNote, { color: colors.textMuted }]}>
                L'oggetto resta tuo. Chi lo vuole ti contatta.
                {'\n'}Economia orizzontale: niente soldi, solo riuso.
              </Text>
            )}
          </View>
          
          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Aggiungi</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  voiceMode: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  voiceHint: {
    marginTop: 24,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  inputSmall: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photosRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    padding: 2,
  },
  photoAdd: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '400',
  },
  reuseSection: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  reuseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reuseTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  reuseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  reuseNote: {
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
