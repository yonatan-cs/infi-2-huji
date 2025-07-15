#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick launcher for the Hebrew Mathematical Study Guide
Opens the HTML file in the default web browser.
"""

import os
import sys
import webbrowser
from pathlib import Path

def main():
    """Open the study guide in the default browser."""
    html_file = "math_study_guide.html"
    
    # Check if the HTML file exists
    if not os.path.exists(html_file):
        print(f"❌ Error: {html_file} not found!")
        print("Please make sure you're in the correct directory.")
        print("The following files should be present:")
        print("  - math_study_guide.html")
        print("  - style.css")
        return 1
    
    try:
        # Get absolute path and create file URL
        abs_path = os.path.abspath(html_file)
        file_url = f"file://{abs_path}"
        
        print("🚀 Opening Hebrew Mathematical Study Guide...")
        print(f"📁 File: {abs_path}")
        
        # Open in default browser
        webbrowser.open(file_url)
        
        print("✅ Study guide opened in your default browser!")
        print("\n💡 Tips for best experience:")
        print("  • Wait for mathematical formulas to load completely")
        print("  • Use Ctrl/Cmd + Plus/Minus to adjust text size")
        print("  • To print to PDF: Ctrl/Cmd + P → Save as PDF")
        print("  • For better PDF conversion, run: python3 html_to_pdf_converter.py")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error opening browser: {e}")
        print(f"💡 Manual option: Open {html_file} directly in your browser")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 