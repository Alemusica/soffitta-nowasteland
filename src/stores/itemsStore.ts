import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Item, ItemInsert, ItemUpdate, Category, NearbyItem } from '@/lib/database.types';

// 🔧 DEV MODE
const DEV_MODE = process.env.EXPO_PUBLIC_APP_ENV === 'development';
const USE_FAKE_DATA = true;

// Categorie fake per DEV
const FAKE_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'elettronica', name_it: 'Elettronica', name_en: 'Electronics', icon: '📱', sort_order: 1, is_active: true },
  { id: 'cat-2', slug: 'attrezzi', name_it: 'Attrezzi', name_en: 'Tools', icon: '🔧', sort_order: 2, is_active: true },
  { id: 'cat-3', slug: 'casa', name_it: 'Casa e Giardino', name_en: 'Home & Garden', icon: '🏠', sort_order: 3, is_active: true },
  { id: 'cat-4', slug: 'sport', name_it: 'Sport', name_en: 'Sports', icon: '⚽', sort_order: 4, is_active: true },
  { id: 'cat-5', slug: 'libri', name_it: 'Libri e Media', name_en: 'Books & Media', icon: '📚', sort_order: 5, is_active: true },
  { id: 'cat-6', slug: 'abbigliamento', name_it: 'Abbigliamento', name_en: 'Clothing', icon: '👕', sort_order: 6, is_active: true },
  { id: 'cat-7', slug: 'cucina', name_it: 'Cucina', name_en: 'Kitchen', icon: '🍳', sort_order: 7, is_active: true },
  { id: 'cat-8', slug: 'bambini', name_it: 'Bambini', name_en: 'Kids', icon: '🧸', sort_order: 8, is_active: true },
  { id: 'cat-9', slug: 'cavi', name_it: 'Cavi e Adattatori', name_en: 'Cables & Adapters', icon: '🔌', sort_order: 9, is_active: true },
  { id: 'cat-10', slug: 'altro', name_it: 'Altro', name_en: 'Other', icon: '📦', sort_order: 99, is_active: true },
];

