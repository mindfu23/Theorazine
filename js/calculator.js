/**
 * Conspiracy Theorazine Calculator
 * Core probability calculations based on Dr. David Robert Grimes' model
 * From "On the Viability of Conspiratorial Beliefs" (PLOS ONE, 2016)
 */

// Profession-based leak rates (probability per year that each conspirator will leak)
const LEAK_RATES = {
    'scientists': 0.0004,
    'intelligence': 0.0003,
    'government': 0.0005,
    'military': 0.0004,
    'corporate': 0.0006,
    'general': 0.001
};

/**
 * Calculate the probability that a conspiracy survives unexposed
 * Using Dr. Grimes' formula: P(t) = exp(-p × N × t)
 * 
 * @param {number} conspirators - Number of people involved (N)
 * @param {number} years - Time in years (t)
 * @param {string} professionType - Type of conspirators (key from LEAK_RATES)
 * @returns {number} Probability (0 to 1) that conspiracy remains unexposed
 */
function calculateSurvivalProbability(conspirators, years, professionType) {
    const leakRate = LEAK_RATES[professionType] || LEAK_RATES.general;
    const exponent = -leakRate * conspirators * years;
    return Math.exp(exponent);
}

/**
 * Calculate the probability that a conspiracy has been exposed by now
 * 
 * @param {number} conspirators - Number of people involved
 * @param {number} years - Time in years
 * @param {string} professionType - Type of conspirators
 * @returns {number} Probability (0 to 1) that conspiracy has been exposed
 */
function calculateExposureProbability(conspirators, years, professionType) {
    return 1 - calculateSurvivalProbability(conspirators, years, professionType);
}

/**
 * Calculate expected time until exposure (in years)
 * This is when the survival probability drops to ~50%
 * Solving for t when P(t) = 0.5:
 * 0.5 = exp(-p × N × t)
 * ln(0.5) = -p × N × t
 * t = ln(0.5) / (-p × N)
 * t = 0.693 / (p × N)
 * 
 * @param {number} conspirators - Number of people involved
 * @param {string} professionType - Type of conspirators
 * @returns {number} Expected years until 50% probability of exposure
 */
function calculateExpectedTimeUntilExposure(conspirators, professionType) {
    const leakRate = LEAK_RATES[professionType] || LEAK_RATES.general;
    if (conspirators === 0 || leakRate === 0) {
        return Infinity;
    }
    return 0.693 / (leakRate * conspirators);
}

/**
 * Generate probability data over time for charting
 * 
 * @param {number} conspirators - Number of people involved
 * @param {string} professionType - Type of conspirators
 * @param {number} maxYears - Maximum years to calculate
 * @returns {Array} Array of {year, probability} objects
 */
function generateProbabilityOverTime(conspirators, professionType, maxYears = 100) {
    const data = [];
    const step = maxYears > 50 ? 5 : 1;
    
    for (let year = 0; year <= maxYears; year += step) {
        const probability = calculateSurvivalProbability(conspirators, year, professionType);
        data.push({
            year: year,
            probability: probability * 100 // Convert to percentage
        });
    }
    
    return data;
}

/**
 * Determine the credibility level based on survival probability
 * 
 * @param {number} probability - Survival probability (0 to 1)
 * @returns {object} Object with level and color
 */
function getCredibilityLevel(probability) {
    if (probability > 0.5) {
        return {
            level: 'Plausible',
            color: 'green',
            description: 'This conspiracy could theoretically remain secret for this duration.'
        };
    } else if (probability > 0.01) {
        return {
            level: 'Unlikely',
            color: 'yellow',
            description: 'Statistically improbable that this many people could keep this secret for this long.'
        };
    } else {
        return {
            level: 'Virtually Impossible',
            color: 'red',
            description: 'The probability of this remaining secret is astronomically low.'
        };
    }
}

/**
 * Format time duration in a human-readable way
 * 
 * @param {number} years - Time in years
 * @returns {string} Formatted string
 */
function formatTimeDuration(years) {
    if (years === Infinity) {
        return 'Never (no conspirators)';
    }
    
    if (years < 1) {
        const months = Math.round(years * 12);
        const days = Math.round(years * 365);
        
        if (months < 1) {
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
        return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    if (years < 2) {
        return `${years.toFixed(1)} year`;
    }
    
    return `${Math.round(years)} years`;
}

/**
 * Format probability as percentage
 * 
 * @param {number} probability - Probability (0 to 1)
 * @returns {string} Formatted percentage string
 */
function formatProbability(probability) {
    const percentage = probability * 100;
    
    if (percentage < 0.001) {
        return '< 0.001%';
    }
    
    if (percentage < 1) {
        return percentage.toFixed(3) + '%';
    }
    
    if (percentage < 10) {
        return percentage.toFixed(2) + '%';
    }
    
    return percentage.toFixed(1) + '%';
}
