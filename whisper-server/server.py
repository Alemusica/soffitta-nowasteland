#!/usr/bin/env python3
"""
Whisper Local Server per Soffitta - NoWasteLand
Transcrive audio in italiano usando Whisper di OpenAI (locale)

Uso:
  python server.py                    # Avvia con modello 'medium' (default)
  python server.py --model large-v3   # Avvia con modello large (migliore qualità)
  python server.py --model small      # Avvia con modello small (più veloce)

Endpoint:
  POST /transcribe - Invia file audio, ricevi testo
  GET /health - Verifica stato server
"""

import os
import sys
import argparse
import tempfile
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper

app = Flask(__name__)
CORS(app)  # Permette richieste da qualsiasi origine

# Variabili globali
model = None
model_name = "medium"

def load_model(name: str):
    """Carica il modello Whisper"""
    global model, model_name
    print(f"🔄 Caricamento modello '{name}'...")
    start = time.time()
    model = whisper.load_model(name)
    elapsed = time.time() - start
    model_name = name
    print(f"✅ Modello '{name}' caricato in {elapsed:.1f}s")
    return model

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "model": model_name,
        "language": "it"
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Transcrive un file audio in testo.
    
    Request:
        - file: audio file (wav, mp3, m4a, webm, etc.)
        - language: (opzionale) codice lingua, default 'it'
    
    Response:
        {
            "text": "testo trascritto",
            "language": "it",
            "duration": 2.5,
            "segments": [...]
        }
    """
    if 'file' not in request.files:
        return jsonify({"error": "Nessun file audio ricevuto"}), 400
    
    audio_file = request.files['file']
    language = request.form.get('language', 'it')
    
    # Salva temporaneamente il file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name
    
    try:
        start = time.time()
        
        # Transcrive con Whisper
        result = model.transcribe(
            tmp_path,
            language=language,
            task="transcribe",
            verbose=False
        )
        
        elapsed = time.time() - start
        
        return jsonify({
            "text": result["text"].strip(),
            "language": result.get("language", language),
            "duration": round(elapsed, 2),
            "segments": [
                {
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip()
                }
                for seg in result.get("segments", [])
            ]
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Pulisce il file temporaneo
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/models', methods=['GET'])
def list_models():
    """Lista modelli disponibili con info"""
    return jsonify({
        "current": model_name,
        "available": [
            {"name": "tiny", "params": "39M", "vram": "~1GB", "speed": "~10x", "quality": "base"},
            {"name": "base", "params": "74M", "vram": "~1GB", "speed": "~7x", "quality": "buona"},
            {"name": "small", "params": "244M", "vram": "~2GB", "speed": "~4x", "quality": "ottima"},
            {"name": "medium", "params": "769M", "vram": "~5GB", "speed": "~2x", "quality": "eccellente"},
            {"name": "large-v3", "params": "1550M", "vram": "~10GB", "speed": "1x", "quality": "massima"},
            {"name": "turbo", "params": "809M", "vram": "~6GB", "speed": "~8x", "quality": "ottima"}
        ]
    })

@app.route('/switch-model', methods=['POST'])
def switch_model():
    """Cambia modello al volo"""
    data = request.get_json()
    new_model = data.get('model', 'medium')
    
    try:
        load_model(new_model)
        return jsonify({
            "status": "ok",
            "model": new_model
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Whisper Local Server')
    parser.add_argument('--model', '-m', default='medium', 
                        choices=['tiny', 'base', 'small', 'medium', 'large-v3', 'turbo'],
                        help='Modello Whisper da usare (default: medium)')
    parser.add_argument('--port', '-p', type=int, default=5555,
                        help='Porta del server (default: 5555)')
    parser.add_argument('--host', default='0.0.0.0',
                        help='Host del server (default: 0.0.0.0)')
    
    args = parser.parse_args()
    
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║     🎙️  Whisper Server - Soffitta NoWasteLand            ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Voice-to-Text locale per inventario condiviso            ║
    ║  "Care your neurons" - Pensa prima di chiedere all'AI     ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Carica il modello
    load_model(args.model)
    
    print(f"""
    🚀 Server pronto!
    
    📍 URL: http://localhost:{args.port}
    📍 Health: http://localhost:{args.port}/health
    📍 Transcribe: POST http://localhost:{args.port}/transcribe
    
    💡 Per testare:
    curl -X POST http://localhost:{args.port}/transcribe \\
         -F "file=@audio.wav" \\
         -F "language=it"
    """)
    
    app.run(host=args.host, port=args.port, debug=False)
