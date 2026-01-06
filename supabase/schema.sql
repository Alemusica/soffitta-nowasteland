-- ================================================
-- SOFFITTA - NoWasteLand
-- Database Schema per Supabase (PostgreSQL + PostGIS)
-- ================================================

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE item_condition AS ENUM ('nuovo', 'ottimo', 'buono', 'usato', 'da_riparare');
CREATE TYPE item_visibility AS ENUM ('private', 'public', 'group');
CREATE TYPE sharing_mode AS ENUM ('prestito', 'baratto', 'offerta', 'noleggio');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'in_progress', 'returned', 'completed', 'disputed', 'cancelled');
CREATE TYPE conversation_status AS ENUM ('active', 'completed', 'cancelled', 'reported');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');
CREATE TYPE report_reason AS ENUM ('spam', 'illegal', 'harassment', 'fake', 'inappropriate', 'other');
CREATE TYPE group_role AS ENUM ('admin', 'moderator', 'member');

-- ================================================
-- USERS (estende auth.users di Supabase)
-- ================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Info base
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  height_cm INT, -- Per stima dimensioni vocale ("lungo come il mio braccio")
  
  -- Geolocalizzazione APPROSSIMATIVA (privacy!)
  -- Arrotondata a ~1km di precisione
  approx_location GEOGRAPHY(POINT, 4326),
  city TEXT,
  neighborhood TEXT,
  
  -- Verifica identità
  phone_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  identity_verified_at TIMESTAMPTZ,
  
  -- Stripe (opzionale)
  stripe_customer_id TEXT,
  stripe_connect_account_id TEXT,
  
  -- Trust e badge
  trust_score INT DEFAULT 0,
  badges TEXT[] DEFAULT '{}', -- ['phone_verified', 'identity_verified', 'responsible', 'top_community']
  total_transactions INT DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  
  -- Preferenze
  prefers_voice_input BOOLEAN DEFAULT TRUE,
  neuron_nudge_enabled BOOLEAN DEFAULT TRUE,
  neuron_nudge_frequency INT DEFAULT 3, -- Ogni N query "dove ho messo?"
  locale TEXT DEFAULT 'it-IT',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- CATEGORIES (Predefinite)
-- ================================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_it TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id),
  icon TEXT, -- Emoji
  suggested_labels TEXT[],
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Seed categories
INSERT INTO public.categories (name, name_it, icon, suggested_labels, sort_order) VALUES
  ('electronics', 'Elettronica', '🔌', ARRAY['fragile'], 1),
  ('tools', 'Attrezzi', '🔧', ARRAY['pericoloso'], 2),
  ('home_garden', 'Casa e Giardino', '🏠', ARRAY[]::TEXT[], 3),
  ('sports', 'Sport', '⚽', ARRAY[]::TEXT[], 4),
  ('books_media', 'Libri e Media', '📚', ARRAY[]::TEXT[], 5),
  ('clothing', 'Abbigliamento', '👕', ARRAY[]::TEXT[], 6),
  ('kitchen', 'Cucina', '🍳', ARRAY[]::TEXT[], 7),
  ('kids', 'Bambini', '🧸', ARRAY[]::TEXT[], 8),
  ('cables', 'Cavi e Adattatori', '🔗', ARRAY[]::TEXT[], 9),
  ('other', 'Altro', '📦', ARRAY[]::TEXT[], 99);

-- ================================================
-- ITEMS (Oggetti inventario)
-- ================================================

CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Info base
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  custom_tags TEXT[] DEFAULT '{}',
  
  -- Dimensioni (stimate o precise)
  estimated_length_cm INT,
  estimated_width_cm INT,
  estimated_height_cm INT,
  weight_grams INT,
  
  -- Condizione
  condition item_condition DEFAULT 'buono',
  
  -- Labels semantici (CORE FEATURE!)
  labels TEXT[] DEFAULT '{}', -- ['disponibile', 'inutile', 'accantonato', 'prezioso', 'duplicato']
  
  -- Visibilità e sharing
  visibility item_visibility DEFAULT 'private',
  sharing_mode sharing_mode,
  price_cents INT, -- Se offerta/noleggio
  deposit_cents INT, -- Cauzione richiesta
  
  -- Ubicazione interna (DOVE L'HO MESSO)
  location_room TEXT,
  location_furniture TEXT,
  location_detail TEXT,
  
  -- Media
  photos TEXT[] DEFAULT '{}', -- Array URL da Supabase Storage
  voice_note_url TEXT, -- Nota vocale originale (opzionale)
  
  -- Stato prestito corrente
  is_currently_lent BOOLEAN DEFAULT FALSE,
  lent_to_user_id UUID REFERENCES public.profiles(id),
  lent_at TIMESTAMPTZ,
  expected_return_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INT DEFAULT 0,
  request_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ, -- Per calcolare "non usato da X mesi"
  
  -- Full-text search (italiano)
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('italian', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('italian', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('italian', COALESCE(location_room, '')), 'C') ||
    setweight(to_tsvector('italian', COALESCE(location_furniture, '')), 'C')
  ) STORED
);

-- Indexes
CREATE INDEX items_owner_idx ON public.items(owner_id);
CREATE INDEX items_category_idx ON public.items(category_id);
CREATE INDEX items_visibility_idx ON public.items(visibility) WHERE visibility = 'public';
CREATE INDEX items_search_idx ON public.items USING GIN(search_vector);
CREATE INDEX items_labels_idx ON public.items USING GIN(labels);

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- CONVERSATIONS (Chat)
-- ================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  status conversation_status DEFAULT 'active',
  
  -- Se transazione concordata
  transaction_type sharing_mode,
  agreed_price_cents INT,
  deposit_held_cents INT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX conversations_requester_idx ON public.conversations(requester_id);
CREATE INDEX conversations_owner_idx ON public.conversations(owner_id);
CREATE INDEX conversations_item_idx ON public.conversations(item_id);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- MESSAGES
-- ================================================

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX messages_conversation_idx ON public.messages(conversation_id);
CREATE INDEX messages_sender_idx ON public.messages(sender_id);

-- ================================================
-- TRANSACTIONS (Tracciamento prestiti/scambi)
-- ================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id),
  item_id UUID REFERENCES public.items(id),
  
  lender_id UUID NOT NULL REFERENCES public.profiles(id), -- Chi presta/vende
  borrower_id UUID NOT NULL REFERENCES public.profiles(id), -- Chi prende
  
  type sharing_mode NOT NULL,
  
  -- Soldi (se applicabile)
  amount_cents INT,
  deposit_cents INT,
  platform_fee_cents INT, -- Fee app (opzionale)
  stripe_payment_intent_id TEXT,
  
  status transaction_status DEFAULT 'pending',
  
  -- Date
  started_at TIMESTAMPTZ,
  expected_return_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Note
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX transactions_lender_idx ON public.transactions(lender_id);
CREATE INDEX transactions_borrower_idx ON public.transactions(borrower_id);
CREATE INDEX transactions_item_idx ON public.transactions(item_id);

-- ================================================
-- REVIEWS
-- ================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id),
  
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  -- Aspetti specifici
  punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
  condition_rating INT CHECK (condition_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utente può lasciare una sola review per transazione
  UNIQUE(transaction_id, reviewer_id)
);

CREATE INDEX reviews_reviewed_user_idx ON public.reviews(reviewed_user_id);

-- ================================================
-- REPORTS & MODERATION
-- ================================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Cosa viene segnalato (uno solo valorizzato)
  reported_user_id UUID REFERENCES public.profiles(id),
  reported_item_id UUID REFERENCES public.items(id),
  reported_message_id UUID REFERENCES public.messages(id),
  
  reason report_reason NOT NULL,
  description TEXT,
  
  -- Moderazione
  status report_status DEFAULT 'pending',
  moderator_notes TEXT,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- AI Moderation flags (contenuti pubblici)
CREATE TABLE public.flagged_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  
  flagged_by TEXT DEFAULT 'ai', -- 'ai' o 'user'
  ai_categories JSONB, -- {"spam": 0.9, "illegal": 0.1}
  ai_score DECIMAL,
  
  status report_status DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ================================================
