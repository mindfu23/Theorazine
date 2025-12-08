/**
 * Preset conspiracy theory examples with estimated parameters
 */

const CONSPIRACY_PRESETS = [
    {
        id: 'moon-landing',
        name: 'Faked Moon Landing',
        description: 'The Apollo 11 moon landing in 1969 was staged in a film studio',
        conspirators: 400000,
        professionType: 'scientists',
        yearsActive: 56,
        populationAffected: 8000000000,
        explanation: 'Would require approximately 400,000 NASA employees, contractors, scientists, engineers, and foreign governments (USSR tracking the mission) to all keep the secret.'
    },
    {
        id: 'climate-change',
        name: 'Climate Change Hoax',
        description: 'Global warming is a fabricated conspiracy by scientists and governments',
        conspirators: 50000,
        professionType: 'scientists',
        yearsActive: 45,
        populationAffected: 8000000000,
        explanation: 'Would require tens of thousands of climate scientists, NASA, the Pentagon, oil companies that have confirmed climate change, and world governments to coordinate a false narrative.'
    },
    {
        id: 'nine-eleven',
        name: '9/11 Inside Job (LIHOP)',
        description: 'The U.S. government let the 9/11 attacks happen on purpose',
        conspirators: 500,
        professionType: 'intelligence',
        yearsActive: 24,
        populationAffected: 5000000000,
        explanation: 'Would require coordination between the Bush administration, CIA, NSA, Pentagon, NORAD, FAA, and other agencies - hundreds of people with knowledge.'
    },
    {
        id: 'birtherism',
        name: 'Birtherism (Obama Birth Certificate)',
        description: 'Barack Obama was not born in the United States',
        conspirators: 10000,
        professionType: 'government',
        yearsActive: 17,
        populationAffected: 330000000,
        explanation: 'Would require Hawaiian state government, hospitals, birth registrars, Congress members who verified eligibility, military officials, and countless others to falsify records and maintain silence.'
    },
    {
        id: 'bin-laden',
        name: 'Faked Bin Laden Assassination',
        description: 'Osama bin Laden\'s death in 2011 was fabricated',
        conspirators: 50000,
        professionType: 'military',
        yearsActive: 14,
        populationAffected: 500000000,
        explanation: 'Would require SEAL Team 6, intelligence agencies, both political parties, Al Qaeda members (who confirmed his death), Pakistani officials, and thousands of military personnel to perpetuate the lie.'
    }
];

/**
 * Historical conspiracies that FAILED to stay secret (benchmarks)
 * These are real conspiracies that were eventually exposed
 */
const HISTORICAL_BENCHMARKS = [
    {
        name: 'Guy Fawkes Gunpowder Plot',
        year: 1605,
        conspirators: 14,
        peopleAffected: 4800000,
        yearsBeforeExposed: 1.5,
        description: 'Catholic plot to blow up the English Parliament. Exposed before execution due to an anonymous letter.',
        outcome: 'Discovered before it could be carried out'
    },
    {
        name: 'Rajneeshee Bioterror Attack',
        year: 1984,
        conspirators: 17, // Using midpoint of estimated 12-19 conspirators from historical records
        peopleAffected: 100000,
        yearsBeforeExposed: 1,
        description: 'Religious cult poisoned salad bars in Oregon to influence an election. 751 people infected with salmonella.',
        outcome: 'Exposed within a year through investigation'
    },
    {
        name: 'Downing Street Memo',
        year: 2002,
        conspirators: 23,
        peopleAffected: 60000000,
        yearsBeforeExposed: 3,
        description: 'British government documents showing intelligence was "fixed" around Iraq War policy.',
        outcome: 'Leaked to journalists in 2005'
    }
];

/**
 * Get a preset by ID
 * 
 * @param {string} presetId - The ID of the preset
 * @returns {object|null} The preset object or null if not found
 */
function getPreset(presetId) {
    return CONSPIRACY_PRESETS.find(preset => preset.id === presetId) || null;
}

/**
 * Get all presets
 * 
 * @returns {Array} Array of all preset conspiracy theories
 */
function getAllPresets() {
    return CONSPIRACY_PRESETS;
}

/**
 * Get all historical benchmarks
 * 
 * @returns {Array} Array of historical conspiracy benchmarks
 */
function getHistoricalBenchmarks() {
    return HISTORICAL_BENCHMARKS;
}

/**
 * Calculate survival probability for a historical benchmark
 * 
 * @param {object} benchmark - Historical benchmark object
 * @returns {number} Probability (0 to 1) that it would have remained secret
 */
function calculateBenchmarkProbability(benchmark) {
    // Most historical conspiracies involved general public or mixed groups
    // Using 'government' as a reasonable average
    return calculateSurvivalProbability(
        benchmark.conspirators,
        benchmark.yearsBeforeExposed,
        'government'
    );
}
