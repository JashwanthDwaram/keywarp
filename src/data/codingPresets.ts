/**
 * TypePulse Specialized Coding and Vocabulary Dictionaries
 * Curated programming languages, frequency tiers, and tech lexicon.
 */

export type CodeLanguage = 'typescript' | 'python' | 'rust' | 'sql' | 'htmlcss' | 'golang';
export type WordFrequencyPack = '1k' | '5k' | '10k' | 'tech';

export interface CodeSnippet {
  language: CodeLanguage;
  title: string;
  code: string;
}

export const CODE_LANGUAGE_PRESETS: Record<CodeLanguage, string[]> = {
  typescript: [
    "interface UserProfile {\n  id: string;\n  email: string;\n  role: 'admin' | 'member';\n  createdAt: Date;\n}",
    "const fetchTelemetry = async (sessionId: string): Promise<TypingRecord> => {\n  const response = await fetch(`/api/sessions/${sessionId}`);\n  if (!response.ok) throw new Error('Failed to fetch');\n  return response.json();\n};",
    "export const useDebounce = <T>(value: T, delayMs: number): T => {\n  const [debounced, setDebounced] = useState<T>(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delayMs);\n    return () => clearTimeout(timer);\n  }, [value, delayMs]);\n  return debounced;\n};",
    "type Result<T, E = Error> = \n  | { success: true; data: T }\n  | { success: false; error: E };\n\nfunction parseInput(raw: string): Result<number> {\n  const num = Number(raw);\n  return isNaN(num) ? { success: false, error: new Error('NaN') } : { success: true, data: num };\n}",
    "const memoizedCallback = useCallback((key: string, count: number) => {\n  setMistakeMatrix(prev => ({\n    ...prev,\n    [key]: (prev[key] || 0) + count\n  }));\n}, []);",
    "const createStore = <State>(initial: State) => {\n  let current = initial;\n  const listeners = new Set<(s: State) => void>();\n  return {\n    get: () => current,\n    set: (next: State) => { current = next; listeners.forEach(fn => fn(current)); },\n    subscribe: (fn: (s: State) => void) => { listeners.add(fn); return () => listeners.delete(fn); }\n  };\n};"
  ],
  python: [
    "def calculate_moving_average(values: list[float], window_size: int = 5) -> list[float]:\n    if not values or window_size < 1:\n        return []\n    return [sum(values[max(0, i - window_size + 1):i + 1]) / min(i + 1, window_size) for i in range(len(values))]",
    "@dataclass(frozen=True)\nclass TelemetrySnapshot:\n    timestamp: float\n    net_wpm: float\n    gross_wpm: float\n    accuracy: float\n    active_streak: int = 0",
    "async def stream_ai_insights(session_id: str, client: AsyncGeminiClient):\n    async for chunk in client.generate_content_stream(prompt=f'Analyze {session_id}'):\n        if chunk.text:\n            yield chunk.text.strip()",
    "from collections import defaultdict\n\ndef aggregate_finger_errors(records: list[dict]) -> dict[str, int]:\n    error_map = defaultdict(int)\n    for record in records:\n        for key, count in record.get('mistyped', {}).items():\n            error_map[key] += count\n    return dict(sorted(error_map.items(), key=lambda x: x[1], reverse=True))",
    "import asyncio\n\nasync def worker_queue(queue: asyncio.Queue, results: list):\n    while not queue.empty():\n        task = await queue.get()\n        try:\n            res = await process_task(task)\n            results.append(res)\n        finally:\n            queue.task_done()"
  ],
  rust: [
    "pub struct CaretBuffer {\n    target_words: Vec<String>,\n    active_index: usize,\n    current_input: String,\n}\n\nimpl CaretBuffer {\n    pub fn is_complete(&self) -> bool {\n        self.active_index >= self.target_words.len()\n    }\n}",
    "fn calculate_smoothed_wpm(raw: f64, previous: f64, elapsed: f64) -> f64 {\n    let alpha = 0.35;\n    if previous == 0.0 {\n        raw\n    } else {\n        alpha * raw + (1.0 - alpha) * previous\n    }\n}",
    "enum TypingEvent {\n    CharInput(char),\n    SpaceAdvance,\n    Backspace { is_ctrl: bool },\n    RestartSprint,\n}\n\nfn handle_event(event: TypingEvent, state: &mut ArenaState) -> Option<SessionRecord> {\n    match event {\n        TypingEvent::CharInput(c) => state.insert_char(c),\n        TypingEvent::SpaceAdvance => state.advance_word(),\n        _ => None,\n    }\n}",
    "use std::collections::HashMap;\n\npub fn extract_weak_clusters(data: &[SessionLog]) -> HashMap<String, u32> {\n    data.iter().fold(HashMap::new(), |mut acc, log| {\n        for (k, v) in &log.errors {\n            *acc.entry(k.clone()).or_insert(0) += v;\n        }\n        acc\n    })\n}"
  ],
  sql: [
    "SELECT \n  user_id,\n  COUNT(id) AS total_sessions,\n  ROUND(AVG(net_wpm), 1) AS avg_wpm,\n  MAX(net_wpm) AS peak_wpm,\n  ROUND(AVG(accuracy), 2) AS avg_accuracy\nFROM typing_sessions\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY user_id\nHAVING COUNT(id) >= 5\nORDER BY peak_wpm DESC;",
    "WITH RankedScores AS (\n  SELECT \n    session_id,\n    user_id,\n    net_wpm,\n    accuracy,\n    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY net_wpm DESC) as pb_rank\n  FROM leaderboard_entries\n)\nSELECT * FROM RankedScores WHERE pb_rank = 1;",
    "CREATE INDEX idx_sessions_user_created ON typing_sessions(user_id, created_at DESC);\nALTER TABLE users ADD COLUMN preferred_theme VARCHAR(32) DEFAULT 'earth-minimal';"
  ],
  htmlcss: [
    "<div class=\"relative flex items-center justify-between p-4 rounded-lg bg-surface/80 border border-ink-400/15 backdrop-blur-sm shadow-sm font-sans\">\n  <span class=\"text-xs font-mono text-accent font-semibold\">flow cadence</span>\n  <button class=\"px-3 py-1.5 rounded bg-accent text-white font-medium hover:opacity-90 transition-all\">start</button>\n</div>",
    "@media (prefers-reduced-motion: no-preference) {\n  .animate-caret {\n    animation: block-caret-blink 1.05s ease-in-out infinite;\n  }\n  .glow-pulse {\n    box-shadow: 0 0 16px rgba(var(--color-accent-rgb), 0.65);\n  }\n}",
    "<main class=\"max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-ink-100\">\n  <section class=\"col-span-2 space-y-4\"></section>\n  <aside class=\"space-y-3\"></aside>\n</main>"
  ],
  golang: [
    "type SessionRecord struct {\n\tID        string    `json:\"id\"`\n\tNetWPM    float64   `json:\"net_wpm\"`\n\tAccuracy  float64   `json:\"accuracy\"`\n\tTimestamp time.Time `json:\"timestamp\"`\n}\n\nfunc (s *SessionRecord) IsGodspeed() bool {\n\treturn s.NetWPM >= 100.0 && s.Accuracy >= 98.0\n}",
    "func BroadcastTelemetry(hub *Hub, msg TelemetryMessage) error {\n\tselect {\n\tcase hub.broadcast <- msg:\n\t\treturn nil\n\tcase <-time.After(100 * time.Millisecond):\n\t\treturn errors.New(\"broadcast timeout\")\n\t}\n}"
  ]
};

