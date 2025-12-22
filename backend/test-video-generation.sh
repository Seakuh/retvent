#!/bin/bash

# Test-Script für AI Video Generation
# Verwendung: ./test-video-generation.sh [Bild-Datei] [JWT-Token] [Optional: Prompt]

# Standardwerte
DEFAULT_IMAGE="$HOME/Downloads/event-flyer.webp"
IMAGE_FILE="${1:-$DEFAULT_IMAGE}"
JWT_TOKEN="${2:-YOUR_JWT_TOKEN_HERE}"
PROMPT="${3:-}"
API_URL="${API_URL:-http://localhost:4000}"

# Expandiere Tilde falls vorhanden (wenn als Parameter übergeben)
if [[ "$IMAGE_FILE" == ~* ]]; then
    IMAGE_FILE="${IMAGE_FILE/#\~/$HOME}"
fi

# Prüfe ob Datei existiert
if [ ! -f "$IMAGE_FILE" ]; then
    echo "❌ Fehler: Datei nicht gefunden: $IMAGE_FILE"
    echo ""
    echo "Verwendung: $0 [Bild-Datei] [JWT-Token] [Optional: Prompt]"
    echo ""
    echo "Beispiele:"
    echo "  $0 ~/Downloads/event.jpg YOUR_JWT_TOKEN"
    echo "  $0 /home/dizzle/Downloads/event.webp YOUR_JWT_TOKEN"
    echo "  $0 ~/Downloads/event.png YOUR_JWT_TOKEN 'Custom prompt here'"
    echo ""
    echo "Verfügbare Dateien in ~/Downloads:"
    ls -1 ~/Downloads/*.{jpg,jpeg,png,webp} 2>/dev/null | head -5 || echo "  (keine Bilddateien gefunden)"
    exit 1
fi

# Prüfe ob Token gesetzt ist
# if [ "$JWT_TOKEN" = "YOUR_JWT_TOKEN_HERE" ]; then
#     echo "⚠️  Warnung: Bitte JWT-Token angeben!"
#     echo "Verwendung: $0 [Bild-Datei] [JWT-Token] [Optional: Prompt]"
#     echo ""
#     echo "Beispiel:"
#     echo "  $0 ~/Downloads/event.jpg eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#     exit 1
# fi

# echo "🚀 Starte Video-Generierung..."
# echo "📁 Bild: $IMAGE_FILE"
# echo "🔗 API: $API_URL/events/ai/video/generate"
# echo ""

# Erstelle curl-Befehl
if [ -z "$PROMPT" ]; then
    # Ohne Prompt
    curl -X POST \
      "$API_URL/events/ai/video/generate" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -F "file=@$IMAGE_FILE" \
      -v
else
    # Mit Prompt
    curl -X POST \
      "$API_URL/events/ai/video/generate" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -F "file=@$IMAGE_FILE" \
      -F "prompt=$PROMPT" \
      -v
fi

echo ""
echo "✅ Request abgeschlossen"

