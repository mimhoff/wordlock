#!/bin/bash
# Generate PNG icons from SVG source

# Check if ImageMagick/rsvg-convert is installed
if command -v rsvg-convert &> /dev/null; then
    CONVERTER="rsvg-convert"
    echo "Using rsvg-convert..."
elif command -v convert &> /dev/null; then
    CONVERTER="imagemagick"
    echo "Using ImageMagick..."
else
    echo "Error: Neither rsvg-convert nor ImageMagick is installed."
    echo ""
    echo "Install one of these:"
    echo "  Ubuntu/Debian: sudo apt-get install librsvg2-bin"
    echo "  macOS: brew install librsvg"
    echo "  or: brew install imagemagick"
    echo ""
    echo "Or use online tool: https://www.pwabuilder.com/imageGenerator"
    exit 1
fi

# Icon sizes needed
SIZES=(72 96 128 144 152 192 384 512)

# Generate icons
for size in "${SIZES[@]}"; do
    if [ "$CONVERTER" = "rsvg-convert" ]; then
        rsvg-convert -w $size -h $size icon-source.svg -o "icon-${size}x${size}.png"
    else
        convert icon-source.svg -resize ${size}x${size} "icon-${size}x${size}.png"
    fi
    echo "Generated icon-${size}x${size}.png"
done

echo ""
echo "✓ All icons generated successfully!"
echo "Run: npm run copy && npm run sync"
