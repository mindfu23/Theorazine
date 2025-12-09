// Perplexity API integration for Theorazine via Netlify Function
async function queryPerplexity(conspiracyName, description) {
    const response = await fetch('/.netlify/functions/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conspiracyName, description })
    });
    if (!response.ok) {
        throw new Error('Netlify function request failed');
    }
    return response.json();
}
window.queryPerplexity = queryPerplexity;
