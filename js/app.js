/**
 * Main application logic
 * Handles user interactions and updates the UI
 */

// Cache DOM elements for better performance
let domElements = {};
let isCalculating = false;
let debounceTimer = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeDOMElements();
        initializeEventListeners();
        // Load initial calculations
        updateCalculations();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showErrorMessage('Application failed to load properly. Please refresh the page.');
    }
});

/**
 * Cache all DOM elements to avoid repeated queries
 */
function initializeDOMElements() {
    const elementIds = [
        'perplexityBtn', 'conspiracyName', 'conspiracyDescription', 'perplexityResults',
        'conspirators', 'conspiratorsSlider', 'professionType', 'yearsActive',
        'yearsActiveSlider', 'populationAffected', 'survivalProbability',
        'exposureProbability', 'expectedTime', 'survivalDescription',
        'credibilityBanner', 'credibilityLevel', 'credibilityDescription', 'survivalCard'
    ];
    
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            domElements[id] = element;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    });
    
    domElements.presetButtons = document.querySelectorAll('.preset-btn');
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {

    // Perplexity API integration
    if (domElements.perplexityBtn && window.queryPerplexity) {
        domElements.perplexityBtn.addEventListener('click', handlePerplexityQuery);
    }
    // Sync inputs with sliders and add debounced updates
    if (domElements.conspirators && domElements.conspiratorsSlider) {
        syncInputWithSlider(domElements.conspirators, domElements.conspiratorsSlider);
    }
    if (domElements.yearsActive && domElements.yearsActiveSlider) {
        syncInputWithSlider(domElements.yearsActive, domElements.yearsActiveSlider);
    }
    
    // Add event listeners for all inputs
    if (domElements.professionType) {
        domElements.professionType.addEventListener('change', debouncedUpdate);
    }
    if (domElements.populationAffected) {
        domElements.populationAffected.addEventListener('input', debouncedUpdate);
    }

    // Handle preset button clicks
    domElements.presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const presetId = this.getAttribute('data-preset');
            loadPreset(presetId);
        });
    });
}

/**
 * Debounced update function to prevent excessive calculations
 */
function debouncedUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        updateCalculations();
    }, 100);
}

/**
 * Sync number inputs with sliders with validation
 */
function syncInputWithSlider(input, slider) {
    input.addEventListener('input', function() {
        const value = Math.min(Math.max(parseInt(this.value) || 0, 0), parseInt(slider.max));
        slider.value = value;
        this.value = value; // Ensure input shows validated value
        debouncedUpdate();
    });

    slider.addEventListener('input', function() {
        input.value = this.value;
        debouncedUpdate();
    });
}

/**
 * Handle Perplexity API query with proper error handling
 */
