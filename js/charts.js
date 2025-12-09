/**
 * Conspiracy Theorazine Chart and Visualization Logic
 * Handles all charts and visual representations using Chart.js
 */

let timeDecayChart = null;
let comparisonChart = null;
let chartUpdateDebouncer = null;

// Chart configurations for reuse
const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top'
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    animation: {
        duration: 300 // Faster animations
    }
};

/**
 * Safely destroy a chart instance
 */
function safeDestroyChart(chart) {
    if (chart && typeof chart.destroy === 'function') {
        try {
            chart.destroy();
        } catch (error) {
            console.warn('Error destroying chart:', error);
        }
    }
    return null;
}

/**
 * Check if Chart.js is available and show fallback if not
 */
function isChartJSAvailable() {
    return typeof Chart !== 'undefined';
}

/**
 * Show chart unavailable message
 */
function showChartUnavailable(canvas) {
    if (canvas && canvas.parentElement) {
        canvas.parentElement.innerHTML = '<p class="chart-unavailable">Chart visualization requires Chart.js library. Please disable ad blockers or use a different browser.</p>';
    }
}

/**
 * Initialize or update the time decay chart
 * Shows how probability of survival decreases over time
 * 
 * @param {number} conspirators - Number of conspirators
 * @param {string} professionType - Type of conspirators
 * @param {number} currentYears - Current years active
 */
function updateTimeDecayChart(conspirators, professionType, currentYears) {
    // Debounce chart updates for better performance
    clearTimeout(chartUpdateDebouncer);
    chartUpdateDebouncer = setTimeout(() => {
        doUpdateTimeDecayChart(conspirators, professionType, currentYears);
    }, 150);
}

function doUpdateTimeDecayChart(conspirators, professionType, currentYears) {
    const ctx = document.getElementById('timeDecayChart');
    if (!ctx) return;
    
    if (!isChartJSAvailable()) {
        showChartUnavailable(ctx);
        return;
    }
    
    try {
        // Calculate max years to show (at least 2x current years, or 50 years minimum)
        const maxYears = Math.max(50, Math.min(currentYears * 2, 200)); // Cap at 200 for performance
        const data = generateProbabilityOverTime(conspirators, professionType, maxYears);
        
        // Prepare data for Chart.js
        const labels = data.map(d => d.year);
        const probabilities = data.map(d => d.probability);
        
        // Destroy existing chart safely
        timeDecayChart = safeDestroyChart(timeDecayChart);
        
        // Create new chart with optimized configuration
        timeDecayChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Probability of Remaining Secret (%)',
                    data: probabilities,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: labels.length > 50 ? 0 : 2, // Hide points for large datasets
                    pointHoverRadius: 5
                }]
            },
            options: {
                ...CHART_DEFAULTS,
                plugins: {
                    ...CHART_DEFAULTS.plugins,
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Probability: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    ...CHART_DEFAULTS.scales,
                    x: {
                        ...CHART_DEFAULTS.scales.x,
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    },
                    y: {
                        ...CHART_DEFAULTS.scales.y,
                        title: {
                            display: true,
                            text: 'Probability of Remaining Secret (%)'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating time decay chart:', error);
        showChartUnavailable(ctx);
    }
}
            }
        }
    });
}

/**
 * Update the probability gauge/meter
 * Visual representation of current survival probability
 * 
 * @param {number} probability - Probability (0 to 1)
 */
function updateProbabilityGauge(probability) {
    const gaugeElement = document.getElementById('probabilityGauge');
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeNeedle = document.getElementById('gaugeNeedle');
    
    if (!gaugeElement || !gaugeValue || !gaugeNeedle) return;
    
    const percentage = probability * 100;
    gaugeValue.textContent = formatProbability(probability);
    
    // Rotate needle (0% = -90deg, 100% = 90deg)
    const rotation = (percentage / 100) * 180 - 90;
    gaugeNeedle.style.transform = `rotate(${rotation}deg)`;
    
    // Update color based on credibility
    const credibility = getCredibilityLevel(probability);
    gaugeElement.className = `gauge ${credibility.color}`;
}

/**
 * Update comparison bars showing current conspiracy vs historical examples
 * 
 * @param {number} conspirators - Number of conspirators
 * @param {number} years - Years active
 */
function updateComparisonChart(conspirators, years) {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        ctx.parentElement.innerHTML = '<p class="chart-unavailable">Chart visualization requires Chart.js library. Please disable ad blockers or use a different browser.</p>';
        return;
    }
    
    const benchmarks = getHistoricalBenchmarks();
    
    // Calculate probabilities for benchmarks
    const benchmarkData = benchmarks.map(b => {
        const prob = calculateBenchmarkProbability(b);
        return {
            name: b.name,
            probability: prob * 100,
            years: b.yearsBeforeExposed
        };
    });
    
    // Calculate current conspiracy probability at different time points
    const currentProb = calculateSurvivalProbability(conspirators, years, 'government');
    
    // Add current conspiracy to data
    benchmarkData.push({
        name: 'Your Conspiracy',
        probability: currentProb * 100,
        years: years
    });
    
    // Prepare data for Chart.js
    const labels = benchmarkData.map(d => d.name);
    const probabilities = benchmarkData.map(d => d.probability);
    const colors = benchmarkData.map((d, idx) => 
        idx === benchmarkData.length - 1 ? '#3b82f6' : '#94a3b8'
    );
    
    // Destroy existing chart if it exists
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Create new chart
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Survival Probability (%)',
                data: probabilities,
                backgroundColor: colors,
                borderColor: colors.map(c => c === '#3b82f6' ? '#2563eb' : '#64748b'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = benchmarkData[context.dataIndex];
                            return [
                                `Probability: ${context.parsed.x.toFixed(3)}%`,
                                `Duration: ${data.years} years`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Probability of Remaining Secret (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Initialize all charts with default values
 */
function initializeCharts() {
    // Only initialize if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js library not loaded. Charts will not be displayed.');
        return;
    }
    
    updateTimeDecayChart(100, 'government', 10);
    updateComparisonChart(100, 10);
    updateProbabilityGauge(0.5);
}

/**
 * Update all visualizations at once
 * 
 * @param {number} conspirators - Number of conspirators
 * @param {string} professionType - Type of conspirators
 * @param {number} years - Years active
 */
function updateAllVisualizations(conspirators, professionType, years) {
    const probability = calculateSurvivalProbability(conspirators, years, professionType);
    
    updateTimeDecayChart(conspirators, professionType, years);
    updateComparisonChart(conspirators, years);
    updateProbabilityGauge(probability);
}
