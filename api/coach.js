import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory model cache with 1-hour TTL
let cachedModels = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getDynamicSupportedModels(apiKey) {
  const now = Date.now();
  if (cachedModels.length > 5 && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedModels;
  }

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
          if (a.isExp && !b.isExp) return 1;
          return 0;
        });

        const sortedNames = validModels.map(m => m.name);
        if (sortedNames.length > 0) {
          cachedModels = sortedNames;
          lastFetchTime = now;
          return sortedNames;
        }
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return cachedModels;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
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

    // Extract error patterns from telemetry
    const errorMap = {};
    records.forEach(r => {
      if (r.mistypedKeys && r.mistypedKeys !== 'None') {
        r.mistypedKeys.split(';').forEach(pair => {
          const [k, countStr] = pair.split(':');
          if (k && countStr) {
            const count = parseInt(countStr, 10);
            if (!isNaN(count)) {
              errorMap[k] = (errorMap[k] || 0) + count;
            }
          }
        });
      }
    });

    const sortedErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, c]) => `${k === ' ' || k === '[space]' ? 'SPACE' : k} (${c} misses)`);

    const avgWpm = records.length > 0
      ? Math.round(records.reduce((acc, r) => acc + r.netWpm, 0) / records.length)
      : 45;
    const avgAcc = records.length > 0
      ? Math.round((records.reduce((acc, r) => acc + r.accuracy, 0) / records.length) * 10) / 10
      : 95;
    const bestWpm = records.length > 0 ? Math.max(...records.map(r => r.netWpm)) : 50;

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

    const userTelemetryPrompt = records.length > 0
      ? `User Telemetry Data:
- Platform: ${isMobile ? 'Mobile Touchscreen (Dual Thumbs)' : 'Desktop/Laptop Keyboard'}
- Total Sessions: ${records.length}
- Personal Best: ${bestWpm} WPM, Average Net Speed: ${avgWpm} WPM, Average Accuracy: ${avgAcc}%
- Mistyped Keys: ${sortedErrors.join(', ') || 'None (High Precision)'}
- Recent 3 Sessions:
${records.slice(-3).map((r, i) => `  ${i + 1}. Mode: ${r.mode}, Net WPM: ${r.netWpm}, Accuracy: ${r.accuracy}%, Errors: ${r.totalErrors}`).join('\n')}

Generate the diagnostic breakdown and practice drill in strict JSON.`
      : `User is starting fresh with 0 recorded sessions on ${isMobile ? 'Mobile' : 'Desktop'}. Formulate an inspiring onboarding diagnostic and a starter rhythm drill in strict JSON.`;

    const fullPrompt = `${systemPrompt}\n\n${userTelemetryPrompt}`;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Fast-path models list: tries newest Flash generations first
    const candidatePriority = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    for (const modelName of candidatePriority) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        if (text) {
          const cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanText);
          return res.status(200).json({
            ...parsed,
            isLiveGemini: true,
            modelUsed: modelName
          });
        }
      } catch {
        // Try next newest generation
      }
    }

    // Dynamic model discovery fallback if static priority candidates fail
    const fallbackModels = await getDynamicSupportedModels(apiKey);
    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });

        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        if (text) {
          const cleanText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
          const parsed = JSON.parse(cleanText);
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

    return res.status(500).json({
      error: 'Gemini API models temporarily unavailable'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
