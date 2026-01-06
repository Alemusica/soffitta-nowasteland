import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useItemsStore } from '@/stores/itemsStore';
import { Item, Profile } from '@/lib/database.types';
import { LABEL_INFO, ItemLabel, BADGE_INFO } from '@/constants/labels';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { deleteItem } = useItemsStore();
  
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  const isOwner = item?.owner_id === user?.id;
  
  useEffect(() => {
    loadItem();
  }, [id]);
  
  const loadItem = async () => {
    if (!id) return;
    
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (itemError) throw itemError;
      
      setItem(itemData);
      
      // Load owner profile
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', itemData.owner_id)
        .single();
      
      setOwner(ownerData);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Errore', 'Impossibile caricare l\'oggetto');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Elimina oggetto',
      'Sei sicuro di voler eliminare questo oggetto dalla tua soffitta?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteItem(id!);
            if (error) {
              Alert.alert('Errore', error.message);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };
  
  const handleContact = async () => {
    if (!item || !user) return;
    
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('item_id', item.id)
      .eq('requester_id', user.id)
      .single();
    
    if (existing) {
      router.push(`/chat/${existing.id}`);
      return;
    }
    
    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        item_id: item.id,
        requester_id: user.id,
        owner_id: item.owner_id,
      })
      .select()
      .single();
    
    if (error) {
      Alert.alert('Errore', 'Impossibile avviare la conversazione');
      return;
    }
    
    router.push(`/chat/${newConv.id}`);
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#e94560" size="large" />
      </View>
    );
  }
  
  if (!item) {
    return null;
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: item.name,
          headerRight: () =>
            isOwner ? (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            ) : null,
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Photos carousel */}
        {item.photos && item.photos.length > 0 ? (
          <View style={styles.photosContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentPhotoIndex(index);
              }}
            >
              {item.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {item.photos.length > 1 && (
              <View style={styles.photoIndicators}>
                {item.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      currentPhotoIndex === index && styles.photoIndicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPhotoContainer}>
            <Ionicons name="cube-outline" size={64} color="#444" />
          </View>
        )}
        
        {/* Item info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>
          
          {/* Labels */}
          {item.labels && item.labels.length > 0 && (
            <View style={styles.labelsRow}>
              {item.labels.map((label) => {
                const info = LABEL_INFO[label as ItemLabel];
                if (!info) return null;
                return (
                  <View
                    key={label}
                    style={[styles.labelChip, { backgroundColor: info.color + '20' }]}
                  >
                    <Text style={styles.labelEmoji}>{info.emoji}</Text>
                    <Text style={[styles.labelText, { color: info.color }]}>
                      {info.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Sharing mode */}
          {item.visibility === 'public' && item.sharing_mode && (
            <View style={styles.sharingInfo}>
              <Text style={styles.sharingMode}>
                {item.sharing_mode === 'prestito' && '🤝 Disponibile per prestito gratuito'}
                {item.sharing_mode === 'baratto' && '🔄 Disponibile per baratto'}
                {item.sharing_mode === 'offerta' && `💰 In offerta a €${(item.price_cents || 0) / 100}`}
                {item.sharing_mode === 'noleggio' && '📅 Disponibile per noleggio'}
              </Text>
            </View>
          )}
          
          {/* Description */}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>
        
        {/* Location */}
        {(item.location_room || item.location_furniture || item.location_detail) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Ubicazione</Text>
            <Text style={styles.locationText}>
              {[item.location_room, item.location_furniture, item.location_detail]
                .filter(Boolean)
                .join(' → ')}
            </Text>
          </View>
        )}
        
        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Dettagli</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Condizione</Text>
              <Text style={styles.detailValue}>{item.condition}</Text>
            </View>
            {item.estimated_length_cm && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lunghezza</Text>
                <Text style={styles.detailValue}>~{item.estimated_length_cm}cm</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Owner info (if not owner) */}
        {!isOwner && owner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Proprietario</Text>
            <View style={styles.ownerCard}>
              {owner.avatar_url ? (
                <Image source={{ uri: owner.avatar_url }} style={styles.ownerAvatar} />
              ) : (
                <View style={styles.ownerAvatarPlaceholder}>
                  <Text style={styles.ownerInitial}>
                    {owner.display_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{owner.display_name}</Text>
                <View style={styles.ownerBadges}>
                  {owner.badges?.slice(0, 2).map((badge) => {
                    const info = BADGE_INFO[badge];
                    if (!info) return null;
                    return (
                      <Text key={badge} style={styles.ownerBadge}>
                        {info.emoji} {info.name}
                      </Text>
                    );
                  })}
                </View>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#22c55e" />
                <Text style={styles.trustText}>{owner.trust_score || 0}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Action button */}
      {!isOwner && item.visibility === 'public' && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleContact}>
            <Ionicons name="chatbubble" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Contatta per {item.sharing_mode || 'info'}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isOwner && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => Alert.alert('TODO', 'Modifica oggetto - da implementare')}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Modifica</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  photosContainer: {
    height: width,
  },
  photo: {
    width: width,
    height: width,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff50',
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  noPhotoContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  infoSection: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  labelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  labelEmoji: {
    fontSize: 14,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sharingInfo: {
    backgroundColor: '#e9456020',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  sharingMode: {
    color: '#e94560',
    fontSize: 15,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 15,
    color: '#fff',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ownerBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  ownerBadge: {
    fontSize: 11,
    color: '#888',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#22c55e20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0f0f1a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e94560',
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
