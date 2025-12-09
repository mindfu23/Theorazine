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

    // Perplexity API integration - always attach the listener
    if (domElements.perplexityBtn) {
        console.log('Attaching click listener to perplexityBtn');
        domElements.perplexityBtn.addEventListener('click', handlePerplexityQuery);
    } else {
        console.warn('perplexityBtn not found in DOM');
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
 * Update the credibility status banner
 */
function updateCredibilityStatus(status, description) {
    if (domElements.credibilityLevel) {
        domElements.credibilityLevel.textContent = status;
    }
    if (domElements.credibilityDescription) {
        domElements.credibilityDescription.textContent = description;
    }
}

/**
 * Determine credibility based on conspiracy probability
 */
function getCredibilityFromProbability(probability) {
    if (probability < 10) {
        return { status: 'Unlikely', description: 'Mathematical analysis suggests this conspiracy is highly improbable' };
    } else if (probability < 30) {
        return { status: 'Possible', description: 'Some plausibility based on mathematical factors' };
    } else {
        return { status: 'Possible', description: 'Mathematical factors suggest this could be feasible' };
    }
}

/**
 * Handle Perplexity API query with proper error handling
 */
async function handlePerplexityQuery() {
    console.log('handlePerplexityQuery called');
    
    const name = domElements.conspiracyName?.value?.trim();
    const desc = domElements.conspiracyDescription?.value?.trim();
    
    console.log('Name:', name, 'Description:', desc);
    
    if (!name || !desc) {
        showErrorMessage('Please enter both a name and description.', domElements.perplexityResults);
        return;
    }
    
    if (!domElements.perplexityResults) {
        console.error('perplexityResults element not found');
        return;
    }
    
    console.log('Updating status to Assessing');
    // Update status: Assessing
    updateCredibilityStatus('Assessing', 'Analyzing conspiracy theory details...');
    
    domElements.perplexityBtn.disabled = true;
    domElements.perplexityResults.innerHTML = '<div class="loading">🧠 Analyzing with Perplexity AI Sonar Reasoning...</div>';
    
    try {
        console.log('Updating status to Awaiting response');
        // Update status: Awaiting response
        updateCredibilityStatus('Awaiting response', 'Contacting Perplexity AI for analysis...');
        
        console.log('Checking if queryPerplexity exists:', typeof window.queryPerplexity);
        if (!window.queryPerplexity) {
            throw new Error('Perplexity API function not loaded');
        }
        
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
        
        // Extract scale estimates from AI response and update inputs
        extractAndApplyScaleEstimates(answer);
        
        // Analyze response to determine credibility
        const credibility = analyzePerplexityResponse(answer);
        updateCredibilityStatus(credibility.status, credibility.description);
        
    } catch (error) {
        console.error('Perplexity API error:', error);
        showErrorMessage(`Error: ${error.message}`, domElements.perplexityResults);
        updateCredibilityStatus('Error', 'Unable to complete analysis. Please try again.');
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
 * Extract scale estimates from Perplexity response and update inputs
 */
function extractAndApplyScaleEstimates(text) {
    const lowerText = text.toLowerCase();
    
    // Extract number of conspirators
    let conspirators = null;
    
    // Look for explicit numbers first
    const conspiratorPatterns = [
        /(\d{1,3}(?:,\d{3})*)\s*(?:people|conspirators|individuals|employees|workers)/i,
        /(?:tens of thousands|10,?000s?)\s*(?:of\s+)?(?:people|conspirators)/i,
        /(?:hundreds of thousands|100,?000s?)\s*(?:of\s+)?(?:people|conspirators)/i,
        /(?:thousands|1,?000s?)\s*(?:of\s+)?(?:people|conspirators)/i,
        /(?:hundreds|100s?)\s*(?:of\s+)?(?:people|conspirators)/i,
        /(?:millions)\s*(?:of\s+)?(?:people|conspirators)/i,
    ];
    
    for (const pattern of conspiratorPatterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[1]) {
                // Direct number found
                conspirators = parseInt(match[1].replace(/,/g, ''));
            } else if (match[0].includes('millions')) {
                conspirators = 1000000;
            } else if (match[0].includes('hundreds of thousands')) {
                conspirators = 100000;
            } else if (match[0].includes('tens of thousands')) {
                conspirators = 50000;
            } else if (match[0].includes('thousands')) {
                conspirators = 5000;
            } else if (match[0].includes('hundreds')) {
                conspirators = 500;
            }
            break;
        }
    }
    
    // Extract years/duration
    let years = null;
    
    const yearPatterns = [
        /(?:over|nearly|about|approximately|for)\s+(\d+)\s+years/i,
        /(\d+)\s+years?\s+(?:ago|old|active|duration)/i,
        /since\s+(?:at least\s+)?(\d{4})/i,
        /(?:from|since)\s+(\d{4})\s+to\s+(?:present|today|\d{4})/i,
        /(?:nearly\s+)?(?:a\s+)?century/i,
        /(?:several|multiple)\s+decades/i,
    ];
    
    for (const pattern of yearPatterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[1]) {
                const num = parseInt(match[1]);
                if (num > 1900 && num < 2100) {
                    // It's a year, calculate duration
                    years = new Date().getFullYear() - num;
                } else {
                    years = num;
                }
            } else if (match[0].includes('century')) {
                years = 85;
            } else if (match[0].includes('decades')) {
                years = 40;
            }
            break;
        }
    }
    
    // Extract population affected
    let populationAffected = null;
    
    const populationPatterns = [
        /(?:billions?\s+of\s+)?(?:people|population)/i,
        /(?:millions?\s+of\s+)?(?:people|affected)/i,
        /(?:global|worldwide|entire\s+world)/i,
        /(\d{1,3}(?:,\d{3})*)\s*(?:people|affected|population)/i,
    ];
    
    if (lowerText.includes('billions') || lowerText.includes('global') || 
        lowerText.includes('worldwide') || lowerText.includes('entire world')) {
        populationAffected = 8000000000;
    } else if (lowerText.includes('millions')) {
        populationAffected = 10000000;
    }
    
    // Extract profession type based on content
    let professionType = 'general';
    
    if (lowerText.includes('scientist') || lowerText.includes('researcher') || lowerText.includes('academic')) {
        professionType = 'scientists';
    } else if (lowerText.includes('intelligence') || lowerText.includes('cia') || lowerText.includes('fbi') || lowerText.includes('spy')) {
        professionType = 'intelligence';
    } else if (lowerText.includes('government') || lowerText.includes('bureaucrat') || lowerText.includes('official')) {
        professionType = 'government';
    } else if (lowerText.includes('military') || lowerText.includes('army') || lowerText.includes('navy') || lowerText.includes('air force')) {
        professionType = 'military';
    } else if (lowerText.includes('corporate') || lowerText.includes('company') || lowerText.includes('business') || lowerText.includes('employee')) {
        professionType = 'corporate';
    }
    
    console.log('Extracted scale estimates:', { conspirators, years, populationAffected, professionType });
    
    // Apply extracted values to inputs
    if (conspirators !== null && domElements.conspirators) {
        domElements.conspirators.value = conspirators;
        if (domElements.conspiratorsSlider) {
            domElements.conspiratorsSlider.value = Math.min(conspirators, parseInt(domElements.conspiratorsSlider.max) || 10000);
        }
    }
    
    if (years !== null && domElements.yearsActive) {
        domElements.yearsActive.value = years;
        if (domElements.yearsActiveSlider) {
            domElements.yearsActiveSlider.value = Math.min(years, parseInt(domElements.yearsActiveSlider.max) || 100);
        }
    }
    
    if (populationAffected !== null && domElements.populationAffected) {
        domElements.populationAffected.value = populationAffected;
    }
    
    if (professionType && domElements.professionType) {
        domElements.professionType.value = professionType;
    }
    
    // Trigger recalculation with new values
    updateCalculations();
    
    return { conspirators, years, populationAffected, professionType };
}

