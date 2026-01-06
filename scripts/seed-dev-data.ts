/**
 * Seed Development Data
 * 
 * Popola il database con oggetti fake per testing
 * Esegui: npx ts-node scripts/seed-dev-data.ts
 */

// Oggetti fake per testing
export const FAKE_ITEMS = [
  {
    name: 'Trapano Black & Decker',
    description: 'Trapano a percussione, funziona perfettamente. Usato poco.',
    category: 'attrezzi',
    condition: 'ottimo',
    location_room: 'Garage',
    location_furniture: 'Scaffale',
    location_detail: 'Ripiano alto a sinistra',
    labels: ['disponibile', 'utile'],
  },
  {
    name: 'Set cacciaviti 20 pezzi',
    description: 'Set completo, mancano solo 2 punte piccole',
    category: 'attrezzi', 
    condition: 'buono',
    location_room: 'Garage',
    location_furniture: 'Cassettiera',
    labels: ['disponibile'],
  },
  {
    name: 'Cavo HDMI 2m',
    description: 'HDMI 2.0, supporta 4K',
    category: 'cavi',
    condition: 'ottimo',
    location_room: 'Studio',
    location_furniture: 'Cassetto scrivania',
    labels: ['disponibile', 'inutile'],
  },
  {
    name: 'Tastiera meccanica Logitech',
    description: 'Switch blu, retroilluminata RGB. Qualche tasto un po\' duro.',
    category: 'elettronica',
    condition: 'usato',
    location_room: 'Studio',
    location_furniture: 'Scaffale',
    labels: ['accantonato'],
  },
  {
    name: 'Libro "Sapiens" - Harari',
    description: 'Edizione italiana, qualche sottolineatura a matita',
    category: 'libri',
    condition: 'buono',
    location_room: 'Soggiorno',
    location_furniture: 'Libreria',
    labels: ['disponibile', 'inutile'],
  },
  {
    name: 'Racchetta tennis Wilson',
    description: 'Usata una stagione, corde da cambiare',
    category: 'sport',
    condition: 'usato',
    location_room: 'Ripostiglio',
    location_furniture: 'Appendiabiti',
    labels: ['accantonato', 'da_riparare'],
  },
  {
    name: 'Vaso terracotta 30cm',
    description: 'Vaso per piante, piccola crepa sul bordo',
    category: 'casa',
    condition: 'usato',
    location_room: 'Balcone',
    location_furniture: 'Altro',
    location_detail: 'Angolo destro',
    labels: ['disponibile'],
  },
  {
    name: 'Giacca invernale blu M',
    description: 'Piumino leggero, taglia M, blu scuro',
    category: 'abbigliamento',
    condition: 'buono',
    location_room: 'Camera',
    location_furniture: 'Armadio',
    labels: ['inutile'],
  },
  {
    name: 'Adattatore USB-C a HDMI',
    description: 'Funzionante, marca generica',
    category: 'cavi',
    condition: 'ottimo',
    location_room: 'Studio',
    location_furniture: 'Cassetto scrivania',
    labels: ['disponibile', 'utile'],
  },
  {
    name: 'Pentola pressione 5L',
    description: 'Lagostina, guarnizione da sostituire',
    category: 'cucina',
    condition: 'usato',
    location_room: 'Cucina',
    location_furniture: 'Pensile',
    labels: ['da_riparare'],
  },
  {
    name: 'Giochi da tavolo - Monopoly',
    description: 'Edizione classica, completo di tutti i pezzi',
    category: 'bambini',
    condition: 'buono',
    location_room: 'Soggiorno',
    location_furniture: 'Cassettone',
    labels: ['disponibile'],
  },
  {
    name: 'Cuffie Bluetooth Sony',
    description: 'WH-1000XM3, batteria tiene ancora bene',
    category: 'elettronica',
    condition: 'buono',
    location_room: 'Camera',
    location_furniture: 'Comodino',
    labels: ['utile'],
  },
];

// Posizioni geografiche fake (zona Lago Maggiore)
export const FAKE_LOCATIONS = [
  { lat: 45.7578, lng: 8.5567, name: 'Arona' },
  { lat: 45.7833, lng: 8.5667, name: 'Dormelletto' },
  { lat: 45.7500, lng: 8.6333, name: 'Castelletto Ticino' },
  { lat: 45.7333, lng: 8.6167, name: 'Sesto Calende' },
  { lat: 45.8206, lng: 8.8257, name: 'Varese' },
  { lat: 45.8500, lng: 8.6833, name: 'Besozzo' },
];

console.log('🌱 Seed data ready for import');
console.log(`📦 ${FAKE_ITEMS.length} items`);
console.log(`📍 ${FAKE_LOCATIONS.length} locations`);
