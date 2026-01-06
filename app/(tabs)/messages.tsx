import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface ConversationWithDetails {
  id: string;
  item_id: string | null;
  requester_id: string;
  owner_id: string;
  status: string;
  last_message_at: string;
  // Joined data
  item_name?: string;
  item_photo?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  unread_count?: number;
}

function ConversationCard({ conversation, userId }: { conversation: ConversationWithDetails; userId: string }) {
  const isRequester = conversation.requester_id === userId;
  
  return (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/chat/${conversation.id}`)}
      activeOpacity={0.7}
    >
      {/* Item photo or user avatar */}
      <View style={styles.avatarContainer}>
        {conversation.item_photo ? (
          <Image source={{ uri: conversation.item_photo }} style={styles.avatar} />
        ) : conversation.other_user_avatar ? (
          <Image source={{ uri: conversation.other_user_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {conversation.other_user_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        
        {/* Unread badge */}
        {conversation.unread_count && conversation.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{conversation.unread_count}</Text>
          </View>
        )}
      </View>
      
      {/* Content */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle} numberOfLines={1}>
            {conversation.item_name || conversation.other_user_name || 'Conversazione'}
          </Text>
          <Text style={styles.conversationTime}>
            {formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
              locale: it,
            })}
          </Text>
        </View>
        
        <Text style={styles.otherUserName} numberOfLines={1}>
          {isRequester ? 'Tu hai chiesto a' : 'Ti ha chiesto'} {conversation.other_user_name}
        </Text>
        
        {conversation.last_message && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.last_message}
          </Text>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      // Carica conversazioni dell'utente
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          items:item_id (name, photos),
          requester:requester_id (display_name, avatar_url),
          owner:owner_id (display_name, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data
      const transformed: ConversationWithDetails[] = (data || []).map((conv: any) => {
        const isRequester = conv.requester_id === user.id;
        const otherUser = isRequester ? conv.owner : conv.requester;
        
        return {
          id: conv.id,
          item_id: conv.item_id,
          requester_id: conv.requester_id,
          owner_id: conv.owner_id,
          status: conv.status,
          last_message_at: conv.last_message_at,
          item_name: conv.items?.name,
          item_photo: conv.items?.photos?.[0],
          other_user_name: otherUser?.display_name,
          other_user_avatar: otherUser?.avatar_url,
        };
      });
      
      setConversations(transformed);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    loadConversations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `requester_id=eq.${user?.id}`,
        },
        () => loadConversations()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `owner_id=eq.${user?.id}`,
        },
        () => loadConversations()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConversations, user]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);
  
  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard conversation={item} userId={user?.id || ''} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Caricamento...' : 'Nessuna conversazione'}
            </Text>
            <Text style={styles.emptyText}>
              {isLoading
                ? ''
                : 'Quando chiedi in prestito un oggetto o qualcuno ti contatta, le conversazioni appariranno qui.'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      
      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={16} color="#888" />
        <Text style={styles.infoText}>
          Ricorda: le transazioni sono più sicure se fatte tramite l'app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  listContent: {
    paddingBottom: 80,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e94560',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
    gap: 2,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  otherUserName: {
    fontSize: 13,
    color: '#888',
  },
  lastMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#1a1a2e',
    marginLeft: 84,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#888',
  },
});
