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
            if (response.status === 429) {
                throw new Error("You've reached today's limit for AI analyses. Please try again tomorrow.");
            }
            let serverMessage = '';
            try { serverMessage = JSON.parse(errorText).error || ''; } catch (e) { /* not JSON */ }
            throw new Error(serverMessage || `Analysis request failed (${response.status}). Please try again later.`);
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
