import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useNeuronCareStore } from '@/stores/neuronCareStore';
import { BADGE_INFO, NEURON_CARE } from '@/constants/labels';

export default function ProfileScreen() {
  const { profile, user, signOut, updateProfile } = useAuthStore();
  const { nudgeEnabled, nudgeFrequency, setNudgeEnabled, setNudgeFrequency } = useNeuronCareStore();
  
  const handleSignOut = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esci',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };
  
  const handleVerifyIdentity = () => {
    Alert.alert(
      'Verifica identità',
      'La verifica della carta d\'identità ti permette di ottenere il badge "Identità verificata" e aumenta la fiducia degli altri utenti.\n\nQuesta funzionalità sarà disponibile presto con Stripe Identity.',
      [{ text: 'OK' }]
    );
  };
  
  const openPhilosophy = () => {
    // TODO: Open philosophy page or modal
    Alert.alert(
      '🧠 La nostra filosofia',
      'Human assistance, not human substitution.\n\nCrediamo che la tecnologia debba potenziare l\'umano, non sostituirlo. Per questo ogni 3 ricerche "dove ho messo X?", l\'app ti invita a ricordare da solo.\n\nLa memoria è un muscolo. Care your neurons!',
      [{ text: 'Capito!' }]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.header}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {profile?.display_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        
        <Text style={styles.displayName}>{profile?.display_name || 'Utente'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        {/* Badges */}
        {profile?.badges && profile.badges.length > 0 && (
          <View style={styles.badgesRow}>
            {profile.badges.map((badge) => {
              const info = BADGE_INFO[badge];
              if (!info) return null;
              return (
                <View key={badge} style={styles.badge}>
                  <Text style={styles.badgeEmoji}>{info.emoji}</Text>
                  <Text style={styles.badgeName}>{info.name}</Text>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Trust score */}
        <View style={styles.trustScore}>
          <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
          <Text style={styles.trustText}>
            Fiducia: {profile?.trust_score || 0}/100
          </Text>
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.total_transactions || 0}</Text>
          <Text style={styles.statLabel}>Scambi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile?.successful_transactions || 0}</Text>
          <Text style={styles.statLabel}>Completati</Text>
        </View>
      </View>
      
      {/* Verify identity */}
      {!profile?.identity_verified && (
        <TouchableOpacity style={styles.verifyCard} onPress={handleVerifyIdentity}>
          <View style={styles.verifyContent}>
            <Ionicons name="shield-outline" size={24} color="#e94560" />
            <View style={styles.verifyText}>
              <Text style={styles.verifyTitle}>Verifica la tua identità</Text>
              <Text style={styles.verifySubtitle}>
                Ottieni il badge e aumenta la fiducia
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      )}
      
      {/* Neuron Care settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Care your neurons</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Nudge "pensaci da solo"</Text>
            <Text style={styles.settingSubtitle}>
              Ogni {nudgeFrequency} ricerche, l'app ti invita a ricordare da solo
            </Text>
          </View>
          <Switch
            value={nudgeEnabled}
            onValueChange={setNudgeEnabled}
            trackColor={{ false: '#2a2a4e', true: '#e9456050' }}
            thumbColor={nudgeEnabled ? '#e94560' : '#666'}
          />
        </View>
        
        {nudgeEnabled && (
          <View style={styles.frequencySelector}>
            <Text style={styles.frequencyLabel}>Frequenza nudge:</Text>
            <View style={styles.frequencyButtons}>
              {[2, 3, 5, 10].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    nudgeFrequency === freq && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setNudgeFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      nudgeFrequency === freq && styles.frequencyTextActive,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.philosophyLink} onPress={openPhilosophy}>
          <Ionicons name="book-outline" size={18} color="#888" />
          <Text style={styles.philosophyText}>Scopri la nostra filosofia</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      
      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Preferenze</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Input vocale preferito</Text>
            <Text style={styles.settingSubtitle}>
              Apri direttamente la modalità vocale
            </Text>
          </View>
          <Switch
            value={profile?.prefers_voice_input ?? true}
            onValueChange={(value) => updateProfile({ prefers_voice_input: value })}
            trackColor={{ false: '#2a2a4e', true: '#e9456050' }}
            thumbColor={profile?.prefers_voice_input ? '#e94560' : '#666'}
          />
        </View>
      </View>
      
      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Account</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Modifica profilo</Text>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Notifiche</Text>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Posizione</Text>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Aiuto e supporto</Text>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={20} color="#888" />
          <Text style={styles.menuText}>Privacy e termini</Text>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
      </View>
      
      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Esci</Text>
      </TouchableOpacity>
      
      {/* Version */}
      <Text style={styles.version}>Soffitta v0.1.0 (Alpha)</Text>
      <Text style={styles.tagline}>NoWasteLand - Care your neurons! 🧠</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  badgeName: {
    fontSize: 11,
    color: '#ccc',
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  trustText: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '500',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
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
  verifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e9456015',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9456030',
    marginBottom: 16,
  },
  verifyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  verifyText: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  verifySubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  frequencySelector: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  frequencyLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2a2a4e',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#e94560',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  philosophyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
  },
  philosophyText: {
    flex: 1,
    fontSize: 14,
    color: '#888',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef444450',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    color: '#444',
    fontSize: 12,
    marginTop: 24,
  },
  tagline: {
    textAlign: 'center',
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
