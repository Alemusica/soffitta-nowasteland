// ================================================
// SOFFITTA - NoWasteLand
// Labels e costanti
// ================================================

// Labels semantici per gli oggetti
export const ITEM_LABELS = {
  // Stato disponibilità
  DISPONIBILE: 'disponibile',
  IN_PRESTITO: 'in_prestito',
  PRENOTATO: 'prenotato',
  
  // Stato uso/valore
  INUTILE: 'inutile',
  ACCANTONATO: 'accantonato',
  PREZIOSO: 'prezioso',
  DUPLICATO: 'duplicato',
  
  // Caratteristiche
  FRAGILE: 'fragile',
  PERICOLOSO: 'pericoloso',
  INGOMBRANTE: 'ingombrante',
  
  // Intenzioni
  DA_BARATTO: 'da_baratto',
  IN_OFFERTA: 'in_offerta',
} as const;

export type ItemLabel = typeof ITEM_LABELS[keyof typeof ITEM_LABELS];

// Labels con info per UI
export const LABEL_INFO: Record<ItemLabel, { emoji: string; name: string; description: string; color: string }> = {
  disponibile: {
    emoji: '✅',
    name: 'Disponibile',
    description: 'Pronto per il prestito',
    color: '#22c55e',
  },
  in_prestito: {
    emoji: '🤝',
    name: 'In prestito',
    description: 'Attualmente prestato a qualcuno',
    color: '#f59e0b',
  },
  prenotato: {
    emoji: '📅',
    name: 'Prenotato',
    description: 'Qualcuno lo ha prenotato',
    color: '#3b82f6',
  },
  inutile: {
    emoji: '🗑️',
    name: 'Inutile',
    description: 'Non lo uso mai, potrei cederlo',
    color: '#ef4444',
  },
  accantonato: {
    emoji: '📦',
    name: 'Accantonato',
    description: 'Non lo uso da tempo',
    color: '#8b5cf6',
  },
  prezioso: {
    emoji: '💎',
    name: 'Prezioso',
    description: 'Ha valore affettivo o economico',
    color: '#ec4899',
  },
  duplicato: {
    emoji: '👯',
    name: 'Duplicato',
    description: 'Ne ho più di uno',
    color: '#06b6d4',
  },
  fragile: {
    emoji: '🔮',
    name: 'Fragile',
    description: 'Maneggiare con cura',
    color: '#f97316',
  },
  pericoloso: {
    emoji: '⚠️',
    name: 'Pericoloso',
    description: 'Richiede attenzione',
    color: '#dc2626',
  },
  ingombrante: {
    emoji: '📐',
    name: 'Ingombrante',
    description: 'Difficile da trasportare',
    color: '#64748b',
  },
  da_baratto: {
    emoji: '🔄',
    name: 'Da baratto',
    description: 'Disponibile per scambio',
    color: '#10b981',
  },
  in_offerta: {
    emoji: '💰',
    name: 'In offerta',
    description: 'Disponibile con contributo',
    color: '#fbbf24',
  },
};

// Stanze comuni per ubicazione
export const COMMON_ROOMS = [
  { id: 'camera', name: 'Camera da letto', emoji: '🛏️' },
  { id: 'soggiorno', name: 'Soggiorno', emoji: '🛋️' },
  { id: 'cucina', name: 'Cucina', emoji: '🍳' },
  { id: 'bagno', name: 'Bagno', emoji: '🚿' },
  { id: 'cantina', name: 'Cantina', emoji: '🍷' },
  { id: 'garage', name: 'Garage', emoji: '🚗' },
  { id: 'soffitta', name: 'Soffitta', emoji: '🏚️' },
  { id: 'ripostiglio', name: 'Ripostiglio', emoji: '🧹' },
  { id: 'balcone', name: 'Balcone', emoji: '🌿' },
  { id: 'giardino', name: 'Giardino', emoji: '🌳' },
  { id: 'studio', name: 'Studio', emoji: '💼' },
  { id: 'altro', name: 'Altro', emoji: '📍' },
] as const;

// Mobili comuni per ubicazione
export const COMMON_FURNITURE = [
  { id: 'armadio', name: 'Armadio', emoji: '🚪' },
  { id: 'cassettiera', name: 'Cassettiera', emoji: '🗄️' },
  { id: 'scaffale', name: 'Scaffale', emoji: '📚' },
  { id: 'scrivania', name: 'Scrivania', emoji: '🖥️' },
  { id: 'comodino', name: 'Comodino', emoji: '🛏️' },
  { id: 'credenza', name: 'Credenza', emoji: '🍽️' },
  { id: 'scatola', name: 'Scatola', emoji: '📦' },
  { id: 'cassetto', name: 'Cassetto', emoji: '🗃️' },
  { id: 'mensola', name: 'Mensola', emoji: '📏' },
  { id: 'pavimento', name: 'A terra', emoji: '⬇️' },
  { id: 'parete', name: 'Appeso', emoji: '🖼️' },
  { id: 'altro', name: 'Altro', emoji: '📍' },
] as const;

// Target geografico iniziale
export const TARGET_REGIONS = {
  'lago-maggiore-varese': {
    name: 'Lago Maggiore / Varese',
    cities: ['Arona', 'Dormelletto', 'Castelletto Ticino', 'Sesto Calende', 'Varese', 'Besozzo'],
    center: { lat: 45.757, lng: 8.557 },
    defaultRadius: 15, // km
  },
} as const;

// Badge utente
export const USER_BADGES = {
  PHONE_VERIFIED: 'phone_verified',
  IDENTITY_VERIFIED: 'identity_verified',
  RESPONSIBLE: 'responsible', // 5+ transazioni ok
  TOP_COMMUNITY: 'top_community', // 20+ transazioni, 4.5+ rating
  EARLY_ADOPTER: 'early_adopter', // Primi 100 utenti
} as const;

export const BADGE_INFO: Record<string, { emoji: string; name: string; description: string }> = {
  phone_verified: {
    emoji: '📱',
    name: 'Telefono verificato',
    description: 'Ha verificato il numero di telefono',
  },
  identity_verified: {
    emoji: '🛡️',
    name: 'Identità verificata',
    description: 'Ha verificato la carta d\'identità',
  },
  responsible: {
    emoji: '⭐',
    name: 'Persona responsabile',
    description: '5+ scambi completati con successo',
  },
  top_community: {
    emoji: '🏆',
    name: 'Top Community',
    description: '20+ scambi, rating eccellente',
  },
  early_adopter: {
    emoji: '🌱',
    name: 'Early Adopter',
    description: 'Tra i primi 100 utenti',
  },
};

// Configurazione "Care your neurons"
export const NEURON_CARE = {
  DEFAULT_FREQUENCY: 3, // Ogni N query
  NUDGE_MESSAGES: [
    '🧠 Care your neurons! Prima di dirtelo, prova a ricordare: dove hai visto questo oggetto l\'ultima volta?',
    '🧠 Un momento! Esercita la memoria: in quale stanza potrebbe essere?',
    '🧠 Pensaci un attimo... La memoria è un muscolo. Dove l\'hai messo di solito?',
    '🧠 Fermati 5 secondi e prova a ricordare. Se non ti viene, chiedimelo pure!',
  ],
  SUCCESS_MESSAGES: [
    '🎉 Bravo! Hai ricordato da solo. I tuoi neuroni ringraziano!',
    '💪 Ottimo! La tua memoria funziona alla grande.',
    '🧠 Perfetto! Vedi che ce la fai senza AI?',
  ],
};