// Oggetti fake per DEV
const FAKE_ITEMS: Item[] = [
  {
    id: 'item-1',
    owner_id: 'dev-user-001',
    name: 'Trapano Black & Decker',
    description: 'Trapano a percussione, funziona perfettamente. Usato poco.',
    category_id: 'cat-2',
    condition: 'ottimo',
    location_room: 'Garage',
    location_furniture: 'Scaffale',
    location_detail: 'Ripiano alto a sinistra',
    labels: ['disponibile', 'utile'],
    photos: [],
    visibility: 'public',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    owner_id: 'dev-user-001',
    name: 'Cavo HDMI 2m',
    description: 'HDMI 2.0, supporta 4K',
    category_id: 'cat-9',
    condition: 'ottimo',
    location_room: 'Studio',
    location_furniture: 'Cassetto',
    location_detail: null,
    labels: ['disponibile', 'inutile'],
    photos: [],
    visibility: 'public',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    owner_id: 'dev-user-001',
    name: 'Tastiera meccanica Logitech',
    description: 'Switch blu, retroilluminata RGB',
    category_id: 'cat-1',
    condition: 'buono',
    location_room: 'Studio',
    location_furniture: 'Scaffale',
    location_detail: null,
    labels: ['accantonato'],
    photos: [],
    visibility: 'private',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    owner_id: 'dev-user-001',
    name: 'Libro "Sapiens" - Harari',
    description: 'Edizione italiana, qualche sottolineatura',
    category_id: 'cat-5',
    condition: 'buono',
    location_room: 'Soggiorno',
    location_furniture: 'Libreria',
    location_detail: 'Secondo scaffale',
    labels: ['disponibile', 'inutile'],
    photos: [],
    visibility: 'public',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    owner_id: 'dev-user-001',
    name: 'Racchetta tennis Wilson',
    description: 'Corde da cambiare',
    category_id: 'cat-4',
    condition: 'usato',
    location_room: 'Ripostiglio',
    location_furniture: 'Appendiabiti',
    location_detail: null,
    labels: ['accantonato', 'da_riparare'],
    photos: [],
    visibility: 'private',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    owner_id: 'dev-user-001',
    name: 'Cuffie Sony WH-1000XM3',
    description: 'Noise cancelling, batteria OK',
    category_id: 'cat-1',
    condition: 'buono',
    location_room: 'Camera',
    location_furniture: 'Comodino',
    location_detail: null,
    labels: ['utile'],
    photos: [],
    visibility: 'private',
    sharing_mode: null,
    price_cents: null,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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
  myItems: DEV_MODE && USE_FAKE_DATA ? FAKE_ITEMS : [],
  categories: DEV_MODE && USE_FAKE_DATA ? FAKE_CATEGORIES : [],
  nearbyItems: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: null,
  selectedLabels: [],
  visibilityFilter: 'all',
  
  loadCategories: async () => {
    // DEV MODE: usa categorie fake
    if (DEV_MODE && USE_FAKE_DATA) {
      set({ categories: FAKE_CATEGORIES });
      return;
    }
    
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
    // DEV MODE: usa items fake con filtri locali
    if (DEV_MODE && USE_FAKE_DATA) {
      const { selectedCategory, selectedLabels, visibilityFilter, searchQuery } = get();
      
      let filtered = [...FAKE_ITEMS];
      
      if (selectedCategory) {
        filtered = filtered.filter(item => item.category_id === selectedCategory);
      }
      
      if (visibilityFilter !== 'all') {
        filtered = filtered.filter(item => item.visibility === visibilityFilter);
      }
      
      if (selectedLabels.length > 0) {
        filtered = filtered.filter(item => 
          selectedLabels.some(label => item.labels?.includes(label))
        );
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      }
      
      set({ myItems: filtered, isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    
    const { selectedCategory, selectedLabels, visibilityFilter, searchQuery } = get();
    
    let query = supabase
      .from('items')
      .select('*')
      .order('updated_at', { ascending: false });
    
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
    // DEV MODE: ritorna items fake come "vicini"
    if (DEV_MODE && USE_FAKE_DATA) {
      const nearbyFake: NearbyItem[] = FAKE_ITEMS
        .filter(item => item.visibility === 'public')
        .map(item => ({
          ...item,
          distance_km: Math.random() * radiusKm,
          owner_display_name: 'Vicino di casa',
          owner_avatar_url: null,
        }));
      
      set({ nearbyItems: nearbyFake, isLoading: false });
      return;
    }
    
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
    // DEV MODE: aggiungi localmente
    if (DEV_MODE && USE_FAKE_DATA) {
      const newItem: Item = {
        ...item,
        id: `item-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_available: true,
        photos: item.photos || [],
        labels: item.labels || [],
      } as Item;
      
      // Aggiungi anche a FAKE_ITEMS per persistenza locale
      FAKE_ITEMS.unshift(newItem);
      
      set((state) => ({
        myItems: [newItem, ...state.myItems],
      }));
      
      console.log('📦 DEV: Item aggiunto localmente:', newItem.name);
      
      return { data: newItem, error: null };
    }
    
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
    // DEV MODE: aggiorna localmente
    if (DEV_MODE && USE_FAKE_DATA) {
      const idx = FAKE_ITEMS.findIndex(i => i.id === id);
      if (idx !== -1) {
        FAKE_ITEMS[idx] = { ...FAKE_ITEMS[idx], ...updates };
      }
      
      set((state) => ({
        myItems: state.myItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
      
      return { error: null };
    }
    
    const { error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      set((state) => ({
        myItems: state.myItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      }));
    }
    
    return { error: error ? new Error(error.message) : null };
  },
  
  deleteItem: async (id) => {
    // DEV MODE: elimina localmente
    if (DEV_MODE && USE_FAKE_DATA) {
      const idx = FAKE_ITEMS.findIndex(i => i.id === id);
      if (idx !== -1) {
        FAKE_ITEMS.splice(idx, 1);
      }
      
      set((state) => ({
        myItems: state.myItems.filter((item) => item.id !== id),
      }));
      
      return { error: null };
    }
    
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
