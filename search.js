/**
 * Advanced Search Functionality for Mathematics Study Guide
 * Features: Real-time search, content highlighting, result navigation, mobile support
 * Language: Hebrew (RTL) with English mathematical notation
 */

class MathStudyGuideSearch {
    constructor() {
        this.searchData = [];
        this.currentResults = [];
        this.currentHighlights = [];
        this.currentHighlightIndex = -1;
        this.isSearchVisible = false;
        this.searchTimeout = null;
        
        this.init();
    }

    /**
     * Initialize search functionality
     */
    init() {
        this.createSearchInterface();
        this.indexContent();
        this.bindEvents();
        this.setupKeyboardShortcuts();
    }

    /**
     * Create search interface elements
     */
    createSearchInterface() {
        // Create search toggle button
        const searchToggleBtn = document.createElement('button');
        searchToggleBtn.className = 'search-toggle-btn';
        searchToggleBtn.innerHTML = '🔍';
        searchToggleBtn.setAttribute('aria-label', 'פתח חיפוש');
        searchToggleBtn.title = 'חיפוש באתר (Ctrl+/)';
        document.body.appendChild(searchToggleBtn);

        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.display = 'none'; // Hide by default
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="חפש נושאים, הגדרות, משפטים..." />
                <button class="search-btn" aria-label="חפש">🔍</button>
                <button class="clear-search" aria-label="נקה חיפוש">✕</button>
            </div>
            <div class="search-results">
                <div class="search-stats"></div>
                <div class="search-results-list"></div>
            </div>
        `;
        document.body.appendChild(searchContainer);

        // Create search navigation
        const searchNavigation = document.createElement('div');
        searchNavigation.className = 'search-navigation';
        searchNavigation.style.display = 'none'; // Hide by default
        searchNavigation.innerHTML = `
            <div class="search-counter"></div>
            <button class="search-nav-btn search-prev" aria-label="תוצאה קודמת">↑</button>
            <button class="search-nav-btn search-next" aria-label="תוצאה הבאה">↓</button>
        `;
        document.body.appendChild(searchNavigation);

        // Create search overlay for mobile
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';
        document.body.appendChild(searchOverlay);

        // Store references
        this.elements = {
            toggleBtn: searchToggleBtn,
            container: searchContainer,
            input: searchContainer.querySelector('.search-input'),
            searchBtn: searchContainer.querySelector('.search-btn'),
            clearBtn: searchContainer.querySelector('.clear-search'),
            results: searchContainer.querySelector('.search-results'),
            resultsList: searchContainer.querySelector('.search-results-list'),
            stats: searchContainer.querySelector('.search-stats'),
            navigation: searchNavigation,
            counter: searchNavigation.querySelector('.search-counter'),
            prevBtn: searchNavigation.querySelector('.search-prev'),
            nextBtn: searchNavigation.querySelector('.search-next'),
            overlay: searchOverlay
        };
    }

    /**
     * Index all searchable content
     */
    indexContent() {
        const topics = document.querySelectorAll('.topic');
        const definitions = document.querySelectorAll('.definition');
        const theorems = document.querySelectorAll('.theorem');
        const properties = document.querySelectorAll('.property');
        const notations = document.querySelectorAll('.notation');

        // Index topics
        topics.forEach((topic, index) => {
            const title = topic.querySelector('h3')?.textContent || `נושא ${index + 1}`;
            const content = this.extractTextContent(topic);
            
            this.searchData.push({
                type: 'topic',
                title: title,
                content: content,
                element: topic,
                id: topic.id || `topic-${index}`
            });
        });

        // Index definitions
        definitions.forEach((def, index) => {
            const content = this.extractTextContent(def);
            const title = this.extractTitle(content) || 'הגדרה';
            
            this.searchData.push({
                type: 'definition',
                title: title,
                content: content,
                element: def,
                id: `definition-${index}`
            });
        });

        // Index theorems
        theorems.forEach((theorem, index) => {
            const content = this.extractTextContent(theorem);
            const title = this.extractTitle(content) || 'משפט';
            
            this.searchData.push({
                type: 'theorem',
                title: title,
                content: content,
                element: theorem,
                id: `theorem-${index}`
            });
        });

        // Index properties
        properties.forEach((prop, index) => {
            const content = this.extractTextContent(prop);
            const title = this.extractTitle(content) || 'תכונה';
            
            this.searchData.push({
                type: 'property',
                title: title,
                content: content,
                element: prop,
                id: `property-${index}`
            });
        });

        // Index notations
        notations.forEach((notation, index) => {
            const content = this.extractTextContent(notation);
            const title = this.extractTitle(content) || 'סימון';
            
            this.searchData.push({
                type: 'notation',
                title: title,
                content: content,
                element: notation,
                id: `notation-${index}`
            });
        });

        console.log(`Search index created with ${this.searchData.length} items`);
    }

    /**
     * Extract clean text content from element
     */
    extractTextContent(element) {
        // Clone element to avoid modifying original
        const clone = element.cloneNode(true);
        
        // Remove script tags and their content
        const scripts = clone.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Get text content and clean it
        let text = clone.textContent || '';
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    /**
     * Extract title from content
     */
    extractTitle(content) {
        // Look for text after "הגדרה:", "משפט:", etc.
        const patterns = [
            /(?:הגדרה[:\s]+)([^:]+?)(?:\s|$)/,
            /(?:משפט[:\s]+)([^:]+?)(?:\s|$)/,
            /(?:תכונה[:\s]+)([^:]+?)(?:\s|$)/,
            /(?:סימון[:\s]+)([^:]+?)(?:\s|$)/
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                return match[1].trim().substring(0, 50);
            }
        }

        // Fallback: use first 50 characters
        return content.substring(0, 50).trim();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle search visibility
        this.elements.toggleBtn.addEventListener('click', () => {
            this.toggleSearch();
        });

        // Search input events
        this.elements.input.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.navigateToNextResult();
            } else if (e.key === 'Escape') {
                this.hideSearch();
            }
        });

        // Search and clear buttons
        this.elements.searchBtn.addEventListener('click', () => {
            this.handleSearch(this.elements.input.value);
        });

        this.elements.clearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // Navigation buttons
        this.elements.prevBtn.addEventListener('click', () => {
            this.navigateToPrevResult();
        });

        this.elements.nextBtn.addEventListener('click', () => {
            this.navigateToNextResult();
        });

        // Close search when clicking overlay
        this.elements.overlay.addEventListener('click', () => {
            this.hideSearch();
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.container.contains(e.target) && 
                !this.elements.toggleBtn.contains(e.target)) {
                this.hideSearch();
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+/ or Ctrl+F to open search
            if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === 'f')) {
                e.preventDefault();
                this.showSearch();
                this.elements.input.focus();
            }
            
            // F3 or Ctrl+G for next result
            if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key === 'g')) {
                e.preventDefault();
                if (e.shiftKey) {
                    this.navigateToPrevResult();
                } else {
                    this.navigateToNextResult();
                }
            }
        });
    }

    /**
     * Toggle search visibility
     */
    toggleSearch() {
        if (this.isSearchVisible) {
            this.hideSearch();
        } else {
            this.showSearch();
        }
    }

    /**
     * Show search interface
     */
    showSearch() {
        this.isSearchVisible = true;
        this.elements.container.style.display = 'block';
        this.elements.overlay.classList.add('show');
        
        // Expand container if on mobile
        if (window.innerWidth <= 768) {
            this.elements.container.classList.add('expanded');
        }
        
        // Show navigation if there are results
        if (this.currentHighlights.length > 0) {
            this.elements.navigation.style.display = 'block';
        }
        
        setTimeout(() => {
            this.elements.input.focus();
        }, 100);
    }

    /**
     * Hide search interface
     */
    hideSearch() {
        this.isSearchVisible = false;
        this.elements.container.style.display = 'none';
        this.elements.overlay.classList.remove('show');
        this.elements.container.classList.remove('expanded');
        this.clearHighlights();
        this.hideNavigation();
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Show/hide clear button
        if (query.trim()) {
            this.elements.clearBtn.classList.add('show');
        } else {
            this.elements.clearBtn.classList.remove('show');
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    /**
     * Perform actual search
     */
    performSearch(query) {
        if (!query.trim()) {
            this.currentResults = [];
            this.displayResults([]);
            this.clearHighlights();
            this.hideNavigation();
            return;
        }

        const searchTerms = query.trim().toLowerCase().split(/\s+/);
        const results = [];

        this.searchData.forEach((item) => {
            const searchableText = (item.title + ' ' + item.content).toLowerCase();
            let score = 0;
            let matchedTerms = 0;

            searchTerms.forEach((term) => {
                if (searchableText.includes(term)) {
                    matchedTerms++;
                    
                    // Higher score for title matches
                    if (item.title.toLowerCase().includes(term)) {
                        score += 10;
                    }
                    
                    // Regular content match
                    score += 1;
                    
                    // Exact phrase bonus
                    if (searchableText.includes(query.toLowerCase())) {
                        score += 5;
                    }
                }
            });

            // Only include if all terms are found
            if (matchedTerms === searchTerms.length) {
                results.push({
                    ...item,
                    score: score,
                    query: query
                });
            }
        });

        // Sort by score (highest first)
        results.sort((a, b) => b.score - a.score);

        this.currentResults = results;
        this.displayResults(results);
        this.highlightResults(query);
        this.updateNavigation();
    }

    /**
     * Display search results
     */
    displayResults(results) {
        this.elements.stats.textContent = results.length > 0 
            ? `נמצאו ${results.length} תוצאות`
            : 'לא נמצאו תוצאות';

        if (results.length === 0) {
            this.elements.resultsList.innerHTML = `
                <div class="no-results">
                    <span class="no-results-icon">🔍</span>
                    <div>לא נמצאו תוצאות מתאימות</div>
                    <div style="font-size: 0.8rem; margin-top: 10px;">נסו לחפש במילים אחרות או בחינות חלקיות</div>
                </div>
            `;
        } else {
            this.elements.resultsList.innerHTML = results.map((result, index) => `
                <div class="search-result-item" data-index="${index}">
                    <div class="search-result-type ${result.type}">${this.getTypeLabel(result.type)}</div>
                    <div class="search-result-title">${this.highlightText(result.title, result.query)}</div>
                    <div class="search-result-preview">${this.highlightText(this.truncateText(result.content, 100), result.query)}</div>
                </div>
            `).join('');

            // Add click handlers to results
            this.elements.resultsList.querySelectorAll('.search-result-item').forEach((item) => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.dataset.index);
                    this.navigateToResult(index);
                });
            });
        }

        this.elements.results.classList.add('show');
    }

    /**
     * Get type label in Hebrew
     */
    getTypeLabel(type) {
        const labels = {
            'topic': 'נושא',
            'definition': 'הגדרה',
            'theorem': 'משפט',
            'property': 'תכונה',
            'notation': 'סימון'
        };
        return labels[type] || type;
    }

    /**
     * Highlight search terms in text
     */
    highlightText(text, query) {
        if (!query) return text;
        
        const terms = query.toLowerCase().split(/\s+/);
        let highlightedText = text;
        
        terms.forEach((term) => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
        });
        
        return highlightedText;
    }

    /**
     * Escape special regex characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Highlight results in the main content
     */
    highlightResults(query) {
        this.clearHighlights();
        
        if (!query.trim()) return;
        
        const terms = query.toLowerCase().split(/\s+/);
        
        this.currentResults.forEach((result) => {
            const element = result.element;
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue.trim()) {
                    textNodes.push(node);
                }
            }
            
            textNodes.forEach((textNode) => {
                let content = textNode.nodeValue;
                let hasHighlight = false;
                
                terms.forEach((term) => {
                    const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
                    if (regex.test(content)) {
                        hasHighlight = true;
                        content = content.replace(regex, '<span class="search-highlight" data-search-highlight>$1</span>');
                    }
                });
                
                if (hasHighlight) {
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = content;
                    textNode.parentNode.replaceChild(wrapper, textNode);
                    
                    // Collect highlights for navigation
                    wrapper.querySelectorAll('[data-search-highlight]').forEach((highlight) => {
                        this.currentHighlights.push(highlight);
                    });
                }
            });
        });
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.currentHighlights = [];
        this.currentHighlightIndex = -1;
        
        document.querySelectorAll('[data-search-highlight]').forEach((highlight) => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    /**
     * Update navigation visibility and state
     */
    updateNavigation() {
        if (this.currentHighlights.length > 0) {
            this.elements.navigation.style.display = 'block';
            this.elements.navigation.classList.add('show');
            this.updateNavigationState();
        } else {
            this.hideNavigation();
        }
    }

    /**
     * Hide navigation
     */
    hideNavigation() {
        this.elements.navigation.style.display = 'none';
        this.elements.navigation.classList.remove('show');
    }

    /**
     * Update navigation buttons and counter
     */
    updateNavigationState() {
        const total = this.currentHighlights.length;
        const current = this.currentHighlightIndex + 1;
        
        this.elements.counter.textContent = total > 0 ? `${current}/${total}` : '0/0';
        
        this.elements.prevBtn.disabled = this.currentHighlightIndex <= 0;
        this.elements.nextBtn.disabled = this.currentHighlightIndex >= total - 1;
        
        // Update current highlight
        this.currentHighlights.forEach((highlight, index) => {
            if (index === this.currentHighlightIndex) {
                highlight.classList.add('current');
            } else {
                highlight.classList.remove('current');
            }
        });
    }

    /**
     * Navigate to next search result
     */
    navigateToNextResult() {
        if (this.currentHighlights.length === 0) return;
        
        this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.currentHighlights.length;
        this.scrollToCurrentHighlight();
        this.updateNavigationState();
    }

    /**
     * Navigate to previous search result
     */
    navigateToPrevResult() {
        if (this.currentHighlights.length === 0) return;
        
        this.currentHighlightIndex = this.currentHighlightIndex <= 0 
            ? this.currentHighlights.length - 1 
            : this.currentHighlightIndex - 1;
        this.scrollToCurrentHighlight();
        this.updateNavigationState();
    }

    /**
     * Navigate to specific result by index
     */
    navigateToResult(index) {
        if (index < 0 || index >= this.currentResults.length) return;
        
        const result = this.currentResults[index];
        this.scrollToElement(result.element);
        this.hideSearch();
    }

    /**
     * Scroll to current highlight
     */
    scrollToCurrentHighlight() {
        if (this.currentHighlightIndex >= 0 && this.currentHighlights[this.currentHighlightIndex]) {
            this.scrollToElement(this.currentHighlights[this.currentHighlightIndex]);
        }
    }

    /**
     * Scroll element into view with smooth animation
     */
    scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        
        // Flash effect
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 1000);
    }

    /**
     * Clear search
     */
    clearSearch() {
        this.elements.input.value = '';
        this.elements.clearBtn.classList.remove('show');
        this.elements.results.classList.remove('show');
        this.currentResults = [];
        this.clearHighlights();
        this.hideNavigation();
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MathStudyGuideSearch();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathStudyGuideSearch;
} 