async function handlePerplexityQuery() {
    const name = domElements.conspiracyName?.value?.trim();
    const desc = domElements.conspiracyDescription?.value?.trim();
    
    if (!name || !desc) {
        showErrorMessage('Please enter both a name and description.', domElements.perplexityResults);
        return;
    }
    
    if (!domElements.perplexityResults) return;
    
    domElements.perplexityBtn.disabled = true;
    domElements.perplexityResults.innerHTML = '<div class="loading">🧠 Analyzing with Perplexity AI Sonar Reasoning...</div>';
    
    try {
        const result = await window.queryPerplexity(name, desc);
        const answer = result.choices?.[0]?.message?.content || 'No analysis received.';
        
        // Sanitize and format the response
        const sanitizedAnswer = sanitizeHTML(answer);
        const footnotes = extractFootnotes(answer);
        
        // Parse the structured response and format it nicely
        const formattedAnswer = formatPerplexityResponse(sanitizedAnswer);
        
        domElements.perplexityResults.innerHTML = `
            <div class="perplexity-result">
                <div class="result-header">
                    <h4>🧠 AI Analysis Results</h4>
                    <span class="model-tag">Powered by Perplexity Sonar Reasoning</span>
                </div>
                <div class="answer-content">${formattedAnswer}</div>
                ${footnotes ? `<div class="sources"><strong>🔗 Sources:</strong><br>${footnotes}</div>` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Perplexity API error:', error);
        showErrorMessage(`Error: ${error.message}`, domElements.perplexityResults);
    } finally {
        domElements.perplexityBtn.disabled = false;
    }
}

/**
 * Show error messages in a consistent format
 */
function showErrorMessage(message, container = null) {
    const errorHTML = `<div class="error-message">${message}</div>`;
    if (container) {
        container.innerHTML = errorHTML;
    } else {
        console.error(message);
    }
}

/**
 * Basic HTML sanitization
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Format Perplexity response with better structure
 */
function formatPerplexityResponse(text) {
    // Replace numbered sections with styled headers
    let formatted = text
        .replace(/(\d+\.\s*[A-Z\s]+:)/g, '<h5>$1</h5>')
        .replace(/([A-Z\s]+:)\s*$/gm, '<h5>$1</h5>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (formatted && !formatted.startsWith('<')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    // Fix any broken paragraph tags
    formatted = formatted.replace(/<p><h5>/g, '<h5>').replace(/<\/h5><\/p>/g, '</h5>');
    
    return formatted;
}

/**
 * Extract and format footnotes from text
 */
function extractFootnotes(text) {
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const urls = text.match(urlRegex) || [];
    return urls.map(url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`).join('<br>');
}

    /**
     * Load a preset conspiracy theory
     */
    function loadPreset(presetId) {
        try {
            const preset = getPreset(presetId);
            if (!preset) {
                console.error('Preset not found:', presetId);
                return;
            }

            // Update inputs safely
            if (domElements.conspirators) {
                domElements.conspirators.value = preset.conspirators;
            }
            if (domElements.conspiratorsSlider) {
                domElements.conspiratorsSlider.value = Math.min(preset.conspirators, parseInt(domElements.conspiratorsSlider.max));
            }
            if (domElements.professionType) {
                domElements.professionType.value = preset.professionType;
            }
            if (domElements.yearsActive) {
                domElements.yearsActive.value = preset.yearsActive;
            }
            if (domElements.yearsActiveSlider) {
                domElements.yearsActiveSlider.value = Math.min(preset.yearsActive, parseInt(domElements.yearsActiveSlider.max));
            }
            if (domElements.populationAffected) {
                domElements.populationAffected.value = preset.populationAffected;
            }

            // Highlight active button
            domElements.presetButtons.forEach(btn => btn.classList.remove('active'));
            const activeButton = document.querySelector(`[data-preset="${presetId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }

            // Update calculations
            updateCalculations();

            // Show preset information
            showPresetInfo(preset);
        } catch (error) {
            console.error('Error loading preset:', error);
            showErrorMessage('Failed to load preset. Please try again.');
        }
    }

    /**
     * Show information about the loaded preset
     */
    function showPresetInfo(preset) {
        if (!domElements.survivalCard) return;
        
        try {
            const existingInfo = domElements.survivalCard.querySelector('.preset-info');
            if (existingInfo) {
                existingInfo.remove();
            }

            const infoDiv = document.createElement('div');
            infoDiv.className = 'preset-info';
            infoDiv.innerHTML = `
                <h4>${sanitizeHTML(preset.name)}</h4>
                <p>${sanitizeHTML(preset.description)}</p>
                <p class="preset-explanation">${sanitizeHTML(preset.explanation)}</p>
            `;
            
            domElements.survivalCard.insertBefore(infoDiv, domElements.survivalCard.firstChild);
        } catch (error) {
            console.error('Error showing preset info:', error);
        }
    }

    /**
     * Update all calculations and visualizations
     */
    function updateCalculations() {
        if (isCalculating) return; // Prevent concurrent calculations
        
        try {
            isCalculating = true;
            
            const conspirators = parseInt(domElements.conspirators?.value) || 0;
            const professionType = domElements.professionType?.value || 'general';
            const years = parseInt(domElements.yearsActive?.value) || 0;
            const populationAffected = parseInt(domElements.populationAffected?.value) || 0;

            // Validate inputs
            if (conspirators < 1 || years < 0) {
                console.warn('Invalid input values');
                return;
            }

            // Calculate probabilities with error handling
            const survivalProb = calculateSurvivalProbability(conspirators, years, professionType);
            const exposureProb = calculateExposureProbability(conspirators, years, professionType);
            const expectedTime = calculateExpectedTimeUntilExposure(conspirators, professionType);
            const credibility = getCredibilityLevel(survivalProb);

            // Update result displays safely
            if (domElements.survivalProbability) {
                domElements.survivalProbability.textContent = formatProbability(survivalProb);
            }
            if (domElements.exposureProbability) {
                domElements.exposureProbability.textContent = formatProbability(exposureProb);
            }
            if (domElements.expectedTime) {
                domElements.expectedTime.textContent = formatTimeDuration(expectedTime);
            }

            // Update survival description
            if (domElements.survivalDescription) {
                domElements.survivalDescription.textContent = 
                    `With ${conspirators.toLocaleString()} ${getProfessionName(professionType)} keeping this secret for ${years} years`;
            }

            // Update credibility banner
            if (domElements.credibilityBanner && credibility) {
                domElements.credibilityBanner.className = `credibility-banner ${credibility.color}`;
                if (domElements.credibilityLevel) {
                    domElements.credibilityLevel.textContent = credibility.level;
                }
                if (domElements.credibilityDescription) {
                    domElements.credibilityDescription.textContent = credibility.description;
                }
            }

            // Update charts if functions exist
            if (typeof updateTimeDecayChart === 'function') {
                updateTimeDecayChart(conspirators, professionType, years);
            }
            if (typeof updateComparisonChart === 'function') {
                updateComparisonChart(conspirators, professionType);
            }
        } catch (error) {
            console.error('Error updating calculations:', error);
            showErrorMessage('Error updating calculations. Please check your inputs.');
        } finally {
            isCalculating = false;
        }
    }

        // Update result card colors
        updateResultCardColors(survivalProb);

        // Update all visualizations
        updateAllVisualizations(conspirators, professionType, years);
    }

    /**
     * Update result card colors based on probability
     */
    function updateResultCardColors(probability) {
        const survivalCard = document.getElementById('survivalCard');
        const exposureCard = document.getElementById('exposureCard');
        const expectedTimeCard = document.getElementById('expectedTimeCard');

        const credibility = getCredibilityLevel(probability);
        
        survivalCard.className = `result-card ${credibility.color}`;
        exposureCard.className = `result-card ${credibility.color === 'green' ? 'red' : credibility.color === 'red' ? 'green' : 'yellow'}`;
        expectedTimeCard.className = `result-card ${credibility.color}`;
    }

    /**
     * Get human-readable profession name
     */
    function getProfessionName(professionType) {
        const names = {
            'scientists': 'scientists/researchers',
            'intelligence': 'intelligence workers',
            'government': 'government bureaucrats',
            'military': 'military personnel',
            'corporate': 'corporate employees',
            'general': 'members of the general public'
        };
        return names[professionType] || 'conspirators';
    }

    // Initialize charts
    initializeCharts();

    // Initial calculation
    updateCalculations();

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add keyboard navigation for sliders
    [conspiratorsSlider, yearsActiveSlider].forEach(slider => {
        slider.addEventListener('keydown', function(e) {
            const step = e.shiftKey ? 10 : 1;
            let value = parseInt(this.value);
            
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                value = Math.min(value + step, parseInt(this.max));
                this.value = value;
                e.preventDefault();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                value = Math.max(value - step, parseInt(this.min));
                this.value = value;
                e.preventDefault();
            }
            
            if (this === conspiratorsSlider) {
                conspiratorsInput.value = value;
            } else if (this === yearsActiveSlider) {
                yearsActiveInput.value = value;
            }
            
            updateCalculations();
        });
    });

    // Make tooltips work on touch devices
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
    });

    // Close tooltips when clicking outside
    document.addEventListener('click', function() {
        tooltips.forEach(tooltip => tooltip.classList.remove('active'));
    });
});