// Specialized Vocabulary Frequency Dictionaries
export const VOCABULARY_PACKS: Record<WordFrequencyPack, string[]> = {
  '1k': [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he',
    'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
    'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
    'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
    'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
    'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'day', 'most', 'us', 'great', 'between', 'need', 'large', 'under', 'might', 'still', 'found', 'thought',
    'point', 'world', 'place', 'hand', 'life', 'tell', 'sentence', 'should', 'water', 'system', 'build',
    'number', 'sound', 'line', 'side', 'been', 'now', 'find', 'head', 'stand', 'own', 'page', 'should',
    'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food',
    'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree'
  ],
  '5k': [
    'algorithm', 'cadence', 'biomechanics', 'velocity', 'equilibrium', 'synchronize', 'precision',
    'momentum', 'trajectory', 'perspective', 'resonance', 'heuristic', 'subversive', 'infrastructure',
    'coordinate', 'neuromuscular', 'resilience', 'transition', 'cognitive', 'architecture', 'bandwidth',
    'calibration', 'deterministic', 'entropy', 'frequency', 'granularity', 'hierarchy', 'iteration',
    'jurisdiction', 'kinetics', 'leverage', 'magnitude', 'navigation', 'oscillation', 'paradigms',
    'quantum', 'rhythm', 'synthesize', 'tactical', 'unison', 'vibration', 'wavelength', 'zenith',
    'asymptotic', 'benchmark', 'concurrency', 'divergence', 'exponential', 'fluctuation', 'generative',
    'hyperbolic', 'immutable', 'juxtapose', 'kinesthetic', 'logarithmic', 'metronome', 'nonvolatile',
    'orthogonal', 'phenomenon', 'quadratic', 'refactoring', 'streamlined', 'topological', 'ubiquity'
  ],
  '10k': [
    'anachronistic', 'epistemology', 'quintessential', 'juxtaposition', 'labyrinthine', 'magnanimous',
    'perspicacity', 'recalcitrant', 'ubiquitous', 'vicarious', 'pulchritude', 'zeitgeist', 'surreptitious',
    'idiosyncrasy', 'sesquipedalian', 'inconsequential', 'circumspect', 'deleterious', 'ephemeral',
    'fastidious', 'grandiloquent', 'hegemony', 'impecunious', 'misanthrope', 'nefarious', 'obfuscate',
    'perfunctory', 'quixotic', 'reprobate', 'sycophant', 'trepidation', 'unconscionable', 'verisimilitude',
    'pusillanimous', 'perspicuous', 'lugubrious', 'mellifluous', 'parsimonious', 'recondite', 'salubrious',
    'supercilious', 'tintinnabulation', 'truculent', 'turgid', 'vacillate', 'venerate', 'vociferous'
  ],
  'tech': [
    'microservices', 'kubernetes', 'distributed', 'concurrency', 'idempotent', 'asynchronous',
    'polymorphism', 'serialization', 'telemetry', 'cryptography', 'immutability', 'eventually',
    'consistency', 'observability', 'throughput', 'backpressure', 'sharding', 'partition',
    'vectorization', 'quantization', 'middleware', 'syntactic', 'composition', 'memoization',
    'containerization', 'orchestration', 'replication', 'decoupling', 'declarative', 'imperative',
    'deterministic', 'interceptor', 'multitenancy', 'normalization', 'benchmarking', 'transpilation',
    'microfrontend', 'websockets', 'hypervisor', 'virtualization', 'idempotency', 'subgraph'
  ]
};

export function getRandomCodeSnippet(lang: CodeLanguage): string {
  const snippets = CODE_LANGUAGE_PRESETS[lang] || CODE_LANGUAGE_PRESETS.typescript;
  return snippets[Math.floor(Math.random() * snippets.length)];
}

export function getRandomVocabWords(pack: WordFrequencyPack, count: number): string {
  const wordList = VOCABULARY_PACKS[pack] || VOCABULARY_PACKS['1k'];
  const shuffled = [...wordList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(' ');
}
