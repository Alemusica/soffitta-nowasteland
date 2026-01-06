#!/bin/bash

# Script per convertire le icone SVG in PNG
# Richiede: Inkscape, ImageMagick, o rsvg-convert

echo "🎨 Conversione icone SVG → PNG"
echo "================================"

# Verifica se rsvg-convert è installato (comune su macOS con homebrew)
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg"
elif command -v inkscape &> /dev/null; then
    CONVERTER="inkscape"
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
else
    echo "❌ Errore: Nessun convertitore SVG trovato."
    echo ""
    echo "Installa uno di questi:"
    echo "  brew install librsvg     # Consigliato"
    echo "  brew install inkscape"
    echo "  brew install imagemagick"
    exit 1
fi

echo "Usando: $CONVERTER"
echo ""

cd "$(dirname "$0")/../assets"

convert_svg() {
    local input=$1
    local output=$2
    local width=$3
    local height=$4
    
    if [ ! -f "$input" ]; then
        echo "⚠️  File non trovato: $input"
        return
    fi
    
    case $CONVERTER in
        rsvg)
            rsvg-convert -w "$width" -h "$height" "$input" -o "$output"
            ;;
        inkscape)
            inkscape "$input" -w "$width" -h "$height" -o "$output"
            ;;
        imagemagick)
            convert -background none -resize "${width}x${height}" "$input" "$output"
            ;;
    esac
    
    if [ -f "$output" ]; then
        echo "✅ $output (${width}x${height})"
    else
        echo "❌ Errore creando $output"
    fi
}

echo "Conversione icon.svg..."
convert_svg "icon.svg" "icon.png" 1024 1024

echo ""
echo "Conversione splash.svg..."
convert_svg "splash.svg" "splash.png" 1284 2778

echo ""
echo "Conversione adaptive-icon.svg..."
convert_svg "adaptive-icon.svg" "adaptive-icon.png" 1024 1024

echo ""
echo "Conversione favicon.svg..."
convert_svg "favicon.svg" "favicon.png" 48 48

echo ""
echo "================================"
echo "✨ Fatto! Le icone PNG sono in assets/"
echo ""
echo "Per usarle con Expo, assicurati che app.json punti ai file .png"
