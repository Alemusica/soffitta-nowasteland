/**
 * Login Screen - Soffitta NoWasteLand
 * 
 * Swiss Typography Design
 * Clean, warm, calming aesthetic
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useColors } from '@/stores/themeStore';

export default function LoginScreen() {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithEmail, isLoading } = useAuthStore();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Inserisci email e password');
      return;
    }
    
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      router.replace('/(tabs)');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header - Swiss minimal */}
        <View style={styles.header}>
          <Text style={[styles.brandMark, { color: colors.primary }]}>S</Text>
          <Text style={[styles.title, { color: colors.text }]}>Soffitta</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            L'inventario collettivo di quartiere
          </Text>
        </View>
        
        {/* Form - Clean inputs */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="nome@email.it"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoComplete="password"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entra</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Non hai un account?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: colors.primary }]}>Registrati</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {/* Philosophy - subtle */}
        <View style={[styles.philosophy, { borderColor: colors.border }]}>
          <Text style={[styles.philosophyText, { color: colors.textMuted }]}>
            🧠 Care your neurons
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandMark: {
    fontSize: 72,
    fontWeight: '200',
    letterSpacing: -4,
    marginBottom: -8,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '400',
    borderWidth: 1,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
  philosophy: {
    marginTop: 48,
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
  },
  philosophyText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
});
