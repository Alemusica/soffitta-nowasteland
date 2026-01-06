#!/bin/bash
# Avvia il server Whisper per Soffitta

echo "🎙️  Avvio Whisper Server..."
echo ""

# Default model: medium (buon compromesso per M1 Max 32GB)
MODEL=${1:-medium}

cd "$(dirname "$0")"
python3 server.py --model "$MODEL" --port 5555

# Per usare large-v3 (massima qualità):
# ./start.sh large-v3

# Per usare small (più veloce):
# ./start.sh small
