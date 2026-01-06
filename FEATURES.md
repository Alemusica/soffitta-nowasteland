# ✨ Features - Soffitta NoWasteLand

> L'inventario collettivo di quartiere
> **Human assistance, not human substitution. Care your neurons!** 🧠

---

## 📦 Inventario Personale

### La tua soffitta digitale
Mentre riordini casa, cantina o garage, cataloga tutto quello che trovi. L'app diventa la tua memoria esterna organizzata.

| Feature | Descrizione |
|---------|-------------|
| **Aggiungi oggetti** | Manualmente o con assistente vocale |
| **Foto multiple** | Fino a 4 foto per oggetto |
| **Categorie** | Elettronica, Attrezzi, Casa, Sport, etc. |
| **Condizioni** | Nuovo, Ottimo, Buono, Usato, Da riparare |
| **Ubicazione interna** | Stanza → Mobile → Dettaglio ("Cantina → Scaffale → Scatola blu") |
| **Ricerca istantanea** | Full-text search in italiano |
| **Filtri avanzati** | Per categoria, label, visibilità |

### Labels Semantici
Etichette intelligenti per organizzare e decidere cosa fare degli oggetti.

| Label | Emoji | Uso |
|-------|-------|-----|
| Disponibile | ✅ | Pronto per il prestito |
| In prestito | 🤝 | Attualmente prestato |
| Inutile | 🗑️ | Non lo uso mai, potrei cederlo |
| Accantonato | 📦 | Non lo uso da tempo |
| Prezioso | 💎 | Valore affettivo o economico |
| Duplicato | 👯 | Ne ho più di uno |
| Fragile | 🔮 | Maneggiare con cura |
| Pericoloso | ⚠️ | Richiede attenzione |
| Da baratto | 🔄 | Disponibile per scambio |
| In offerta | 💰 | Con contributo economico |

---

## 🤝 Magazzino Condiviso

### Sharing economy di quartiere
Condividi i tuoi oggetti con i vicini. Riduci gli sprechi, risparmia soldi, conosci chi ti sta intorno.

| Feature | Descrizione |
|---------|-------------|
| **Visibilità pubblica** | Scegli cosa condividere |
| **Ricerca geolocalizzata** | Trova oggetti entro 1-20km |
| **Raggio configurabile** | Tu decidi quanto lontano cercare |
| **Filtro categorie** | Trova quello che ti serve |
| **Posizione approssimata** | Privacy: mai l'indirizzo esatto |

### Modalità di Condivisione

| Modalità | Descrizione | Transazione |
|----------|-------------|-------------|
| 🤝 **Prestito** | Gratuito, restituisci dopo l'uso | Free |
| 🔄 **Baratto** | Scambia con un altro oggetto | Free |
| 💰 **Offerta** | Cedi con un piccolo contributo | € in-app |
| 📅 **Noleggio** | Presta a pagamento per tempo | €/giorno |

---

## 🎙️ Assistente Vocale

### Riordina parlando
Mentre svuoti un cassetto o riordini la cantina, parla all'app. Lei crea gli oggetti per te.

**Esempio di dialogo:**

> 👤 *"Ho trovato un cavetto USB-C bianco, un po' rovinato, l'ho messo sopra l'armadio in camera"*
>
> 🤖 *"Ok! Cavetto USB-C bianco. Per stimare la lunghezza: quanto sei alto più o meno?"*
>
> 👤 *"1 metro e 75"*
>
> 🤖 *"Perfetto, circa 70-80cm. Vuoi foto? Lo condividi con i vicini?"*

### Tecnologie
- **Speech-to-Text**: Whisper API (OpenAI)
- **Comprensione**: GPT-4o-mini
- **Text-to-Speech**: Expo Speech nativo

---

## 🧠 Care Your Neurons

### La filosofia anti-dipendenza
Non vogliamo che l'AI ti renda pigro. Ogni 3 volte che chiedi "dove ho messo X?", l'app ti invita a ricordare da solo.

> 🧠 *"Care your neurons! Prima di dirtelo, prova a ricordare: dove hai visto questo oggetto l'ultima volta?"*

### Perché lo facciamo
Studi del MIT e Harvard dimostrano che l'uso eccessivo di assistenti digitali riduce la memoria a breve termine. Noi crediamo che la tecnologia debba **potenziare** l'umano, non **sostituirlo**.

### Configurabile
- Attiva/disattiva il nudge
- Scegli la frequenza (ogni 2, 3, 5, 10 query)

---

## 🔒 Sicurezza e Trust

### Verifica Identità
| Livello | Verifica | Badge |
|---------|----------|-------|
| Base | Email | - |
| Verificato | Telefono (SMS) | 📱 |
| Certificato | Carta d'Identità (CIE) | 🛡️ |

### Badge Progressivi
| Badge | Requisito |
|-------|-----------|
| 📱 Telefono verificato | Verifica SMS |
| 🛡️ Identità verificata | Verifica CIE con Stripe |
| ⭐ Persona responsabile | 5+ scambi completati |
| 🏆 Top Community | 20+ scambi, rating 4.5+ |
| 🌱 Early Adopter | Tra i primi 100 utenti |

### Privacy
- Posizione sempre approssimata (~1km)
- Mai indirizzo esatto visibile
- Dati personali protetti (GDPR)
- Chat crittografate
- Export e cancellazione dati

---

## 💬 Chat e Messaggistica

### Comunicazione sicura
- Chat 1:1 in-app
- Realtime (Supabase Realtime)
- Storico conversazioni
- Notifiche push

### Transazioni in-app
Tutte le transazioni passano dall'app per maggiore sicurezza. Niente "contattami in privato".

---

## 📱 Piattaforme

| Piattaforma | Stato | Note |
|-------------|-------|------|
| 🌐 **Web** | ✅ Disponibile | Progressive Web App |
| 🍎 **iOS** | 🔜 In arrivo | TestFlight Q1 2026 |
| 🤖 **Android** | 🔜 In arrivo | Play Store Q1 2026 |
| 🔊 **Alexa** | 📋 Pianificato | Q3 2026 |
| 🏠 **Google Home** | 📋 Pianificato | Q3 2026 |

---

## 🌍 Copertura Geografica

### Fase Alpha (Attuale)
- Arona
- Dormelletto
- Castelletto Ticino
- Sesto Calende
- Varese
- Besozzo

### Espansione pianificata
1. Lombardia e Piemonte
2. Nord Italia
3. Italia completa
4. Europa

---

## 💰 Modello Economico

### Gratuito per sempre
L'app è e resterà gratuita per l'uso base:
- Inventario personale illimitato
- Ricerca oggetti
- Chat e prestiti gratuiti
- Baratto

### Fee opzionali
- **5% su transazioni €** (offerte e noleggi)
- **Donazioni volontarie** per supportare lo sviluppo

### Nessuna pubblicità
Mai. La tua attenzione non è in vendita.

---

## 🤝 Open Source

Il codice è open source. Contribuisci, forka, migliora.

- **Licenza**: MIT
- **Repo**: [github.com/Alemusica/soffitta-nowasteland](https://github.com/Alemusica/soffitta-nowasteland)
- **Issues**: Segnala bug e richieste
- **PR**: Benvenute!

---

*"La soffitta di ognuno è il tesoro di qualcun altro."* 🏚️
