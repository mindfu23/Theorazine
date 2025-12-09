/**
 * Performance monitoring utilities for Theorazine
 * Tracks key metrics and provides optimization insights
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observers = new Map();
        this.isEnabled = typeof performance !== 'undefined' && performance.mark;
        
        if (this.isEnabled) {
            this.init();
        }
    }
    
    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => this.recordPageLoadMetrics(), 0);
        });
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver(list => {
                    list.getEntries().forEach(entry => {
                        this.recordLongTask(entry);
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', longTaskObserver);
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }
    
    // Mark the start of an operation
    markStart(name) {
        if (!this.isEnabled) return;
        performance.mark(`${name}-start`);
    }
    
    // Mark the end of an operation and measure duration
    markEnd(name) {
        if (!this.isEnabled) return;
        
        const startMark = `${name}-start`;
        const endMark = `${name}-end`;
        
        performance.mark(endMark);
        
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            this.recordMetric(name, measure.duration);
            
            // Clean up marks
            performance.clearMarks(startMark);
            performance.clearMarks(endMark);
            performance.clearMeasures(name);
        } catch (e) {
            console.warn(`Failed to measure ${name}:`, e);
        }
    }
    
    // Record a custom metric
    recordMetric(name, value, unit = 'ms') {
        if (!this.metrics[name]) {
            this.metrics[name] = {
                values: [],
                unit,
                count: 0,
                sum: 0,
                min: Infinity,
                max: -Infinity
            };
        }
        
        const metric = this.metrics[name];
        metric.values.push(value);
        metric.count++;
        metric.sum += value;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);
        
        // Keep only the last 100 values to prevent memory leaks
        if (metric.values.length > 100) {
            metric.values = metric.values.slice(-100);
        }
        
        // Log slow operations in development
        if (value > 100 && name !== 'page-load') {
            console.warn(`Slow operation detected: ${name} took ${value.toFixed(2)}ms`);
        }
    }
    
    // Record page load metrics
    recordPageLoadMetrics() {
        if (!this.isEnabled) return;
        
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.recordMetric('page-load', navigation.loadEventEnd - navigation.fetchStart);
            this.recordMetric('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
            this.recordMetric('first-byte', navigation.responseStart - navigation.fetchStart);
        }
        
        // Record paint timing if available
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            this.recordMetric(entry.name, entry.startTime);
        });
    }
    
    // Record long task
    recordLongTask(entry) {
        this.recordMetric('long-task', entry.duration);
        console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
    }
    
    // Get metric statistics
    getMetric(name) {
        const metric = this.metrics[name];
        if (!metric || metric.count === 0) return null;
        
        return {
            ...metric,
            average: metric.sum / metric.count,
            latest: metric.values[metric.values.length - 1]
        };
    }
    
    // Get all metrics summary
    getMetricsSummary() {
        const summary = {};
        Object.keys(this.metrics).forEach(name => {
            summary[name] = this.getMetric(name);
        });
        return summary;
    }
    
    // Log performance summary to console
    logSummary() {
        if (!this.isEnabled) {
            console.log('Performance monitoring not available');
            return;
        }
        
        console.group('🚀 Theorazine Performance Summary');
        
        const summary = this.getMetricsSummary();
        Object.keys(summary).forEach(name => {
            const metric = summary[name];
            if (metric) {
                console.log(`${name}: ${metric.average.toFixed(2)}ms avg (${metric.min.toFixed(2)}-${metric.max.toFixed(2)}ms range, ${metric.count} samples)`);
            }
        });
        
        console.groupEnd();
    }
    
    // Clean up observers
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.metrics = {};
    }
}

// Create global instance
window.performanceMonitor = new PerformanceMonitor();

// Expose helpful methods
window.perfMark = (name) => window.performanceMonitor.markStart(name);
window.perfEnd = (name) => window.performanceMonitor.markEnd(name);
window.perfLog = () => window.performanceMonitor.logSummary();

// Auto-log performance summary in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        setTimeout(() => window.performanceMonitor.logSummary(), 3000);
    });
}