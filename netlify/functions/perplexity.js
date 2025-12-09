// Netlify Function: perplexity.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (parseErr) {
    console.error('Error parsing request body:', parseErr);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' })
    };
  }
  const { conspiracyName, description } = body;
  if (!conspiracyName || !description) {
    console.error('Missing input:', { conspiracyName, description });
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing conspiracyName or description.' })
    };
  }
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('API key not found');
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
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Perplexity API error', details: errorText })
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
