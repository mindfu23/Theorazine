/**
 * Main application logic
 * Handles user interactions and updates the UI
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get input elements
    const conspiratorsInput = document.getElementById('conspirators');
    const conspiratorsSlider = document.getElementById('conspiratorsSlider');
    const professionTypeSelect = document.getElementById('professionType');
    const yearsActiveInput = document.getElementById('yearsActive');
    const yearsActiveSlider = document.getElementById('yearsActiveSlider');
    const populationAffectedInput = document.getElementById('populationAffected');

    // Get preset buttons
    const presetButtons = document.querySelectorAll('.preset-btn');

    // Sync number inputs with sliders
    function syncInputWithSlider(input, slider) {
        input.addEventListener('input', function() {
            const value = Math.min(parseInt(this.value) || 0, parseInt(slider.max));
            slider.value = value;
            updateCalculations();
        });

        slider.addEventListener('input', function() {
            input.value = this.value;
            updateCalculations();
        });
    }

    syncInputWithSlider(conspiratorsInput, conspiratorsSlider);
    syncInputWithSlider(yearsActiveInput, yearsActiveSlider);

    // Add event listeners for all inputs
    professionTypeSelect.addEventListener('change', updateCalculations);
    populationAffectedInput.addEventListener('input', updateCalculations);

    // Handle preset button clicks
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const presetId = this.getAttribute('data-preset');
            loadPreset(presetId);
        });
    });

    /**
     * Load a preset conspiracy theory
     */
    function loadPreset(presetId) {
        const preset = getPreset(presetId);
        if (!preset) return;

        // Update inputs
        conspiratorsInput.value = preset.conspirators;
        conspiratorsSlider.value = Math.min(preset.conspirators, parseInt(conspiratorsSlider.max));
        professionTypeSelect.value = preset.professionType;
        yearsActiveInput.value = preset.yearsActive;
        yearsActiveSlider.value = Math.min(preset.yearsActive, parseInt(yearsActiveSlider.max));
        populationAffectedInput.value = preset.populationAffected;

        // Highlight active button
        presetButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-preset="${presetId}"]`).classList.add('active');

        // Update calculations
        updateCalculations();

        // Show preset information
        showPresetInfo(preset);
    }

    /**
     * Show information about the loaded preset
     */
    function showPresetInfo(preset) {
        const survivalCard = document.getElementById('survivalCard');
        const existingInfo = survivalCard.querySelector('.preset-info');
        
        if (existingInfo) {
            existingInfo.remove();
        }

        const infoDiv = document.createElement('div');
        infoDiv.className = 'preset-info';
        infoDiv.innerHTML = `
            <h4>${preset.name}</h4>
            <p>${preset.description}</p>
            <p class="preset-explanation">${preset.explanation}</p>
        `;
        
        survivalCard.insertBefore(infoDiv, survivalCard.firstChild);
    }

    /**
     * Update all calculations and visualizations
     */
    function updateCalculations() {
        const conspirators = parseInt(conspiratorsInput.value) || 0;
        const professionType = professionTypeSelect.value;
        const years = parseInt(yearsActiveInput.value) || 0;
        const populationAffected = parseInt(populationAffectedInput.value) || 0;

        // Calculate probabilities
        const survivalProb = calculateSurvivalProbability(conspirators, years, professionType);
        const exposureProb = calculateExposureProbability(conspirators, years, professionType);
        const expectedTime = calculateExpectedTimeUntilExposure(conspirators, professionType);
        const credibility = getCredibilityLevel(survivalProb);

        // Update result displays
        document.getElementById('survivalProbability').textContent = formatProbability(survivalProb);
        document.getElementById('exposureProbability').textContent = formatProbability(exposureProb);
        document.getElementById('expectedTime').textContent = formatTimeDuration(expectedTime);

        // Update survival description
        document.getElementById('survivalDescription').textContent = 
            `With ${conspirators.toLocaleString()} ${getProfessionName(professionType)} keeping this secret for ${years} years`;

        // Update credibility banner
        const credibilityBanner = document.getElementById('credibilityBanner');
        credibilityBanner.className = `credibility-banner ${credibility.color}`;
        document.getElementById('credibilityLevel').textContent = credibility.level;
        document.getElementById('credibilityDescription').textContent = credibility.description;

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
