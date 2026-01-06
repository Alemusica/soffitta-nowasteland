# 🤝 Contribuire a Soffitta NoWasteLand

Grazie per il tuo interesse nel contribuire! Questo progetto è community-driven e ogni contributo è benvenuto.

## 🌟 Come puoi aiutare

### 🐛 Segnalare Bug
1. Controlla se il bug è già stato segnalato nelle [Issues](https://github.com/Alemusica/soffitta-nowasteland/issues)
2. Se no, apri una nuova issue con:
   - Descrizione chiara del problema
   - Passi per riprodurlo
   - Comportamento atteso vs attuale
   - Screenshot se utili
   - Device/browser/OS

### 💡 Proporre Feature
1. Apri una issue con tag `feature-request`
2. Descrivi la feature e il suo valore
3. Discuti con la community prima di implementare

### 🔧 Contribuire Codice

#### Setup locale

```bash
# Forka il repo su GitHub

# Clona il tuo fork
git clone https://github.com/YOUR-USERNAME/soffitta-nowasteland.git
cd soffitta-nowasteland

# Installa dipendenze
npm install

# Copia environment
cp env.example.txt .env
# Compila con le tue chiavi Supabase di test

# Avvia in development
npm start
```

#### Workflow

1. Crea un branch dal `main`:
   ```bash
   git checkout -b feature/nome-feature
   # oppure
   git checkout -b fix/nome-bug
   ```

2. Fai le tue modifiche seguendo le convenzioni

3. Testa localmente su web e (se possibile) mobile

4. Committa con messaggi chiari:
   ```bash
   git commit -m "feat: aggiungi filtro per categoria"
   git commit -m "fix: correggi crash su iOS quando foto mancante"
   ```

5. Pusha e apri una Pull Request

#### Convenzioni commit

Usiamo [Conventional Commits](https://www.conventionalcommits.org/):

| Prefisso | Uso |
|----------|-----|
| `feat:` | Nuova feature |
| `fix:` | Bug fix |
| `docs:` | Documentazione |
| `style:` | Formattazione (no logic change) |
| `refactor:` | Refactoring codice |
| `test:` | Aggiunta/modifica test |
| `chore:` | Manutenzione, dipendenze |

### 🌍 Traduzioni

Vuoi tradurre l'app nella tua lingua?

1. Crea un file in `src/locales/[lingua].json`
2. Copia la struttura da `src/locales/it.json`
3. Traduci tutte le stringhe
4. Apri una PR

Lingue prioritarie:
- 🇬🇧 English
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇪🇸 Español

### 📖 Documentazione

- Migliora il README
- Aggiungi commenti al codice
- Scrivi guide e tutorial
- Correggi typo

## 📋 Linee Guida

### Codice

- **TypeScript** strict mode
- **ESLint** per linting
- **Prettier** per formatting
- Componenti funzionali con hooks
- Zustand per state management
- Nomi variabili/funzioni in inglese
- Commenti in italiano OK per logiche complesse

### UI/UX

- Mobile-first
- Dark theme come default
- Accessibilità (a11y) importante
- Animazioni fluide ma non eccessive
- Seguire il design system esistente

### Filosofia del progetto

Ricorda sempre i principi fondanti:

1. **Human assistance, not substitution** - L'app deve aiutare, non sostituire
2. **Care your neurons** - Non rendere gli utenti dipendenti
3. **Privacy first** - Mai dati sensibili esposti
4. **Community driven** - Ascolta gli utenti
5. **Anti-consumismo** - Riduci sprechi, non creare nuovi bisogni
6. **Semplicità** - Keep it simple, stupid

## 🏷️ Issue Labels

| Label | Significato |
|-------|-------------|
| `good first issue` | Perfetto per chi inizia |
| `help wanted` | Cerchiamo aiuto |
| `bug` | Qualcosa non funziona |
| `enhancement` | Miglioramento |
| `feature-request` | Nuova feature |
| `documentation` | Docs |
| `duplicate` | Già segnalato |
| `wontfix` | Non verrà implementato |

## 🎖️ Riconoscimenti

I contributori verranno aggiunti a:
- README.md (sezione Contributors)
- About page dell'app
- Early Adopter badge se contribuisci prima del v1.0

## 📜 Licenza

Contribuendo accetti che il tuo codice sia rilasciato sotto licenza MIT.

## 💬 Contatti

- **Issues**: Per bug e feature
- **Discussions**: Per domande generali
- **Email**: [da definire]

---

Grazie per rendere Soffitta migliore! 🏚️❤️
