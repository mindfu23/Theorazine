// Netlify Function: perplexity
// Proxies a fixed conspiracy-analysis prompt to Perplexity (sonar-pro).
// Guarded by ai-guard: POST only, body cap, Origin allowlist, per-visitor and
// global daily caps (Netlify Blobs), failing closed.

import type { Handler, HandlerResponse } from '@netlify/functions';
import { aiGuard } from './lib/ai-guard';
import { asV2 } from './lib/v2-adapter';

const APP_ORIGIN = 'https://theorazine.netlify.app';
// Fixed: never taken from the request. 'sonar-reasoning' was retired by Perplexity
// (400 invalid_model, seen 2026-10-06). sonar-pro (no reasoning step) chosen 2026-10-06: cheaper, and
// reasoning tokens no longer eat the max_tokens budget.
const MODEL = 'sonar-pro';
const MAX_NAME = 200;
const MAX_DESCRIPTION = 1000;

// The app calls this same-origin, so CORS is only ever granted to the app itself.
const headers: Record<string, string> = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

function json(statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

const handler: Handler = async (event) => {
  // Handle preflight request (not counted)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Every POST attempt counts against the caps, including malformed ones.
  const blocked = await aiGuard(event, {
    store: 'ai-usage',
    perIpDaily: 15,
    globalDaily: 200,
    maxBodyBytes: 4_000,
    allowedOrigins: [APP_ORIGIN],
    headers,
  });
  if (blocked) return blocked;

  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON in request body.' });
  }

  const conspiracyName = body?.conspiracyName;
  const description = body?.description;
  if (!conspiracyName || !description) {
    return json(400, { error: 'Missing conspiracyName or description.' });
  }

  // Input validation
  if (typeof conspiracyName !== 'string' || conspiracyName.length > MAX_NAME) {
    return json(400, { error: 'Invalid conspiracy name.' });
  }
  if (typeof description !== 'string' || description.length > MAX_DESCRIPTION) {
    return json(400, { error: 'Description too long.' });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.error('API key not found');
    return json(500, { error: 'Service configuration error.' });
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45 second timeout for reasoning model

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Theorazine/2.0',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        // Reasoning tokens count against this budget; at 1000 the visible answer
        // was cut off after ~130 tokens (finish_reason "length").
        max_tokens: 1200,
        temperature: 0.1, // Very focused responses for analytical tasks
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Upstream details stay in the function log; the browser gets a generic message.
      console.error('Perplexity API error:', response.status, errorText.slice(0, 500));
      const errorMessage = response.status === 429
        ? 'The analysis service is busy. Please try again later.'
        : 'External service temporarily unavailable.';
      return json(502, { error: errorMessage });
    }

    const data: any = await response.json();

    // Validate response structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid API response format');
    }

    return json(200, data);
  } catch (err: any) {
    console.error('Function error:', err);
    const errorMessage = err?.name === 'AbortError'
      ? 'Request timeout. Please try again.'
      : 'Internal server error.';
    return json(500, { error: errorMessage });
  } finally {
    clearTimeout(timeout);
  }
};

export default asV2(handler);
