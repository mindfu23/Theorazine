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

// Cache for expensive calculations
const calculationCache = new Map();
const CACHE_SIZE_LIMIT = 1000;

/**
 * Validate input parameters
 */
function validateInputs(conspirators, years, professionType) {
    if (typeof conspirators !== 'number' || conspirators < 1 || conspirators > 10000000) {
        throw new Error('Invalid number of conspirators');
    }
    if (typeof years !== 'number' || years < 0 || years > 1000) {
        throw new Error('Invalid number of years');
    }
    if (!LEAK_RATES.hasOwnProperty(professionType)) {
        throw new Error('Invalid profession type');
    }
}

/**
 * Create cache key for memoization
 */
function createCacheKey(conspirators, years, professionType, operation) {
    return `${operation}-${conspirators}-${years}-${professionType}`;
}

/**
 * Get cached result or calculate and cache
 */
function getCachedOrCalculate(key, calculationFn) {
    if (calculationCache.has(key)) {
        return calculationCache.get(key);
    }
    
    const result = calculationFn();
    
    // Manage cache size
    if (calculationCache.size >= CACHE_SIZE_LIMIT) {
        const firstKey = calculationCache.keys().next().value;
        calculationCache.delete(firstKey);
    }
    
    calculationCache.set(key, result);
    return result;
}

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
    try {
        validateInputs(conspirators, years, professionType);
        
        const cacheKey = createCacheKey(conspirators, years, professionType, 'survival');
        
        return getCachedOrCalculate(cacheKey, () => {
            const leakRate = LEAK_RATES[professionType];
            const exponent = -leakRate * conspirators * years;
            
            // Handle extreme values
            if (exponent < -500) return 0; // Prevent underflow
            if (exponent > 0) return 1;
            
            return Math.exp(exponent);
        });
    } catch (error) {
        console.error('Error calculating survival probability:', error);
        return 0;
    }
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
    try {
        const survivalProb = calculateSurvivalProbability(conspirators, years, professionType);
        return Math.max(0, Math.min(1, 1 - survivalProb)); // Clamp between 0 and 1
    } catch (error) {
        console.error('Error calculating exposure probability:', error);
        return 1; // Assume exposed if calculation fails
    }
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
    try {
        validateInputs(conspirators, 0, professionType); // years = 0 for this calculation
        
        const cacheKey = createCacheKey(conspirators, 0, professionType, 'expected');
        
        return getCachedOrCalculate(cacheKey, () => {
            const leakRate = LEAK_RATES[professionType];
            
            if (conspirators <= 0 || leakRate <= 0) {
                return Infinity;
            }
            
            const result = 0.693 / (leakRate * conspirators);
            return Math.max(0, result); // Ensure non-negative
        });
    } catch (error) {
        console.error('Error calculating expected time:', error);
        return Infinity;
    }
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
    try {
        validateInputs(conspirators, 0, professionType);
        
        const cacheKey = createCacheKey(conspirators, maxYears, professionType, 'series');
        
        return getCachedOrCalculate(cacheKey, () => {
            const data = [];
            
            // Optimize step size based on data range
            let step = 1;
            if (maxYears > 200) step = 10;
            else if (maxYears > 100) step = 5;
            else if (maxYears > 50) step = 2;
            
            const leakRate = LEAK_RATES[professionType];
            
            for (let year = 0; year <= maxYears; year += step) {
                const exponent = -leakRate * conspirators * year;
                let probability;
                
                // Handle extreme values efficiently
                if (exponent < -500) {
                    probability = 0;
                } else if (exponent > 0) {
                    probability = 100;
                } else {
                    probability = Math.exp(exponent) * 100;
                }
                
                data.push({
                    year: year,
                    probability: Math.max(0, Math.min(100, probability))
                });
                
                // Early termination when probability becomes negligible
                if (probability < 0.01 && year > 10) break;
            }
            
            return data;
        });
    } catch (error) {
        console.error('Error generating probability over time:', error);
        return [{year: 0, probability: 100}]; // Fallback data
    }
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