/**
 * Analyze Perplexity response to determine credibility
 */
function analyzePerplexityResponse(text) {
    const lowerText = text.toLowerCase();
    
    // Look for key phrases that indicate likelihood
    const unlikelyIndicators = [
        'highly unlikely', 'extremely unlikely', 'virtually impossible', 'no credible evidence',
        'lacks evidence', 'debunked', 'conspiracy theory', 'unfounded', 'implausible'
    ];
    
    const possibleIndicators = [
        'possible', 'plausible', 'could be', 'might be', 'some evidence', 'partially supported',
        'elements of truth', 'mixed evidence', 'uncertain'
    ];
    
    const unlikelyCount = unlikelyIndicators.filter(phrase => lowerText.includes(phrase)).length;
    const possibleCount = possibleIndicators.filter(phrase => lowerText.includes(phrase)).length;
    
    if (unlikelyCount > possibleCount) {
        return {
            status: 'Unlikely',
            description: 'AI analysis suggests this theory lacks credible support'
        };
    } else if (possibleCount > 0) {
        return {
            status: 'Possible',
            description: 'AI analysis finds some elements that warrant consideration'
        };
    } else {
        return {
            status: 'Uncertain',
            description: 'AI analysis is inconclusive - more data needed'
        };
    }
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

        // Update credibility banner - only if not in Perplexity analysis mode
        if (domElements.credibilityBanner && credibility) {
            domElements.credibilityBanner.className = `credibility-banner ${credibility.color}`;
            
            // Only update if not currently showing Perplexity status
            const currentStatus = domElements.credibilityLevel?.textContent;
            if (currentStatus && !['Assessing', 'Awaiting response'].includes(currentStatus)) {
                const mathCredibility = getCredibilityFromProbability(survivalProb * 100);
                updateCredibilityStatus(mathCredibility.status, mathCredibility.description);
            }
        }

        // Update charts if functions exist
        if (typeof updateTimeDecayChart === 'function') {
            updateTimeDecayChart(conspirators, professionType, years);
        }
        if (typeof updateComparisonChart === 'function') {
            updateComparisonChart(conspirators, professionType);
        }
        if (typeof updateProbabilityGauge === 'function') {
            updateProbabilityGauge(survivalProb);
        }
    } catch (error) {
        console.error('Error updating calculations:', error);
        showErrorMessage('Error updating calculations. Please check your inputs.');
    } finally {
        isCalculating = false;
    }
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

// Initialize charts on load
initializeCharts();

