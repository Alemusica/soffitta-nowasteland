# 🎙️ Whisper Server per Soffitta

Server locale per trascrizione vocale usando [OpenAI Whisper](https://github.com/openai/whisper).

## Requisiti

- Python 3.8+
- ffmpeg
- ~5GB RAM per modello `medium` (consigliato)
- ~10GB RAM per modello `large-v3` (massima qualità)

## Installazione

```bash
# Installa dipendenze Python
pip3 install openai-whisper flask flask-cors

# Installa ffmpeg (se non presente)
brew install ffmpeg
```

## Avvio

```bash
# Avvio standard (modello medium)
./start.sh

# Con modello specifico
./start.sh large-v3    # Massima qualità (10GB RAM)
./start.sh small       # Più veloce (2GB RAM)
./start.sh turbo       # Ottimo compromesso (6GB RAM)
```

## API Endpoints

### Health Check
```bash
curl http://localhost:5555/health
```

### Trascrizione
```bash
curl -X POST http://localhost:5555/transcribe \
  -F "file=@audio.wav" \
  -F "language=it"
```

### Lista modelli
```bash
curl http://localhost:5555/models
```

### Cambia modello
```bash
curl -X POST http://localhost:5555/switch-model \
  -H "Content-Type: application/json" \
  -d '{"model": "large-v3"}'
```

## Modelli disponibili

| Modello | Parametri | RAM | Velocità | Qualità Italiano |
|---------|-----------|-----|----------|------------------|
| tiny | 39M | ~1GB | ~10x | Base |
| base | 74M | ~1GB | ~7x | Buona |
| small | 244M | ~2GB | ~4x | Ottima |
| **medium** | 769M | ~5GB | ~2x | **Eccellente** |
| large-v3 | 1550M | ~10GB | 1x | Massima |
| turbo | 809M | ~6GB | ~8x | Ottima |

**Consigliato per italiano**: `medium` o `large-v3`

## Uso con device mobile

Se usi l'app su device fisico (non emulatore), devi:

1. Trovare l'IP del tuo Mac: `ifconfig | grep "inet "`
2. Aggiornare `EXPO_PUBLIC_WHISPER_LOCAL_URL` nel `.env`
3. Assicurarti che Mac e device siano sulla stessa rete WiFi

## Produzione

Per produzione, considera:

1. **API OpenAI**: Cambia `EXPO_PUBLIC_WHISPER_BACKEND=openai` e aggiungi `EXPO_PUBLIC_OPENAI_API_KEY`
2. **VPS self-hosted**: Deploy su Hetzner/DigitalOcean con questo server
3. **Supabase Edge Function**: Proxy verso API OpenAI

---

*"Care your neurons" - Prima di parlare, prova a ricordare!* 🧠
