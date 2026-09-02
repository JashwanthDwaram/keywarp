import { GoogleGenerativeAI } from '@google/generative-ai';

// Static candidates are real production models only — speculative model names would
// burn sequential 404s (latency) before the working fallback is reached.
const CANDIDATE_PRIORITY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

// Per-instance rate limiter (sliding window). Serverless instances are ephemeral so
// this is a best-effort guard per instance, not a global quota — but it stops the
// cheapest abuse loops from hammering the paid Gemini API.
const RATE_LIMIT_MAX = 10;          // requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute per IP
const requestLog = new Map(); // ip -> number[] (timestamps)

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  // Opportunistic cleanup so the Map doesn't grow unbounded
  if (requestLog.size > 5000) {
    for (const [key, ts] of requestLog) {
      if (ts.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key);
    }
  }
  return false;
}

function getAllowedOrigin(req) {
  const configured = (process.env.ALLOWED_ORIGINS || 'https://keywarp.vercel.app')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  const origin = req.headers?.origin;
  if (origin && configured.includes(origin)) {
    return origin;
  }
  return null;
}

function getClientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// Dynamic model discovery fallback if all static candidates fail
async function getDynamicSupportedModels(apiKey) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (listRes.ok) {
      const data = await listRes.json();
      if (data?.models && Array.isArray(data.models)) {
        const validModels = data.models
          .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => {
            const cleanName = m.name.replace(/^models\//, '');
            const match = cleanName.match(/gemini-(\d+(?:\.\d+)?)/i);
            const version = match ? parseFloat(match[1]) : 1.0;
            const isFlash = cleanName.toLowerCase().includes('flash');
            const isExp = cleanName.toLowerCase().includes('exp');
            return { name: cleanName, version, isFlash, isExp };
          });

        validModels.sort((a, b) => {
          if (a.isFlash && !b.isFlash) return -1;
          if (!a.isFlash && b.isFlash) return 1;
          if (b.version !== a.version) return b.version - a.version;
          if (!a.isExp && b.isExp) return -1;
          if (a.isExp && b.isExp) return 1;
          return 0;
        });

        const sortedNames = validModels.map(m => m.name);
        if (sortedNames.length > 0) {
          return sortedNames.slice(0, 5);
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return CANDIDATE_PRIORITY;
}

async function generateWithModel(genAI, modelName, prompt) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });

  // Hard per-call timeout so one hung request can't exceed the function limit
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12_000);
  try {
    const result = await model.generateContent(prompt, { signal: controller.signal });
    const text = result.response.text();
    if (!text) return null;
    const cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleanText);
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  // CORS: only the deployed origins may call this endpoint from a browser
  const allowedOrigin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || 'null');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!allowedOrigin) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute before retrying.' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY environment variable is missing on Vercel.'
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    const { records = [], isMobile = false } = body || {};
    const safeRecords = Array.isArray(records) ? records.slice(-30) : [];
    const safeIsMobile = Boolean(isMobile);

    // Extract error patterns from telemetry with strict character sanitization
    const errorMap = {};
    safeRecords.forEach(r => {
      if (r && typeof r === 'object' && r.mistypedKeys && typeof r.mistypedKeys === 'string' && r.mistypedKeys !== 'None') {
        const cleanMistyped = r.mistypedKeys.slice(0, 300);
        cleanMistyped.split(';').forEach(pair => {
          const [k, countStr] = pair.split(':');
          if (k && countStr && k.length <= 10) {
            const count = parseInt(countStr, 10);
            if (!isNaN(count) && count > 0 && count < 1000) {
              const safeKey = k.replace(/[^\w\s.,!?;:'"()[\]{}+=\-_\\/]/g, '').slice(0, 10);
              if (safeKey) {
                errorMap[safeKey] = (errorMap[safeKey] || 0) + count;
              }
            }
          }
        });
      }
    });

    const sortedErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, c]) => `${k === ' ' || k === '[space]' ? 'SPACE' : k} (${c} misses)`);

    const validWpmRecords = safeRecords.filter(r => r && typeof r.netWpm === 'number' && Number.isFinite(r.netWpm));
    const avgWpm = validWpmRecords.length > 0
      ? Math.round(validWpmRecords.reduce((acc, r) => acc + Math.max(0, Math.min(350, r.netWpm)), 0) / validWpmRecords.length)
      : 45;
    const avgAcc = validWpmRecords.length > 0
      ? Math.round((validWpmRecords.reduce((acc, r) => acc + Math.max(0, Math.min(100, r.accuracy || 0)), 0) / validWpmRecords.length) * 10) / 10
      : 95;
    const bestWpm = validWpmRecords.length > 0 ? Math.max(...validWpmRecords.map(r => Math.max(0, Math.min(350, r.netWpm)))) : 50;

    const platformInstruction = isMobile
      ? `CRITICAL PLATFORM CONTEXT: The user is typing on a Mobile Touchscreen device (Virtual on-screen soft keyboard / dual-thumb typing).
DO NOT mention physical mechanical keyboards, desk posture, home-row 10-finger placement, or finger reach zones (e.g. pinky reaches).
Instead, focus purely on dual-thumb lateral speed, thumb reach transitions, vowel spacing, touch accuracy, and mobile rhythm cadence.`
      : `PLATFORM CONTEXT: The user is typing on a physical desktop/laptop keyboard with 10-finger touch typing.`;

    const systemPrompt = `You are KeyWarp AI, an elite kinesiology and touch-typing performance diagnostic coach.
${platformInstruction}

Analyze the user's typing telemetry and output a strict JSON object with EXACTLY these fields:
{
  "executiveInsight": "string (warm, encouraging, highly analytical coach summary of current velocity, accuracy, and primary transition bottlenecks tailored to the platform)",
  "entropyDiagnosis": "string (technical latency entropy evaluation)",
  "ngramClusterAnalysis": "string (bi-gram transition bottleneck analysis)",
  "estimatedWpmGain": number (e.g. 8.5),
  "recommendedDrill": "string (engaging, grammatically coherent 2-3 sentence practice drill densely exercising the user's specific weak keys)",
  "focusKeys": ["array", "of", "single", "char", "strings"],
  "thoughtTrace": ["string step 1", "string step 2", "string step 3"],
  "toolsTelemetry": {
    "entropyMetric": "string",
    "clusterFindings": "string",
    "curriculumRationale": "string"
  }
}`;

    const userTelemetryPrompt = safeRecords.length > 0
      ? `User Telemetry Data:
- Platform: ${safeIsMobile ? 'Mobile Touchscreen (Dual Thumbs)' : 'Desktop/Laptop Keyboard'}
- Total Sessions: ${safeRecords.length}
- Personal Best: ${bestWpm} WPM, Average Net Speed: ${avgWpm} WPM, Average Accuracy: ${avgAcc}%
- Mistyped Keys: ${sortedErrors.join(', ') || 'None (High Precision)'}
- Recent 3 Sessions:
${safeRecords.slice(-3).map((r, i) => `  ${i + 1}. Mode: ${String(r.mode || 'Standard').slice(0, 20)}, Net WPM: ${Number(r.netWpm) || 0}, Accuracy: ${Number(r.accuracy) || 100}%, Errors: ${Number(r.totalErrors) || 0}`).join('\n')}

Generate the diagnostic breakdown and practice drill in strict JSON.`
      : `User is starting fresh with 0 recorded sessions on ${safeIsMobile ? 'Mobile' : 'Desktop'}. Formulate an inspiring onboarding diagnostic and a starter rhythm drill in strict JSON.`;

    const fullPrompt = `${systemPrompt}\n\n${userTelemetryPrompt}`;
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of CANDIDATE_PRIORITY) {
      try {
        const parsed = await generateWithModel(genAI, modelName, fullPrompt);
        if (parsed) {
          return res.status(200).json({
            ...parsed,
            isLiveGemini: true,
            modelUsed: modelName
          });
        }
      } catch {
        // Try next candidate
      }
    }

    // Dynamic model discovery fallback if static priority candidates fail
    const fallbackModels = await getDynamicSupportedModels(apiKey);
    for (const modelName of fallbackModels) {
      try {
        const parsed = await generateWithModel(genAI, modelName, fullPrompt);
        if (parsed) {
          return res.status(200).json({
            ...parsed,
            isLiveGemini: true,
            modelUsed: modelName
          });
        }
      } catch {
        // Try next
      }
    }

    return res.status(503).json({
      error: 'The AI coach is temporarily unavailable. Please try again shortly.'
    });
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
