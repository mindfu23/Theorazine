// Perplexity API integration for Theorazine via Netlify Function
async function queryPerplexity(conspiracyName, description) {
    try {
        console.log('Calling Perplexity function with:', { conspiracyName, description });
        
        const response = await fetch('/.netlify/functions/perplexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conspiracyName, description })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Function error response:', errorText);
            throw new Error(`Function request failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Function response:', result);
        return result;
    } catch (error) {
        console.error('queryPerplexity error:', error);
        throw error;
    }
}
window.queryPerplexity = queryPerplexity;
