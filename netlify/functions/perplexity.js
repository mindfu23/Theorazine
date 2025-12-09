// Netlify Function: perplexity.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { conspiracyName, description } = JSON.parse(event.body || '{}');
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Perplexity API key not found.' })
    };
  }
  const prompt = `Estimate for the following conspiracy theory:\nName: ${conspiracyName}\nDescription: ${description}\nPlease return:\nA) Estimated number of people involved\nB) Types of conspirators (majority)\nC) Number of years active\nD) Total population affected/interested\nE) Linked footnotes to sources and analysis.`;
  try {
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
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
