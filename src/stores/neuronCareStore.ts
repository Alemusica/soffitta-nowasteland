import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { NEURON_CARE } from '@/constants/labels';

interface NeuronCareState {
  // Contatore query "dove ho messo?" nelle ultime 24h
  queriesCount: number;
  lastQueryTime: number | null;
  
  // Settings utente
  nudgeEnabled: boolean;
  nudgeFrequency: number; // Ogni N query
  
  // Actions
  recordQuery: (queryText: string, itemFoundId?: string) => Promise<{
    shouldNudge: boolean;
    nudgeMessage: string | null;
  }>;
  recordRememberedAlone: (queryId: string) => Promise<void>;
  resetDailyCount: () => void;
  setNudgeEnabled: (enabled: boolean) => void;
  setNudgeFrequency: (frequency: number) => void;
  
  // Helpers
  getRandomNudgeMessage: () => string;
  getRandomSuccessMessage: () => string;
}

export const useNeuronCareStore = create<NeuronCareState>()(
  persist(
    (set, get) => ({
      queriesCount: 0,
      lastQueryTime: null,
      nudgeEnabled: true,
      nudgeFrequency: NEURON_CARE.DEFAULT_FREQUENCY,
      
      recordQuery: async (queryText, itemFoundId) => {
        const { queriesCount, nudgeEnabled, nudgeFrequency, lastQueryTime } = get();
        
        // Reset contatore se sono passate 24h
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (lastQueryTime && now - lastQueryTime > twentyFourHours) {
          set({ queriesCount: 0 });
        }
        
        const newCount = queriesCount + 1;
        const shouldNudge = nudgeEnabled && newCount % nudgeFrequency === 0;
        
        set({
          queriesCount: newCount,
          lastQueryTime: now,
        });
        
        // Salva nel database per analytics
        try {
          await supabase.from('location_queries').insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            query_text: queryText,
            item_found_id: itemFoundId,
            was_nudged: shouldNudge,
          });
        } catch (error) {
          console.error('Error recording query:', error);
        }
        
        return {
          shouldNudge,
          nudgeMessage: shouldNudge ? get().getRandomNudgeMessage() : null,
        };
      },
      
      recordRememberedAlone: async (queryId) => {
        try {
          await supabase
            .from('location_queries')
            .update({ user_remembered_alone: true })
            .eq('id', queryId);
        } catch (error) {
          console.error('Error updating query:', error);
        }
      },
      
      resetDailyCount: () => {
        set({ queriesCount: 0, lastQueryTime: null });
      },
      
      setNudgeEnabled: (enabled) => set({ nudgeEnabled: enabled }),
      setNudgeFrequency: (frequency) => set({ nudgeFrequency: frequency }),
      
      getRandomNudgeMessage: () => {
        const messages = NEURON_CARE.NUDGE_MESSAGES;
        return messages[Math.floor(Math.random() * messages.length)];
      },
      
      getRandomSuccessMessage: () => {
        const messages = NEURON_CARE.SUCCESS_MESSAGES;
        return messages[Math.floor(Math.random() * messages.length)];
      },
    }),
    {
      name: 'neuron-care-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        queriesCount: state.queriesCount,
        lastQueryTime: state.lastQueryTime,
        nudgeEnabled: state.nudgeEnabled,
        nudgeFrequency: state.nudgeFrequency,
      }),
    }
  )
);
