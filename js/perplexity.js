// Perplexity API integration for Theorazine
async function queryPerplexity(conspiracyName, description) {
    const apiKey = window.PERPLEXITY_API_KEY || (typeof process !== 'undefined' ? process.env.PERPLEXITY_API_KEY : undefined);
    if (!apiKey) {
        throw new Error('Perplexity API key not found.');
    }
    const prompt = `Estimate for the following conspiracy theory:\nName: ${conspiracyName}\nDescription: ${description}\nPlease return:\nA) Estimated number of people involved\nB) Types of conspirators (majority)\nC) Number of years active\nD) Total population affected/interested\nE) Linked footnotes to sources and analysis.`;
    const response = await fetch('https://api.perplexity.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'pplx-7b-online',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 512
        })
    });
    if (!response.ok) {
        throw new Error('Perplexity API request failed');
    }
    return response.json();
}
window.queryPerplexity = queryPerplexity;
