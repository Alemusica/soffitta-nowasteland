/**
 * Home Screen - Soffitta NoWasteLand
 * 
 * Swiss Typography Design
 * Minimal, clean, calming studio aesthetic
 */

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
import { useColors, useThemeStore } from '@/stores/themeStore';
import { LABEL_INFO, ItemLabel } from '@/constants/labels';
import { THEME_INFO, ThemeMode } from '@/theme/colors';
import { Item } from '@/lib/database.types';

// Item Card - Swiss minimal design
function ItemCard({ item }: { item: Item }) {
  const colors = useColors();
  const firstPhoto = item.photos?.[0];
  
  return (
    <TouchableOpacity
      style={[styles.itemCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={[styles.itemImageContainer, { backgroundColor: colors.surfaceElevated }]}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemPlaceholder}>
            <Ionicons name="cube-outline" size={28} color={colors.textMuted} />
          </View>
        )}
        
        {/* Public badge */}
        {item.visibility === 'public' && (
          <View style={[styles.publicBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="globe-outline" size={10} color="#fff" />
          </View>
        )}
      </View>
      
      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        {item.location_room && (
          <Text style={[styles.itemLocation, { color: colors.textMuted }]} numberOfLines={1}>
            {item.location_room}
            {item.location_furniture && ` · ${item.location_furniture}`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Theme Selector Component
function ThemeSelector() {
  const colors = useColors();
  const { themeMode, setTheme } = useThemeStore();
  
  return (
    <View style={[styles.themeSelector, { backgroundColor: colors.surface }]}>
      <Text style={[styles.themeSelectorLabel, { color: colors.textMuted }]}>TEMA</Text>
      <View style={styles.themeOptions}>
        {(['warm', 'dark', 'forest', 'ocean'] as ThemeMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.themeOption,
              { backgroundColor: colors.surfaceElevated },
              themeMode === mode && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setTheme(mode)}
          >
            <Text style={styles.themeEmoji}>{THEME_INFO[mode].emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const colors = useColors();
  const { myItems, isLoading, loadMyItems, searchQuery, setSearchQuery } = useItemsStore();
  const profile = useAuthStore((state) => state.profile);
  const [refreshing, setRefreshing] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  
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
  
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    searchBox: { backgroundColor: colors.surface, borderColor: colors.border },
    searchInput: { color: colors.text },
    statsBar: { backgroundColor: colors.surface },
    statNumber: { color: colors.text },
    statLabel: { color: colors.textMuted },
    emptyTitle: { color: colors.text },
    emptyText: { color: colors.textSecondary },
    primaryButton: { backgroundColor: colors.primary },
  };
  
  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>
            La tua
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Soffitta
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowThemes(!showThemes)}
        >
          <Ionicons name="color-palette-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Theme Selector */}
      {showThemes && <ThemeSelector />}
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, dynamicStyles.searchBox]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder="Cerca oggetti..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Stats */}
      <View style={[styles.statsBar, dynamicStyles.statsBar]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{myItems.length}</Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>OGGETTI</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
            {myItems.filter((i) => i.visibility === 'public').length}
          </Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>CONDIVISI</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, dynamicStyles.statNumber]}>
            {myItems.filter((i) => i.labels?.includes('inutile')).length}
          </Text>
          <Text style={[styles.statLabel, dynamicStyles.statLabel]}>DA CEDERE</Text>
        </View>
      </View>
      
      {/* List */}
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
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={styles.emptyEmoji}>📦</Text>
            </View>
            <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>
              La tua soffitta è vuota
            </Text>
            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
              Inizia ad aggiungere oggetti mentre riordini.
              {'\n'}Puoi usare l'assistente vocale!
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, dynamicStyles.primaryButton]}
              onPress={() => router.push('/(tabs)/add')}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Aggiungi oggetto</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeSelector: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  themeSelectorLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeEmoji: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '400',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  itemCard: {
    width: '47%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImageContainer: {
    aspectRatio: 1,
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
  publicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    padding: 5,
  },
  itemInfo: {
    padding: 12,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
  itemLocation: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
