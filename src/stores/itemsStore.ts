import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Item, ItemInsert, ItemUpdate, Category, NearbyItem } from '@/lib/database.types';

interface ItemsState {
  // State
  myItems: Item[];
  categories: Category[];
  nearbyItems: NearbyItem[];
  isLoading: boolean;
  searchQuery: string;
  
  // Filters
  selectedCategory: string | null;
  selectedLabels: string[];
  visibilityFilter: 'all' | 'private' | 'public';
  
  // Actions
  loadCategories: () => Promise<void>;
  loadMyItems: () => Promise<void>;
  searchMyItems: (query: string) => Promise<void>;
  searchNearbyItems: (lat: number, lng: number, radiusKm?: number, query?: string) => Promise<void>;
  
  addItem: (item: ItemInsert) => Promise<{ data: Item | null; error: Error | null }>;
  updateItem: (id: string, updates: ItemUpdate) => Promise<{ error: Error | null }>;
  deleteItem: (id: string) => Promise<{ error: Error | null }>;
  
  // Filters
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedLabels: (labels: string[]) => void;
  setVisibilityFilter: (filter: 'all' | 'private' | 'public') => void;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  myItems: [],
  categories: [],
  nearbyItems: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: null,
  selectedLabels: [],
  visibilityFilter: 'all',
  
  loadCategories: async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) {
      set({ categories: data });
    }
  },
  
  loadMyItems: async () => {
    set({ isLoading: true });
    
    const { selectedCategory, selectedLabels, visibilityFilter, searchQuery } = get();
    
    let query = supabase
      .from('items')
      .select('*')
      .order('updated_at', { ascending: false });
    
    // Applica filtri
    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }
    
    if (visibilityFilter !== 'all') {
      query = query.eq('visibility', visibilityFilter);
    }
    
    if (selectedLabels.length > 0) {
      query = query.contains('labels', selectedLabels);
    }
    
    if (searchQuery) {
      query = query.textSearch('search_vector', searchQuery, {
        type: 'plain',
        config: 'italian',
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error loading items:', error);
    }
    
    set({
      myItems: data || [],
      isLoading: false,
    });
  },
  
  searchMyItems: async (query: string) => {
    set({ searchQuery: query });
    await get().loadMyItems();
  },
  
  searchNearbyItems: async (lat, lng, radiusKm = 5, query) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.rpc('search_nearby_items', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
      search_query: query || null,
      category_filter: get().selectedCategory,
      limit_count: 50,
    });
    
    if (error) {
      console.error('Error searching nearby items:', error);
    }
    
    set({
      nearbyItems: data || [],
      isLoading: false,
    });
  },
  
  addItem: async (item) => {
    const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();
    
    if (data) {
      set((state) => ({
        myItems: [data, ...state.myItems],
      }));
    }
    
    return {
      data,
      error: error ? new Error(error.message) : null,
    };
  },
  
  updateItem: async (id, updates) => {
    const { error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      // Aggiorna localmente
      set((state) => ({
        myItems: state.myItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
    }
    
    return { error: error ? new Error(error.message) : null };
  },
  
  deleteItem: async (id) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        myItems: state.myItems.filter((item) => item.id !== id),
      }));
    }
    
    return { error: error ? new Error(error.message) : null };
  },
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  setVisibilityFilter: (filter) => set({ visibilityFilter: filter }),
}));
