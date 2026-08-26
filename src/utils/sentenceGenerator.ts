// Procedural Dynamic Sentence & Passage Generator for TypePulse

const NOUNS_EASY = [
  "dog", "cat", "bird", "tree", "river", "mountain", "sun", "moon", "star", "flower",
  "book", "house", "garden", "cloud", "ocean", "forest", "friend", "window", "morning",
  "breeze", "path", "village", "song", "light", "shadow", "stone", "water", "fire",
  "road", "dream", "voice", "smile", "heart", "story", "island", "journey", "rain"
];

const NOUNS_MEDIUM = [
  "algorithm", "architecture", "discovery", "perspective", "ecosystem", "frequency",
  "dimension", "strategy", "mechanism", "phenomenon", "innovation", "velocity",
  "hypothesis", "revolution", "atmosphere", "momentum", "intelligence", "framework",
  "equilibrium", "complexity", "constellation", "civilization", "trajectory", "symphony"
];

const NOUNS_HARD = [
  "epistemology", "juxtaposition", "metamorphosis", "concurrency", "cryptography",
  "superposition", "determinism", "asynchrony", "synchronicity", "photosynthesis",
  "neuroplasticity", "entropy", "singularity", "quintessence", "hermeneutics"
];

const ADJECTIVES_EASY = [
  "gentle", "warm", "bright", "quiet", "green", "happy", "calm", "fresh", "golden",
  "sweet", "soft", "brave", "clear", "cool", "deep", "kind", "pure", "quick", "safe",
  "silent", "small", "swift", "wild", "young", "free", "lovely", "peaceful"
];

const ADJECTIVES_MEDIUM = [
  "sophisticated", "dynamic", "luminous", "intriguing", "resilient", "harmonious",
  "versatile", "meticulous", "expansive", "coherent", "profound", "deliberate",
  "spontaneous", "pragmatic", "innovative", "vibrant", "eloquent", "persistent"
];

const ADJECTIVES_HARD = [
  "idiosyncratic", "ephemeral", "quintessential", "ubiquitous", "ineffable",
  "multidimensional", "heterogeneous", "deterministic", "incongruous", "transcendent"
];

const VERBS_PAST = [
  "illuminated", "transformed", "discovered", "navigated", "inspired", "whispered",
  "unfolded", "echoed", "surpassed", "empowered", "awakened", "cultivated", "traversed",
  "balanced", "harmonized", "generated", "revealed", "accelerated", "strengthened"
];

const VERBS_PRESENT = [
  "shapes", "guides", "creates", "enhances", "inspires", "reveals", "amplifies",
  "uncovers", "balances", "captures", "transforms", "accelerates", "connects",
  "navigates", "cultivates", "strengthens", "empowers", "transcends", "harmonizes"
];

const CONNECTORS = [
  "while observing the horizon",
  "across the vast landscapes of time",
  "with remarkable clarity and precision",
  "through continuous practice and patience",
  "underneath a canopy of shifting stars",
  "in the pursuit of deeper understanding",
  "opening new pathways for discovery",
  "bringing harmony to the surrounding world",
  "unveiling hidden patterns in the flow of life",
  "empowering the mind to reach higher potential"
];

const TEMPLATES_EASY = [
  "The {adj_e} {noun_e} {verb_past} the {noun_e} {connector}.",
  "Every {noun_e} brings a {adj_e} feeling to the {noun_e}.",
  "A {adj_e} breeze moved across the {noun_e} as morning arrived.",
  "She watched the {adj_e} {noun_e} dance quietly in the {noun_e}.",
  "Simple thoughts and a {adj_e} heart make every journey joyful.",
  "The {noun_e} was {adj_e} and full of warm light.",
  "Walking along the {adj_e} path, they discovered a quiet {noun_e}."
];

const TEMPLATES_MEDIUM = [
  "Modern {noun_m} {verb_pres} the way we perceive {noun_m} {connector}.",
  "A {adj_m} approach to {noun_m} enables us to overcome intricate challenges.",
  "When {noun_m} meets {adj_m} design, extraordinary breakthroughs occur.",
  "Understanding the {adj_m} nature of {noun_m} requires persistent curiosity and focus.",
  "The rapid evolution of {noun_m} has {verb_past} our global {noun_m}.",
  "By combining {adj_m} principles with practical execution, new possibilities emerge.",
  "Every {adj_m} system seeks equilibrium amid continuous change and growth."
];

const TEMPLATES_HARD = [
  "The {adj_h} implications of {noun_h} fundamentally challenge conventional {noun_m}.",
  "In theoretical {noun_m}, {noun_h} {verb_pres} the boundary between order and chaos.",
  "Navigating {adj_h} systems demands a synthesis of {noun_h} and {adj_m} heuristics.",
  "Quantum {noun_h} and computational {noun_m} converge to unlock non-linear problem solving.",
  "The {adj_h} architecture {verb_past} the fundamental constraints of modern {noun_m}."
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSentence(difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): string {
  let template = '';
  if (difficulty === 'Easy') {
    template = pickRandom(TEMPLATES_EASY);
  } else if (difficulty === 'Hard') {
    template = pickRandom(TEMPLATES_HARD);
  } else {
    template = pickRandom(TEMPLATES_MEDIUM);
  }

  return template.replace(/\{(\w+)\}/g, (_, key) => {
    switch (key) {
      case 'adj_e': return pickRandom(ADJECTIVES_EASY);
      case 'adj_m': return pickRandom(ADJECTIVES_MEDIUM);
      case 'adj_h': return pickRandom(ADJECTIVES_HARD);
      case 'noun_e': return pickRandom(NOUNS_EASY);
      case 'noun_m': return pickRandom(NOUNS_MEDIUM);
      case 'noun_h': return pickRandom(NOUNS_HARD);
      case 'verb_past': return pickRandom(VERBS_PAST);
      case 'verb_pres': return pickRandom(VERBS_PRESENT);
      case 'connector': return pickRandom(CONNECTORS);
      default: return '';
    }
  });
}

export function generateRandomPassage(sentenceCount = 3, difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(difficulty));
  }
  return sentences.join(' ');
}
