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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useItemsStore } from '@/stores/itemsStore';
import { useAuthStore } from '@/stores/authStore';
import { LABEL_INFO, ItemLabel } from '@/constants/labels';
import { Item } from '@/lib/database.types';

// Componente per singolo item
function ItemCard({ item }: { item: Item }) {
  const firstPhoto = item.photos?.[0];
  
  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Foto o placeholder */}
      <View style={styles.itemImageContainer}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Ionicons name="cube-outline" size={32} color="#444" />
          </View>
        )}
        
        {/* Badge visibilità */}
        {item.visibility === 'public' && (
          <View style={styles.visibilityBadge}>
            <Ionicons name="globe-outline" size={12} color="#fff" />
          </View>
        )}
      </View>
      
      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        
        {/* Ubicazione */}
        {item.location_room && (
          <Text style={styles.itemLocation} numberOfLines={1}>
            📍 {item.location_room}
            {item.location_furniture && ` → ${item.location_furniture}`}
          </Text>
        )}
        
        {/* Labels */}
        {item.labels && item.labels.length > 0 && (
          <View style={styles.labelsRow}>
            {item.labels.slice(0, 3).map((label) => {
              const info = LABEL_INFO[label as ItemLabel];
              if (!info) return null;
              return (
                <View
                  key={label}
                  style={[styles.labelChip, { backgroundColor: info.color + '20' }]}
                >
                  <Text style={[styles.labelText, { color: info.color }]}>
                    {info.emoji} {info.name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function InventoryScreen() {
  const { myItems, isLoading, loadMyItems, searchQuery, setSearchQuery } = useItemsStore();
  const profile = useAuthStore((state) => state.profile);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadMyItems();
  }, []);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyItems();
    setRefreshing(false);
  }, []);
  
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    loadMyItems();
  }, []);
  
  return (
    <View style={styles.container}>
      {/* Header con ricerca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca nei tuoi oggetti..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Stats rapide */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{myItems.length}</Text>
          <Text style={styles.statLabel}>Oggetti</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myItems.filter((i) => i.visibility === 'public').length}
          </Text>
          <Text style={styles.statLabel}>Condivisi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {myItems.filter((i) => i.labels?.includes('inutile')).length}
          </Text>
          <Text style={styles.statLabel}>Da cedere</Text>
        </View>
      </View>
      
      {/* Lista oggetti */}
      <FlatList
        data={myItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemCard item={item} />}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>La tua soffitta è vuota</Text>
            <Text style={styles.emptyText}>
              Inizia ad aggiungere oggetti mentre riordini casa.
              {'\n'}Puoi usare l'assistente vocale!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/add')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Aggiungi il primo oggetto</Text>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 12,
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2a2a4e',
  },
  listContent: {
    padding: 8,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemImageContainer: {
    aspectRatio: 1,
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
  visibilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 4,
  },
  itemInfo: {
    padding: 12,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  itemLocation: {
    fontSize: 11,
    color: '#888',
  },
  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  labelChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e94560',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