-- GROUPS (Comunità locali / Palazzi)
-- ================================================

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL, -- Codice invito "ARONA2024"
  
  approx_location GEOGRAPHY(POINT, 4326),
  city TEXT,
  
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  member_count INT DEFAULT 1,
  settings JSONB DEFAULT '{"require_approval": false, "auto_share_items": false}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role group_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (group_id, user_id)
);

-- ================================================
-- NEURON CARE TRACKING (Anti-pigrizia memoria)
-- ================================================

CREATE TABLE public.location_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  query_text TEXT, -- "dove ho messo la pinza?"
  item_found_id UUID REFERENCES public.items(id),
  
  -- Per il nudge "Care your neurons"
  was_nudged BOOLEAN DEFAULT FALSE,
  user_remembered_alone BOOLEAN, -- Ha ricordato senza aiuto?
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX location_queries_user_idx ON public.location_queries(user_id);
CREATE INDEX location_queries_created_idx ON public.location_queries(created_at);

-- View per contare query recenti (per decidere se fare nudge)
CREATE VIEW public.user_recent_location_queries AS
SELECT 
  user_id,
  COUNT(*) as queries_last_24h,
  COUNT(*) FILTER (WHERE was_nudged = FALSE) as queries_without_nudge
FROM public.location_queries
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id;

-- ================================================
-- ROW LEVEL SECURITY (Privacy!)
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_queries ENABLE ROW LEVEL SECURITY;

-- PROFILES: tutti vedono profili pubblici, solo owner modifica
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ITEMS: privati solo owner, pubblici tutti, gruppi solo membri
CREATE POLICY "Users can view own items" ON public.items
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view public items" ON public.items
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view group items if member" ON public.items
  FOR SELECT USING (
    visibility = 'group' AND EXISTS (
      SELECT 1 FROM public.group_members gm1
      JOIN public.group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = auth.uid() AND gm2.user_id = items.owner_id
    )
  );

CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE USING (owner_id = auth.uid());

-- CONVERSATIONS: solo partecipanti
CREATE POLICY "Conversation participants can view" ON public.conversations
  FOR SELECT USING (requester_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- MESSAGES: solo partecipanti della conversazione
CREATE POLICY "Message participants can view" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.requester_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.requester_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- LOCATION_QUERIES: solo owner
CREATE POLICY "Users can view own queries" ON public.location_queries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own queries" ON public.location_queries
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ================================================
-- FUNCTIONS
-- ================================================

-- Funzione per cercare items pubblici vicini
CREATE OR REPLACE FUNCTION public.search_nearby_items(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INT DEFAULT 5,
  search_query TEXT DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  limit_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category_id UUID,
  photos TEXT[],
  labels TEXT[],
  sharing_mode sharing_mode,
  price_cents INT,
  owner_id UUID,
  owner_display_name TEXT,
  owner_avatar_url TEXT,
  owner_trust_score INT,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name,
    i.description,
    i.category_id,
    i.photos,
    i.labels,
    i.sharing_mode,
    i.price_cents,
    p.id as owner_id,
    p.display_name as owner_display_name,
    p.avatar_url as owner_avatar_url,
    p.trust_score as owner_trust_score,
    ST_Distance(
      p.approx_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  FROM public.items i
  JOIN public.profiles p ON i.owner_id = p.id
  WHERE 
    i.visibility = 'public'
    AND i.is_currently_lent = FALSE
    AND 'disponibile' = ANY(i.labels)
    AND (category_filter IS NULL OR i.category_id = category_filter)
    AND (search_query IS NULL OR i.search_vector @@ plainto_tsquery('italian', search_query))
    AND ST_DWithin(
      p.approx_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_meters
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per aggiornare trust score dopo review
CREATE OR REPLACE FUNCTION public.update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    trust_score = (
      SELECT COALESCE(AVG(rating) * 20, 0)::INT
      FROM public.reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    successful_transactions = (
      SELECT COUNT(*)
      FROM public.transactions
      WHERE (lender_id = NEW.reviewed_user_id OR borrower_id = NEW.reviewed_user_id)
      AND status = 'completed'
    )
  WHERE id = NEW.reviewed_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_trust_score_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_trust_score();

-- Funzione per creare profilo automaticamente dopo signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
