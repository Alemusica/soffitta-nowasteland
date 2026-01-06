import { useState, useCallback } from 'react';
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
import { ItemCondition, ItemVisibility, SharingMode } from '@/lib/database.types';
import { VoiceInput } from '@/components/VoiceInput';

type InputMode = 'manual' | 'voice';

export default function AddItemScreen() {
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
  const [locationFurniture, setLocationFurniture] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  
  // Visibility
  const [visibility, setVisibility] = useState<ItemVisibility>('private');
  const [sharingMode, setSharingMode] = useState<SharingMode | null>(null);
  const [price, setPrice] = useState('');
  
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
  
  // Upload image to Supabase Storage
  const uploadImage = async (uri: string) => {
    if (!user) return;
    
    setIsUploading(true);
    
    try {
      const filename = `${user.id}/${Date.now()}.jpg`;
      
      // Fetch the image as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('item-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
        });
      
      if (error) throw error;
      
      // Get public URL
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
      location_room: locationRoom || null,
      location_furniture: locationFurniture || null,
      location_detail: locationDetail || null,
      visibility,
      sharing_mode: visibility === 'public' ? sharingMode : null,
      price_cents: price ? Math.round(parseFloat(price) * 100) : null,
    });
    
    setIsLoading(false);
    
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Fatto! 🎉', 'Oggetto aggiunto alla tua soffitta', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Mode toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
          onPress={() => setInputMode('manual')}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={inputMode === 'manual' ? '#fff' : '#888'}
          />
          <Text style={[styles.modeText, inputMode === 'manual' && styles.modeTextActive]}>
            Manuale
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'voice' && styles.modeButtonActive]}
          onPress={() => setInputMode('voice')}
        >
          <Ionicons
            name="mic-outline"
            size={20}
            color={inputMode === 'voice' ? '#fff' : '#888'}
          />
          <Text style={[styles.modeText, inputMode === 'voice' && styles.modeTextActive]}>
            Vocale
          </Text>
        </TouchableOpacity>
      </View>
      
      {inputMode === 'voice' ? (
        // VOICE MODE
        <View style={styles.voiceMode}>
          <Text style={styles.voiceTitle}>🎙️ Riordino vocale</Text>
          <Text style={styles.voiceSubtitle}>
            Tieni premuto il pulsante e descrivi l'oggetto.
            {'\n'}Es: "Ho trovato un cavetto USB-C bianco, un po' rovinato, l'ho messo sopra l'armadio in camera"
          </Text>
          
          <VoiceInput
            onTranscription={(text) => {
              // Popola automaticamente il nome con il testo trascritto
              setName(text);
              // Passa alla modalità manuale per revisione
              setInputMode('manual');
              Alert.alert(
                '✅ Trascrizione completata',
                `Testo riconosciuto:\n\n"${text}"\n\nRivedi e completa i dettagli.`,
                [{ text: 'OK' }]
              );
            }}
            onError={(error) => {
              Alert.alert('Errore', error);
            }}
            placeholder="Tieni premuto per parlare"
          />
          
          <View style={styles.voiceHintBox}>
            <Text style={styles.voiceHintTitle}>💡 Suggerimenti</Text>
            <Text style={styles.voiceHint}>
              • Parla chiaramente e senza fretta{'\n'}
              • Indica nome, posizione e condizioni{'\n'}
              • Dopo la trascrizione potrai modificare
            </Text>
          </View>
          
          <Text style={styles.neuronCare}>
            🧠 "Care your neurons" - Prima di chiedere all'AI, prova a ricordare!
          </Text>
        </View>
      ) : (
        // MANUAL MODE
        <>
          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Foto</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {photos.length < 4 && (
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={takePhoto}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator color="#e94560" />
                    ) : (
                      <Ionicons name="camera" size={24} color="#e94560" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={pickImage}
                    disabled={isUploading}
                  >
                    <Ionicons name="images" size={24} color="#e94560" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Es: Cavetto USB-C bianco"
              placeholderTextColor="#666"
            />
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Descrizione</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrivi l'oggetto (opzionale)"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      categoryId === cat.id && styles.chipActive,
                    ]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={styles.chipIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        categoryId === cat.id && styles.chipTextActive,
                      ]}
                    >
                      {cat.name_it}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Dove l'hai messo?</Text>
            
            <Text style={styles.fieldLabel}>Stanza</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {COMMON_ROOMS.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.chip,
                      locationRoom === room.name && styles.chipActive,
                    ]}
                    onPress={() => setLocationRoom(room.name)}
                  >
                    <Text style={styles.chipIcon}>{room.emoji}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        locationRoom === room.name && styles.chipTextActive,
                      ]}
                    >
                      {room.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <Text style={styles.fieldLabel}>Mobile/Contenitore</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipsRow}>
                {COMMON_FURNITURE.map((furniture) => (
                  <TouchableOpacity
                    key={furniture.id}
                    style={[
                      styles.chip,
                      locationFurniture === furniture.name && styles.chipActive,
                    ]}
                    onPress={() => setLocationFurniture(furniture.name)}
                  >
                    <Text style={styles.chipIcon}>{furniture.emoji}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        locationFurniture === furniture.name && styles.chipTextActive,
                      ]}
                    >
                      {furniture.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <Text style={styles.fieldLabel}>Dettaglio (opzionale)</Text>
            <TextInput
              style={styles.input}
              value={locationDetail}
              onChangeText={setLocationDetail}
              placeholder="Es: Scatola bianca sopra"
              placeholderTextColor="#666"
            />
          </View>
          
          {/* Labels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Etichette</Text>
            <View style={styles.labelsGrid}>
              {Object.values(ITEM_LABELS).map((label) => {
                const info = LABEL_INFO[label as ItemLabel];
                if (!info) return null;
                const isSelected = selectedLabels.includes(label);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.labelChip,
                      { backgroundColor: isSelected ? info.color + '30' : '#1a1a2e' },
                      isSelected && { borderColor: info.color, borderWidth: 1 },
                    ]}
                    onPress={() => toggleLabel(label)}
                  >
                    <Text style={styles.labelEmoji}>{info.emoji}</Text>
                    <Text
                      style={[
                        styles.labelName,
                        { color: isSelected ? info.color : '#888' },
                      ]}
                    >
                      {info.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          {/* Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👁️ Visibilità</Text>
            
            <View style={styles.visibilityOption}>
              <View>
                <Text style={styles.visibilityTitle}>Condividi con i vicini</Text>
                <Text style={styles.visibilitySubtitle}>
                  Rendi visibile questo oggetto a chi cerca nei dintorni
                </Text>
              </View>
              <Switch
                value={visibility === 'public'}
                onValueChange={(value) => setVisibility(value ? 'public' : 'private')}
                trackColor={{ false: '#2a2a4e', true: '#e9456050' }}
                thumbColor={visibility === 'public' ? '#e94560' : '#666'}
              />
            </View>
            
            {visibility === 'public' && (
              <View style={styles.sharingOptions}>
                <Text style={styles.fieldLabel}>Modalità</Text>
                <View style={styles.chipsRow}>
                  {[
                    { mode: 'prestito' as SharingMode, label: '🤝 Prestito', desc: 'Gratuito' },
                    { mode: 'baratto' as SharingMode, label: '🔄 Baratto', desc: 'Scambio' },
                    { mode: 'offerta' as SharingMode, label: '💰 Offerta', desc: 'Con contributo' },
                  ].map(({ mode, label, desc }) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.sharingChip,
                        sharingMode === mode && styles.sharingChipActive,
                      ]}
                      onPress={() => setSharingMode(mode)}
                    >
                      <Text style={styles.sharingLabel}>{label}</Text>
                      <Text style={styles.sharingDesc}>{desc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {sharingMode === 'offerta' && (
                  <View style={styles.priceInput}>
                    <Text style={styles.priceLabel}>€</Text>
                    <TextInput
                      style={styles.priceField}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      placeholderTextColor="#666"
                      keyboardType="decimal-pad"
                    />
                  </View>
                )}
              </View>
            )}
          </View>
          
          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Aggiungi alla Soffitta</Text>
              </>
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
    backgroundColor: '#0f0f1a',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: '#e94560',
  },
  modeText: {
    color: '#888',
    fontWeight: '500',
  },
  modeTextActive: {
    color: '#fff',
  },
  voiceMode: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9456020',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  voiceTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  voiceButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceHintBox: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
  },
  voiceHintTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  voiceHint: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
  },
  neuronCare: {
    marginTop: 20,
    color: '#4A90A4',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#00000080',
    borderRadius: 10,
    padding: 2,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
    borderStyle: 'dashed',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  chipActive: {
    backgroundColor: '#e9456020',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    color: '#888',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#e94560',
  },
  labelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  labelEmoji: {
    fontSize: 14,
  },
  labelName: {
    fontSize: 13,
    fontWeight: '500',
  },
  visibilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
  },
  visibilityTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  visibilitySubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  sharingOptions: {
    marginTop: 16,
  },
  sharingChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  sharingChipActive: {
    backgroundColor: '#e9456020',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  sharingLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sharingDesc: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  priceLabel: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: '600',
  },
  priceField: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontSize: 20,
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
