/**
 * Whisper Client per Soffitta - NoWasteLand
 * 
 * Gestisce la trascrizione vocale con supporto per:
 * - Server Whisper locale (MVP/development)
 * - API OpenAI (produzione)
 * 
 * "Care your neurons" - Usa la voce, ma ricorda di pensare!
 */

import { Platform } from 'react-native';

// Configurazione endpoint
const WHISPER_CONFIG = {
  // Server locale per development
  local: {
    // Su iOS simulator/device, localhost non funziona - usa l'IP del Mac
    url: Platform.select({
      ios: 'http://192.168.1.100:5555', // Cambia con il tuo IP locale
      android: 'http://10.0.2.2:5555',   // Android emulator -> host
      web: 'http://localhost:5555',
      default: 'http://localhost:5555',
    }),
  },
  // API OpenAI per produzione
  openai: {
    url: 'https://api.openai.com/v1/audio/transcriptions',
    apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  },
};

// Tipo di risposta dal server Whisper
export interface TranscriptionResult {
  text: string;
  language: string;
  duration: number;
  segments?: {
    start: number;
    end: number;
    text: string;
  }[];
}

export interface WhisperError {
  error: string;
}

// Determina quale backend usare
type WhisperBackend = 'local' | 'openai';

/**
 * Ottiene il backend corrente
 */
export function getWhisperBackend(): WhisperBackend {
  const env = process.env.EXPO_PUBLIC_WHISPER_BACKEND;
  if (env === 'openai' && WHISPER_CONFIG.openai.apiKey) {
    return 'openai';
  }
  return 'local';
}

/**
 * Imposta l'URL del server locale (per cambiare IP)
 */
export function setLocalWhisperUrl(url: string): void {
  WHISPER_CONFIG.local.url = url;
}

/**
 * Verifica se il server Whisper locale è disponibile
 */
export async function checkWhisperHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${WHISPER_CONFIG.local.url}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Trascrivi audio in testo usando Whisper
 * 
 * @param audioUri - URI del file audio (da expo-av)
 * @param language - Codice lingua (default: 'it')
 * @returns Testo trascritto
 */
export async function transcribeAudio(
  audioUri: string,
  language: string = 'it'
): Promise<TranscriptionResult> {
  const backend = getWhisperBackend();
  
  if (backend === 'openai') {
    return transcribeWithOpenAI(audioUri, language);
  }
  
  return transcribeWithLocal(audioUri, language);
}

/**
 * Trascrizione con server locale
 */
async function transcribeWithLocal(
  audioUri: string,
  language: string
): Promise<TranscriptionResult> {
  const formData = new FormData();
  
  // Prepara il file audio
  const audioFile = {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  } as any;
  
  formData.append('file', audioFile);
  formData.append('language', language);
  
  try {
    const response = await fetch(`${WHISPER_CONFIG.local.url}/transcribe`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json() as WhisperError;
      throw new Error(error.error || 'Errore trascrizione');
    }
    
    return await response.json() as TranscriptionResult;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Network')) {
      throw new Error(
        'Server Whisper non raggiungibile. Avvia il server con: cd whisper-server && ./start.sh'
      );
    }
    throw error;
  }
}

/**
 * Trascrizione con API OpenAI
 */
async function transcribeWithOpenAI(
  audioUri: string,
  language: string
): Promise<TranscriptionResult> {
  const apiKey = WHISPER_CONFIG.openai.apiKey;
  
  if (!apiKey) {
    throw new Error('API Key OpenAI non configurata');
  }
  
  const formData = new FormData();
  
  const audioFile = {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  } as any;
  
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');
  
  const startTime = Date.now();
  
  const response = await fetch(WHISPER_CONFIG.openai.url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Errore API OpenAI');
  }
  
  const data = await response.json();
  const duration = (Date.now() - startTime) / 1000;
  
  return {
    text: data.text,
    language: data.language || language,
    duration,
    segments: data.segments?.map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  };
}

/**
 * Hook-friendly: trascrivi con gestione errori
 */
export async function safeTranscribe(
  audioUri: string,
  language: string = 'it'
): Promise<{ text: string | null; error: string | null }> {
  try {
    const result = await transcribeAudio(audioUri, language);
    return { text: result.text, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    return { text: null, error: message };
  }
}
