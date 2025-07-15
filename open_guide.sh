#!/bin/bash
# Quick launcher for Hebrew Mathematical Study Guide
# Opens the HTML file in the default browser

# Check if HTML file exists
HTML_FILE="math_study_guide.html"
CSS_FILE="style.css"

echo "🚀 Hebrew Mathematical Study Guide Launcher"
echo "============================================="

if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Error: $HTML_FILE not found!"
    echo "Please make sure you're in the correct directory."
    echo "Required files:"
    echo "  - $HTML_FILE"
    echo "  - $CSS_FILE"
    exit 1
fi

if [ ! -f "$CSS_FILE" ]; then
    echo "⚠️  Warning: $CSS_FILE not found!"
    echo "The guide will still work but may not look as intended."
fi

# Get absolute path
ABS_PATH="$(pwd)/$HTML_FILE"

echo "📁 Opening: $ABS_PATH"

# Detect OS and open accordingly
case "$(uname -s)" in
    Darwin)
        # macOS
        echo "🍎 Detected macOS - using 'open' command"
        open "$HTML_FILE"
        ;;
    Linux)
        # Linux
        echo "🐧 Detected Linux - using 'xdg-open' command"
        xdg-open "$HTML_FILE" 2>/dev/null || {
            echo "❌ xdg-open not found. Trying alternatives..."
            if command -v firefox >/dev/null 2>&1; then
                firefox "$HTML_FILE"
            elif command -v google-chrome >/dev/null 2>&1; then
                google-chrome "$HTML_FILE"
            elif command -v chromium >/dev/null 2>&1; then
                chromium "$HTML_FILE"
            else
                echo "❌ No suitable browser found."
                echo "💡 Please open $HTML_FILE manually in your browser."
                exit 1
            fi
        }
        ;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*)
        # Windows (Git Bash, etc.)
        echo "🪟 Detected Windows - using 'start' command"
        start "$HTML_FILE"
        ;;
    *)
        echo "❓ Unknown OS. Trying generic approach..."
        if command -v python3 >/dev/null 2>&1; then
            echo "🐍 Using Python webbrowser module as fallback"
            python3 -c "import webbrowser; webbrowser.open('file://$(pwd)/$HTML_FILE')"
        else
            echo "❌ Cannot automatically open browser."
            echo "💡 Please open $HTML_FILE manually in your browser."
            exit 1
        fi
        ;;
esac

echo ""
echo "✅ Study guide should now be open in your browser!"
echo ""
echo "💡 Tips for best experience:"
echo "  • Wait for mathematical formulas to load completely"
echo "  • Use Ctrl/Cmd + Plus/Minus to adjust text size"
echo "  • To print to PDF: Ctrl/Cmd + P → Save as PDF"
echo "  • For advanced PDF conversion: python3 html_to_pdf_converter.py"
echo ""
echo "📚 Enjoy studying Infinitesimal Calculus 2!" 