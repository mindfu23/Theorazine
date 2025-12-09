// Netlify Function: perplexity.js
// Updated to use ES modules and improved error handling

exports.handler = async function(event, context) {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (parseErr) {
    console.error('Error parsing request body:', parseErr);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' })
    };
  }

  const { conspiracyName, description } = body;
  if (!conspiracyName || !description) {
    console.error('Missing input:', { conspiracyName, description });
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing conspiracyName or description.' })
    };
  }

  // Input validation
  if (typeof conspiracyName !== 'string' || conspiracyName.length > 200) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid conspiracy name.' })
    };
  }

  if (typeof description !== 'string' || description.length > 1000) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Description too long.' })
    };
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('API key not found');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Service configuration error.' })
    };
  }
  // Sanitize inputs to prevent injection
  const sanitizedName = conspiracyName.replace(/[<>]/g, '').trim();
  const sanitizedDescription = description.replace(/[<>]/g, '').trim();

  const prompt = `Estimate for the following conspiracy theory:
Name: ${sanitizedName}
Description: ${sanitizedDescription}

Please provide a structured analysis including:
A) Estimated number of people involved
B) Types of conspirators (majority profession/role)
C) Number of years the conspiracy has allegedly been active
D) Total population affected or interested
E) Source references and analysis

Keep response under 400 words.`;

  try {
    // Dynamic import for node-fetch v3 ESM
    const { default: fetch } = await import('node-fetch');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://api.perplexity.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Theorazine/1.0'
      },
      body: JSON.stringify({
        model: 'pplx-7b-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.3 // More focused responses
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      
      let errorMessage = 'External service temporarily unavailable.';
      if (response.status === 401) {
        errorMessage = 'Authentication error.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid API response format');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Function error:', err);
    
    let errorMessage = 'Internal server error.';
    if (err.name === 'AbortError') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (err.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
