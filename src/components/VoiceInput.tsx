/**
 * VoiceInput - Componente per input vocale
 * 
 * Usa Whisper per trascrivere la voce in testo.
 * Supporta sia server locale che API OpenAI.
 * 
 * "Care your neurons" - Prima di parlare, prova a ricordare!
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { transcribeAudio, checkWhisperHealth } from '../lib/whisper';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: object;
}

type RecordingState = 'idle' | 'recording' | 'processing';

export function VoiceInput({
  onTranscription,
  onError,
  placeholder = 'Tieni premuto per parlare',
  disabled = false,
  style,
}: VoiceInputProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  
  const recording = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Verifica stato server all'avvio
  useEffect(() => {
    checkWhisperHealth().then(setServerOnline);
  }, []);
  
  // Animazione pulsante durante registrazione
  useEffect(() => {
    if (state === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    if (disabled || state !== 'idle') return;
    
    try {
      // Richiedi permessi
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        onError?.('Permesso microfono negato');
        return;
      }
      
      // Configura modalità audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Crea e avvia registrazione
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recording.current = newRecording;
      setState('recording');
      setDuration(0);
      
      // Timer durata
      durationInterval.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Errore avvio registrazione:', error);
      onError?.('Impossibile avviare la registrazione');
    }
  };
  
  const stopRecording = async () => {
    if (!recording.current || state !== 'recording') return;
    
    // Ferma timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    setState('processing');
    
    try {
      // Ferma registrazione
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      
      if (!uri) {
        throw new Error('Nessun file audio creato');
      }
      
      // Trascrivi con Whisper
      const result = await transcribeAudio(uri, 'it');
      
      if (result.text && result.text.trim()) {
        onTranscription(result.text.trim());
      } else {
        onError?.('Nessun testo riconosciuto. Riprova parlando più chiaramente.');
      }
      
    } catch (error) {
      console.error('Errore trascrizione:', error);
      const message = error instanceof Error ? error.message : 'Errore sconosciuto';
      onError?.(message);
    } finally {
      setState('idle');
      setDuration(0);
    }
  };
  
  const cancelRecording = async () => {
    if (!recording.current) return;
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    try {
      await recording.current.stopAndUnloadAsync();
      recording.current = null;
    } catch (error) {
      console.error('Errore annullamento:', error);
    }
    
    setState('idle');
    setDuration(0);
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStateIcon = () => {
    switch (state) {
      case 'recording':
        return '🔴';
      case 'processing':
        return '⏳';
      default:
        return '🎙️';
    }
  };
  
  const getStateText = () => {
    switch (state) {
      case 'recording':
        return `Registrazione... ${formatDuration(duration)}`;
      case 'processing':
        return 'Trascrizione in corso...';
      default:
        return placeholder;
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Indicatore stato server */}
      {serverOnline === false && (
        <View style={styles.serverWarning}>
          <Text style={styles.serverWarningText}>
            ⚠️ Server Whisper offline
          </Text>
        </View>
      )}
      
      {/* Pulsante principale */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPressIn={startRecording}
        onPressOut={stopRecording}
        onLongPress={() => {}} // Previene il menu contestuale
        delayLongPress={100}
        disabled={disabled || state === 'processing'}
        style={styles.buttonWrapper}
      >
        <Animated.View
          style={[
            styles.button,
            state === 'recording' && styles.buttonRecording,
            state === 'processing' && styles.buttonProcessing,
            disabled && styles.buttonDisabled,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {state === 'processing' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Text style={styles.buttonIcon}>{getStateIcon()}</Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {/* Testo stato */}
      <Text style={[
        styles.stateText,
        state === 'recording' && styles.stateTextRecording,
      ]}>
        {getStateText()}
      </Text>
      
      {/* Pulsante annulla durante registrazione */}
      {state === 'recording' && (
        <TouchableOpacity
          onPress={cancelRecording}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>✕ Annulla</Text>
        </TouchableOpacity>
      )}
      
      {/* Hint */}
      {state === 'idle' && (
        <Text style={styles.hint}>
          💡 Descrivi l'oggetto: nome, dove si trova, condizioni
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  serverWarning: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  serverWarningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90A4', // Colore brand Soffitta
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonRecording: {
    backgroundColor: '#E74C3C',
  },
  buttonProcessing: {
    backgroundColor: '#95A5A6',
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 32,
  },
  stateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  stateTextRecording: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#E74C3C',
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default VoiceInput;
