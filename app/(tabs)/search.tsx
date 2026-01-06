import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useItemsStore } from '@/stores/itemsStore';
import { LABEL_INFO, ItemLabel, TARGET_REGIONS } from '@/constants/labels';
import { NearbyItem } from '@/lib/database.types';

// Formatta distanza
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Card per item nearby
function NearbyItemCard({ item }: { item: NearbyItem }) {
  const firstPhoto = item.photos?.[0];
  
  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Foto */}
      <View style={styles.itemImageContainer}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Ionicons name="cube-outline" size={40} color="#444" />
          </View>
        )}
        
        {/* Distanza */}
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color="#fff" />
          <Text style={styles.distanceText}>
            {formatDistance(item.distance_meters)}
          </Text>
        </View>
      </View>
      
      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        {/* Owner info */}
        <View style={styles.ownerRow}>
          {item.owner_avatar_url ? (
            <Image
              source={{ uri: item.owner_avatar_url }}
              style={styles.ownerAvatar}
            />
          ) : (
            <View style={styles.ownerAvatarPlaceholder}>
              <Text style={styles.ownerInitial}>
                {item.owner_display_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.ownerName} numberOfLines={1}>
            {item.owner_display_name}
          </Text>
          {item.owner_trust_score > 50 && (
            <Ionicons name="shield-checkmark" size={14} color="#22c55e" />
          )}
        </View>
        
        {/* Labels e prezzo */}
        <View style={styles.bottomRow}>
          {item.labels?.slice(0, 2).map((label) => {
            const info = LABEL_INFO[label as ItemLabel];
            if (!info) return null;
            return (
              <View
                key={label}
                style={[styles.labelChip, { backgroundColor: info.color + '20' }]}
              >
                <Text style={[styles.labelText, { color: info.color }]}>
                  {info.emoji}
                </Text>
              </View>
            );
          })}
          
          {item.sharing_mode && (
            <View style={styles.sharingBadge}>
              <Text style={styles.sharingText}>
                {item.sharing_mode === 'prestito' && '🤝 Prestito'}
                {item.sharing_mode === 'baratto' && '🔄 Baratto'}
                {item.sharing_mode === 'offerta' && `💰 €${(item.price_cents || 0) / 100}`}
                {item.sharing_mode === 'noleggio' && '📅 Noleggio'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { nearbyItems, isLoading, searchNearbyItems, categories, selectedCategory, setSelectedCategory } = useItemsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5); // km
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Richiedi permessi e ottieni posizione
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permesso di geolocalizzazione negato');
        // Usa posizione default (Arona)
        const defaultRegion = TARGET_REGIONS['lago-maggiore-varese'];
        setLocation(defaultRegion.center);
        return;
      }
      
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch (error) {
        setLocationError('Impossibile ottenere la posizione');
        // Usa posizione default
        const defaultRegion = TARGET_REGIONS['lago-maggiore-varese'];
        setLocation(defaultRegion.center);
      }
    })();
  }, []);
  
  // Cerca quando cambia posizione o filtri
  useEffect(() => {
    if (location) {
      searchNearbyItems(location.lat, location.lng, radius, searchQuery || undefined);
    }
  }, [location, radius, selectedCategory]);
  
  const handleSearch = useCallback(() => {
    if (location) {
      searchNearbyItems(location.lat, location.lng, radius, searchQuery || undefined);
    }
  }, [location, radius, searchQuery]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (location) {
      await searchNearbyItems(location.lat, location.lng, radius, searchQuery || undefined);
    }
    setRefreshing(false);
  }, [location, radius, searchQuery]);
  
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cosa cerchi? (es. trapano, corda...)"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Radius selector */}
        <View style={styles.radiusSelector}>
          {[1, 5, 10, 20].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.radiusButton, radius === r && styles.radiusButtonActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.radiusText, radius === r && styles.radiusTextActive]}>
                {r}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Location status */}
      {locationError && (
        <View style={styles.locationWarning}>
          <Ionicons name="warning" size={16} color="#f59e0b" />
          <Text style={styles.locationWarningText}>{locationError}</Text>
        </View>
      )}
      
      {/* Categories filter */}
      <FlatList
        horizontal
        data={[{ id: null, name_it: 'Tutti', icon: '📦' }, ...categories]}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive,
              ]}
            >
              {item.name_it}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoriesList}
        showsHorizontalScrollIndicator={false}
      />
      
      {/* Results */}
      <FlatList
        data={nearbyItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NearbyItemCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Cerco nei dintorni...' : 'Nessun oggetto trovato'}
            </Text>
            <Text style={styles.emptyText}>
              {isLoading
                ? 'Un momento...'
                : 'Prova ad aumentare il raggio di ricerca o cambiare i filtri.'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          nearbyItems.length > 0 ? (
            <Text style={styles.resultsCount}>
              {nearbyItems.length} oggetti trovati entro {radius}km
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  radiusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  radiusButtonActive: {
    backgroundColor: '#e94560',
  },
  radiusText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  radiusTextActive: {
    color: '#fff',
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f59e0b20',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  locationWarningText: {
    color: '#f59e0b',
    fontSize: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#e9456020',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#e94560',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsCount: {
    color: '#888',
    fontSize: 13,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemImageContainer: {
    height: 160,
    backgroundColor: '#0f0f1a',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000000aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  itemInfo: {
    padding: 12,
    gap: 6,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  itemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ownerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitial: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ownerName: {
    flex: 1,
    color: '#aaa',
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  labelChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 12,
  },
  sharingBadge: {
    marginLeft: 'auto',
  },
  sharingText: {
    fontSize: 12,
    color: '#e94560',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
