// Netlify Function: perplexity.js
// Updated to use ES modules and improved error handling

exports.handler = async function(event, context) {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'false',
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

  const prompt = `Analyze the following conspiracy theory using reasoning and factual research:

Conspiracy Theory: ${sanitizedName}
Description: ${sanitizedDescription}

Please provide a structured, evidence-based analysis:

1. ESTIMATED SCALE:
   - Number of people who would need to be involved to maintain this conspiracy
   - Type of conspirators (profession/role) required

2. TEMPORAL ANALYSIS:
   - How long has this theory allegedly been active?
   - Historical context and timeline

3. IMPACT ASSESSMENT:
   - Population size that would be affected or interested
   - Scope of influence (local, national, global)

4. FEASIBILITY FACTORS:
   - Practical challenges to maintaining secrecy
   - Historical precedents of similar-scale conspiracies

5. SOURCE EVALUATION:
   - Key claims and their factual basis
   - Credible sources and evidence quality

Please be objective, cite specific examples where possible, and keep response under 500 words.`;

  try {
    // Dynamic import for node-fetch v3 ESM
    const { default: fetch } = await import('node-fetch');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45 second timeout for reasoning model

    const response = await fetch('https://api.perplexity.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Theorazine/2.0'
      },
      body: JSON.stringify({
        model: 'sonar-pro',  // Using sonar-pro for advanced reasoning
        messages: [{ 
          role: 'user', 
          content: prompt 
        }],
        max_tokens: 1000, // Increased for more detailed analysis
        temperature: 0.1 // Very focused responses for analytical tasks
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      
      let errorMessage = 'External service temporarily unavailable.';
      if (response.status === 401) {
        errorMessage = 'Authentication error. Check API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request: ' + errorText;
      } else if (response.status === 404) {
        errorMessage = 'API endpoint or model not found: ' + errorText;
      }
      
      return {
        statusCode: 200, // Return 200 so browser can read the error message
        headers,
        body: JSON.stringify({ error: errorMessage, details: errorText })
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
