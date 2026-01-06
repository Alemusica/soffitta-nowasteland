import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { Message, Conversation } from '@/lib/database.types';

interface MessageWithSender extends Message {
  sender?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  // Load conversation and messages
  useEffect(() => {
    if (!id) return;
    
    loadConversation();
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Fetch sender info
          supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single()
            .then(({ data }) => {
              setMessages((prev) => [...prev, { ...newMsg, sender: data || undefined }]);
            });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  
  const loadConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!error && data) {
      setConversation(data);
    }
  };
  
  const loadMessages = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (display_name, avatar_url)
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
    }
    
    setIsLoading(false);
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    
    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content: messageText,
    });
    
    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore on error
    } else {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', id);
    }
    
    setIsSending(false);
  };
  
  const renderMessage = useCallback(
    ({ item }: { item: MessageWithSender }) => {
      const isOwnMessage = item.sender_id === user?.id;
      
      return (
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {item.is_system_message ? (
            <View style={styles.systemMessage}>
              <Ionicons name="information-circle" size={14} color="#888" />
              <Text style={styles.systemMessageText}>{item.content}</Text>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.messageBubble,
                  isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
              <Text style={styles.messageTime}>
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                  locale: it,
                })}
              </Text>
            </>
          )}
        </View>
      );
    },
    [user]
  );
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chat',
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* System message */}
        <View style={styles.systemBanner}>
          <Ionicons name="shield-checkmark" size={14} color="#22c55e" />
          <Text style={styles.systemBannerText}>
            Le transazioni in-app sono più sicure. Non condividere dati sensibili.
          </Text>
        </View>
        
        {/* Messages list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#e94560" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👋</Text>
                <Text style={styles.emptyText}>
                  Inizia la conversazione!
                  {'\n'}Presentati e spiega cosa ti serve.
                </Text>
              </View>
            }
          />
        )}
        
        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor="#666"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#22c55e10',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  systemBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#22c55e',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: '#e94560',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#1a1a2e',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e9456050',
  },
});
