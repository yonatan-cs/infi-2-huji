#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML to PDF Converter for Hebrew Mathematical Text
This script converts the HTML study guide to PDF format while preserving Hebrew RTL text and mathematical formulas.
"""

import os
import sys
import subprocess
import webbrowser
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    dependencies = {
        'wkhtmltopdf': 'wkhtmltopdf --version',
        'weasyprint': 'python3 -c "import weasyprint"'
    }
    
    available = {}
    
    # Check wkhtmltopdf
    try:
        result = subprocess.run(['wkhtmltopdf', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            available['wkhtmltopdf'] = True
            print("✓ wkhtmltopdf is available")
        else:
            available['wkhtmltopdf'] = False
    except FileNotFoundError:
        available['wkhtmltopdf'] = False
        print("✗ wkhtmltopdf not found")
    
    # Check weasyprint
    try:
        import weasyprint
        available['weasyprint'] = True
        print("✓ WeasyPrint is available")
    except ImportError:
        available['weasyprint'] = False
        print("✗ WeasyPrint not found")
    
    return available

def install_dependencies():
    """Provide instructions for installing dependencies."""
    print("\n=== Installation Instructions ===")
    print("To convert HTML to PDF, you need one of these tools:")
    print("\n1. wkhtmltopdf (Recommended for better MathJax support):")
    print("   macOS: brew install wkhtmltopdf")
    print("   Ubuntu/Debian: sudo apt-get install wkhtmltopdf")
    print("   Windows: Download from https://wkhtmltopdf.org/downloads.html")
    
    print("\n2. WeasyPrint (Python-based):")
    print("   pip3 install weasyprint")
    print("   Note: May require additional system dependencies")

def convert_to_pdf_wkhtmltopdf(html_file, output_file):
    """Convert HTML to PDF using wkhtmltopdf."""
    try:
        cmd = [
            'wkhtmltopdf',
            '--page-size', 'A4',
            '--margin-top', '0.75in',
            '--margin-right', '0.75in',
            '--margin-bottom', '0.75in',
            '--margin-left', '0.75in',
            '--encoding', 'UTF-8',
            '--enable-javascript',
            '--javascript-delay', '5000',  # Wait for MathJax to render
            '--no-stop-slow-scripts',
            html_file,
            output_file
        ]
        
        print(f"Converting {html_file} to PDF...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ Successfully created {output_file}")
            return True
        else:
            print(f"✗ Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error during conversion: {e}")
        return False

def convert_to_pdf_weasyprint(html_file, output_file):
    """Convert HTML to PDF using WeasyPrint."""
    try:
        import weasyprint
        
        print(f"Converting {html_file} to PDF using WeasyPrint...")
        
        # Note: WeasyPrint doesn't support JavaScript, so MathJax won't work
        print("⚠️  Warning: WeasyPrint doesn't support JavaScript/MathJax.")
        print("   Mathematical formulas may not render properly.")
        
        html_doc = weasyprint.HTML(filename=html_file)
        html_doc.write_pdf(output_file)
        
        print(f"✓ Successfully created {output_file}")
        return True
    except Exception as e:
        print(f"✗ Error during conversion: {e}")
        return False

def open_in_browser(html_file):
    """Open the HTML file in the default web browser."""
    try:
        file_url = f"file://{os.path.abspath(html_file)}"
        webbrowser.open(file_url)
        print(f"✓ Opened {html_file} in browser")
        print("💡 You can print to PDF from your browser (Ctrl+P / Cmd+P)")
        return True
    except Exception as e:
        print(f"✗ Error opening browser: {e}")
        return False

def create_latex_version():
    """Create a LaTeX version of the mathematical content."""
    latex_content = r"""
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[hebrew]{babel}
\usepackage{amsmath,amsfonts,amssymb}
\usepackage{geometry}
\usepackage{fancyhdr}
\usepackage{xcolor}
\usepackage{tcolorbox}

\geometry{margin=2cm}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[C]{למידת אינפי 2: מדריך לימוד מקיף}
\fancyfoot[C]{\thepage}

% Define colored boxes for different content types
\newtcolorbox{definition}{colback=cyan!5!white,colframe=cyan!75!black}
\newtcolorbox{theorem}{colback=red!5!white,colframe=red!75!black}
\newtcolorbox{property}{colback=purple!5!white,colframe=purple!75!black}

\begin{document}

\title{למידת אינפי 2: מדריך לימוד מקיף}
\author{מדריך מתמטי מעוצב}
\date{}
\maketitle

\section{מבוא}
מדריך לימוד זה נועד לסייע לך בחזרה על החומר בקורס אינפי 2.

% Add more content here...
% This is a basic template that can be expanded

\end{document}
"""
    
    with open('math_guide.tex', 'w', encoding='utf-8') as f:
        f.write(latex_content)
    
    print("✓ Created basic LaTeX template: math_guide.tex")
    print("💡 You can compile this with: pdflatex math_guide.tex")

def main():
    """Main function to handle HTML to PDF conversion."""
    print("=== Hebrew Mathematical Text Converter ===")
    print("This tool helps convert your HTML study guide to PDF format.")
    
    # Check if HTML file exists
    html_file = "math_study_guide.html"
    if not os.path.exists(html_file):
        print(f"✗ Error: {html_file} not found!")
        print("Please make sure the HTML file is in the current directory.")
        return
    
    # Check dependencies
    deps = check_dependencies()
    
    if not any(deps.values()):
        print("\n✗ No PDF conversion tools available.")
        install_dependencies()
        print(f"\n💡 Alternative: Open {html_file} in your browser and print to PDF.")
        
        # Open in browser as fallback
        choice = input("\nWould you like to open the HTML file in your browser? (y/n): ")
        if choice.lower() in ['y', 'yes']:
            open_in_browser(html_file)
        return
    
    # Choose conversion method
    print("\nAvailable conversion options:")
    options = []
    
    if deps.get('wkhtmltopdf'):
        options.append(('wkhtmltopdf', 'Convert using wkhtmltopdf (recommended)'))
    
    if deps.get('weasyprint'):
        options.append(('weasyprint', 'Convert using WeasyPrint'))
    
    options.append(('browser', 'Open in browser (manual PDF printing)'))
    options.append(('latex', 'Create LaTeX template'))
    
    for i, (method, description) in enumerate(options, 1):
        print(f"{i}. {description}")
    
    try:
        choice = int(input(f"\nChoose an option (1-{len(options)}): "))
        if 1 <= choice <= len(options):
            method, _ = options[choice - 1]
            
            output_file = "math_study_guide.pdf"
            
            if method == 'wkhtmltopdf':
                convert_to_pdf_wkhtmltopdf(html_file, output_file)
            elif method == 'weasyprint':
                convert_to_pdf_weasyprint(html_file, output_file)
            elif method == 'browser':
                open_in_browser(html_file)
            elif method == 'latex':
                create_latex_version()
        else:
            print("Invalid choice!")
    
    except ValueError:
        print("Invalid input! Please enter a number.")
    except KeyboardInterrupt:
        print("\nOperation cancelled.")

if __name__ == "__main__":
    main() 