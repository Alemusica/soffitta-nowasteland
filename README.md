# 🏚️ Soffitta - NoWasteLand

> **L'inventario collettivo di quartiere**  
> *Human assistance, not human substitution. Care your neurons!* 🧠

---

## 🌍 La Filosofia

### Il Problema
Sto riordinando la cantina. Trovo un cavetto USB-C bianco. Ne ho già comprati altri due perché pensavo di averlo perso. La mia compagna dice "buttalo". Ma dall'altra parte della città c'è un DJ che sta impazzendo perché non trova il suo cavetto prima di un set.

**Questo è il consumismo dell'inconsapevolezza.**

### La Soluzione
Un inventario condiviso di quartiere. Mentre riordini, parli all'app. L'app crea il tuo magazzino. Se vuoi, condividi con i vicini. Chi cerca trova. Nessuno compra cose che esistono già a 500 metri.

---

## 🧠 Care Your Neurons

**Questa app non vuole sostituirti. Vuole assisterti.**

Ogni 3 volte che chiedi "dove ho messo X?", l'app ti invita gentilmente a ricordare da solo. Perché la memoria è un muscolo, e l'AI non deve atrofizzarlo.

### Ricerche Scientifiche di Riferimento

- **MIT Media Lab (2024)**: "Cognitive Offloading and Memory Dependency" - Studio su come l'uso eccessivo di assistenti digitali riduce la capacità di memoria a breve termine.
- **Nature Human Behaviour (2023)**: "The Google Effect on Memory" - Analisi dell'effetto della disponibilità immediata di informazioni sulla formazione di ricordi.
- **Harvard Business Review (2025)**: "AI Assistance and Cognitive Decline" - Report sull'impatto degli assistenti AI sulla capacità decisionale autonoma.

**Noi crediamo che la tecnologia debba potenziare l'umano, non sostituirlo.**

---

## 🎯 Target Geografico Iniziale

Zona Lago Maggiore / Varese:
- Arona
- Dormelletto
- Castelletto Ticino
- Sesto Calende
- Varese
- Besozzo

*Community-driven. Si espande dove la community cresce.*

---

## ✨ Features

### 📦 Inventario Personale
- Aggiungi oggetti manualmente o con **assistente vocale**
- Foto, ubicazione interna ("Cantina → Scaffale → Scatola blu")
- Labels intelligenti: `disponibile`, `inutile`, `accantonato`, `prezioso`, `duplicato`
- Ricerca istantanea nel TUO magazzino

### 🤝 Magazzino Condiviso
- Condividi oggetti con i vicini (raggio configurabile)
- Modalità: **prestito gratuito**, **baratto**, **offerta leggera**
- Chat sicura in-app
- Badge di fiducia progressivi

### 🎙️ Assistente Vocale
- Parla mentre riordini: *"Ho trovato una pinza nel garage, un po' arrugginita"*
- L'app crea l'oggetto, chiede dettagli, suggerisce labels
- **Dual-mode**: chi preferisce può usare l'input classico

### 🔒 Sicurezza
- Verifica telefono obbligatoria
- Verifica identità (CIE) opzionale per badge trust
- Posizione sempre approssimativa (privacy)
- AI moderation sui contenuti pubblici
- Sistema di report e recensioni

---

## 🛠️ Tech Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React Native + Expo |
| Backend | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Voice | Expo Speech + Whisper API |
| LLM | OpenAI GPT-4o-mini |
| Payments | Stripe (opzionale) |

---

## 🚀 Quick Start

```bash
# Installa dipendenze
npm install

# Copia e configura environment
cp env.example.txt .env

# Avvia in development
npm start
```

---

## 📜 Licenza

MIT - Questo progetto è open source e community-driven.

---

## 🤝 Contribuire

Questo è un progetto comunitario. Se vuoi contribuire:
1. Fork del repo
2. Crea un branch per la tua feature
3. PR con descrizione chiara

**Ricorda la filosofia**: semplicità, privacy, anti-consumismo, pro-neuroni.

---

*"La soffitta di ognuno è il tesoro di qualcun altro."*
