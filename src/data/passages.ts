import { generateRandomPassage } from '../utils/sentenceGenerator';

export interface QuoteItem {
  text: string;
  author: string;
}

export const QUOTES_COLLECTION: QuoteItem[] = [
  {
    text: "The speed of human thought should never be bounded by the friction of a keyboard.",
    author: "Jashwanth Dwaram"
  },
  {
    text: "Mastery is not about hitting keys faster, but eliminating the hesitations between them.",
    author: "Jashwanth Dwaram"
  },
  {
    text: "Focus is a muscle. The more you train your keystrokes to follow thought without hesitation, the more boundless your craft becomes.",
    author: "Jashwanth Dwaram"
  },
  {
    text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: "Steve Jobs"
  },
  {
    text: "Simplicity is prerequisite for reliability. Complex systems always fail in complex, unexpected ways.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "Talk is cheap. Show me the code. Software design is about making choices that balance clarity, speed, and maintainability.",
    author: "Linus Torvalds"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light. Knowledge and perseverance conquer all obstacles.",
    author: "Aristotle"
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit cultivated through disciplined practice.",
    author: "Will Durant"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    text: "In the middle of difficulty lies opportunity. Keep moving forward and never let self-doubt dictate your limits.",
    author: "Albert Einstein"
  },
  {
    text: "Sometimes it is the people no one can imagine anything of who do the things no one can imagine.",
    author: "Alan Turing"
  },
  {
    text: "The most dangerous phrase in the language is, we've always done it this way.",
    author: "Grace Hopper"
  },
  {
    text: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "The present is theirs; the future, for which I really worked, is mine.",
    author: "Nikola Tesla"
  },
  {
    text: "That brain of mine is something more than merely mortal; as time will show.",
    author: "Ada Lovelace"
  },
  {
    text: "Premature optimization is the root of all evil in programming.",
    author: "Donald Knuth"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  },
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
    author: "Bill Gates"
  },
  {
    text: "There are only two hard things in Computer Science: cache invalidation and naming things.",
    author: "Phil Karlton"
  },
  {
    text: "Controlling complexity is the essence of computer programming.",
    author: "Brian Kernighan"
  },
  {
    text: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson"
  },
  {
    text: "The function of good software is to make the complex appear to be simple.",
    author: "Grady Booch"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha"
  },
  {
    text: "An unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    text: "The secret of getting ahead is getting started. The secret of getting started is breaking your complex tasks into small manageable tasks.",
    author: "Mark Twain"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Everything should be made as simple as possible, but not simpler.",
    author: "Albert Einstein"
  },
  {
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan"
  },
  {
    text: "The first principle is that you must not fool yourself, and you are the easiest person to fool.",
    author: "Richard Feynman"
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie"
  },
  {
    text: "If I have seen further it is by standing on the shoulders of Giants.",
    author: "Isaac Newton"
  },
  {
    text: "To know that we know what we know, and that we do not know what we do not know, that is true knowledge.",
    author: "Nicolaus Copernicus"
  },
  {
    text: "I have no special talents. I am only passionately curious.",
    author: "Albert Einstein"
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca"
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus"
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius"
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt"
  },
  {
    text: "It always seems impossible until it is done.",
    author: "Nelson Mandela"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
    author: "Bruce Lee"
  },
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry"
  },
  {
    text: "Knowing is not enough; we must apply. Willing is not enough; we must do.",
    author: "Johann Wolfgang von Goethe"
  },
  {
    text: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius"
  },
  {
    text: "Courage is resistance to fear, mastery of fear, not absence of fear.",
    author: "Mark Twain"
  },
  {
    text: "You will never do anything in this world without courage. It is the greatest quality of the mind next to honor.",
    author: "Aristotle"
  },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius"
  },
  {
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "If you cannot do great things, do small things in a great way.",
    author: "Napoleon Hill"
  },
  {
    text: "The mind is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch"
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "In the end, it is not the years in your life that count. It is the life in your years.",
    author: "Abraham Lincoln"
  },
  {
    text: "Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist.",
    author: "Stephen Hawking"
  },
  {
    text: "For small creatures such as we the vastness is bearable only through love.",
    author: "Carl Sagan"
  },
  {
    text: "Nature uses only the longest threads to weave her patterns, so each small piece reveals the organization of the entire tapestry.",
    author: "Richard Feynman"
  },
  {
    text: "The best thing about a boolean is even if you are wrong, you are only off by a bit.",
    author: "Anonymous"
  },
  {
    text: "Simplicity is about subtracting the obvious and adding the meaningful.",
    author: "John Maeda"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    text: "Fix the cause, not the symptom.",
    author: "Steve Maguire"
  },
  {
    text: "Optimism is an occupational hazard of programming: feedback is the treatment.",
    author: "Kent Beck"
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman"
  },
  {
    text: "The function of wisdom is to discriminate between good and evil.",
    author: "Cicero"
  },
  {
    text: "Wisdom begins in wonder.",
    author: "Socrates"
  },
  {
    text: "Patience is bitter, but its fruit is sweet.",
    author: "Jean-Jacques Rousseau"
  },
  {
    text: "Happiness depends upon ourselves.",
    author: "Aristotle"
  },
  {
    text: "Turn your wounds into wisdom.",
    author: "Oprah Winfrey"
  },
  {
    text: "What we achieve inwardly will change outer reality.",
    author: "Plutarch"
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi"
  },
  {
    text: "If you want to shine like the sun, first burn like the sun.",
    author: "A.P.J. Abdul Kalam"
  },
  {
    text: "A person who never made a mistake never tried anything new.",
    author: "Albert Einstein"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson"
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "Stay hungry. Stay foolish.",
    author: "Stewart Brand"
  },
  {
    text: "To invent, you have to experiment, and if you know in advance that it's going to work, it's not an experiment.",
    author: "Jeff Bezos"
  },
  {
    text: "The art of programming is the art of organizing complexity.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "Any sufficiently advanced technology is indistinguishable from magic.",
    author: "Arthur C. Clarke"
  },
  {
    text: "The purpose of computing is insight, not numbers.",
    author: "Richard Hamming"
  },
  {
    text: "Computer science is no more about computers than astronomy is about telescopes.",
    author: "Edsger W. Dijkstra"
  },
  {
    text: "There is nothing permanent except change.",
    author: "Heraclitus"
  },
  {
    text: "He who conquers himself is the mightiest warrior.",
    author: "Confucius"
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca"
  },
  {
    text: "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
    author: "Marcus Aurelius"
  },
  {
    text: "The journey of a thousand miles begins beneath one's feet.",
    author: "Lao Tzu"
  },
  {
    text: "In three words I can sum up everything I've learned about life: it goes on.",
    author: "Robert Frost"
  },
  {
    text: "Do not let what you cannot do interfere with what you can do.",
    author: "John Wooden"
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates"
  },
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes"
  },
  {
    text: "Flow state is reached when your fingers type at the rhythm of pure consciousness.",
    author: "Jashwanth Dwaram"
  }
];

export const WEB_PASSAGES = {
  Easy: [
    "The quick brown fox jumps over the lazy dog every morning.",
    "A small cup of warm tea can brighten any rainy afternoon.",
    "Sunlight filtered gently through the green leaves in the park.",
    "Music filled the quiet room as the children began to dance.",
    "She loved to read books by the warm fire during cold winter nights.",
    "The gentle sound of falling rain brings peace to a busy day.",
    "Walking through the quiet forest, they found a clear blue lake.",
    "Fresh bread from the local bakery smelled delicious in the morning air.",
    "Stars twinkled brightly in the dark night sky above the sleepy town.",
    "A faithful friend is a strong shelter in times of stormy weather.",
    "Birds sang cheerful songs from the high branches of the old oak tree.",
    "The golden sun set slowly behind the rolling hills in the west.",
    "Laughter echoed across the playground as the games continued until dusk.",
    "He kept a small notebook in his pocket to write down new ideas.",
    "The sweet fragrance of spring flowers filled the open meadow.",
    "Summer breezes carried the quiet whisper of waves crashing on the shore.",
    "The cat curled up comfortably on the soft rug by the sunny window.",
    "A warm smile can make a great difference in someone's day.",
    "They packed a basket of fruit and sandwiches for a sunny picnic in the garden.",
    "The morning mist slowly cleared as the sun climbed higher in the blue sky.",
    "Crisp autumn leaves rustled gently beneath their feet as they walked down the trail.",
    "The old clock on the wooden wall ticked steadily through the quiet evening.",
    "She planted tiny seeds in the garden and watered them carefully every day.",
    "A flock of wild geese flew south in a neat V-shape across the sunset.",
    "The library was warm and inviting on a cold, snowy December afternoon.",
    "Children built sandcastles along the edge of the shallow ocean tide.",
    "He brewed fresh coffee as the first light of dawn filled the kitchen.",
    "The gentle river flowed smoothly around smooth stones and fallen branches.",
    "Bright yellow butterflies fluttered happily around the blooming roses.",
    "A soothing melody played softly on the radio in the background."
  ],
  Medium: [
    "Software engineering is the systematic approach to the development, operation, and maintenance of software systems with high reliability.",
    "Learning to type without looking at the keyboard is called touch typing. It significantly boosts your productivity and mental focus.",
    "Data analysis allows us to uncover hidden patterns, correlations, and insights from raw datasets to make informed strategic decisions.",
    "The ocean covers more than seventy percent of the Earth's surface, holding ninety-seven percent of our planet's total water supply.",
    "Curiosity is the engine of intellectual growth, driving individuals to ask deeper questions and discover innovative solutions.",
    "Mastery in any craft comes from deliberate practice, where one focuses on weak points and embraces constructive feedback.",
    "Artificial intelligence models process vast amounts of unstructured data to generate predictions and automate complex tasks.",
    "The human brain contains approximately eighty-six billion neurons, each forming thousands of synaptic connections with neighbors.",
    "Clean code reads like well-written prose, making architectural intent obvious to collaborators and future maintainers.",
    "Renewable energy technologies like solar photovoltaics and offshore wind turbines are essential for a sustainable future.",
    "Effective communication requires active listening, empathy, and the ability to articulate complex thoughts with clarity.",
    "Space exploration expands our scientific horizons and challenges human ingenuity to solve unprecedented engineering hurdles.",
    "Consistency over long periods produces compounding returns in skill development, knowledge acquisition, and physical fitness.",
    "Building scalable web applications requires thoughtful caching strategies, database indexing, and asynchronous job processing.",
    "The transition from monolithic architectures to microservices introduces new challenges in distributed tracing and telemetry.",
    "Deep work is the ability to focus without distraction on a cognitively demanding task, producing high-value output.",
    "Cryptographic algorithms protect digital privacy by ensuring that sensitive information remains tamper-proof across networks.",
    "Biomechanical ergonomics in typing emphasizes neutral wrist alignment, relaxed shoulders, and fluid finger movements.",
    "Continuous integration pipelines automatically build, test, and validate software changes to ensure zero regression in production.",
    "Iterative design cycles rely on rapid prototyping, user feedback, and measurable performance analytics to refine interfaces.",
    "Memory management in modern runtimes combines garbage collection with static ownership models to prevent memory leaks.",
    "Cognitive endurance increases when tasks are broken down into focused sprints separated by brief recovery intervals.",
    "Modern browsers employ multi-process architectures to isolate tabs, improving stability and security across domains.",
    "High-velocity typing requires muscle memory automation so the conscious brain can focus purely on sentence formulation."
  ],
  Hard: [
    "In asynchronous programming (e.g., Python asyncio or JavaScript Promises), non-blocking I/O operations achieve concurrency without multi-threading overhead.",
    "Quantum computing leverages superposition and entanglement phenomena (qubits: 0 & 1) to solve intractable polynomial-time algorithmic problems.",
    "Cryptographic hash functions like SHA-256 (Secure Hash Algorithm 256-bit) map arbitrary-length binary inputs to deterministic 64-character hexadecimal digests.",
    "Microservices architectures decouple monolithic systems into autonomous, loosely coupled services communicating via REST APIs or gRPC protocols.",
    "The algorithmic complexity of matrix multiplication scales from O(N^3) standard naive implementations down to O(N^2.37) using Strassen-like optimizations.",
    "Epistemological inquiries investigate the nature, origin, and scope of human knowledge, distinguishing justified belief from mere opinion.",
    "Distributed consensus protocols, such as Paxos and Raft, ensure state-machine replication across fault-tolerant nodes in decentralized networks.",
    "Neuroplasticity enables the central nervous system to dynamically reorganize its neural pathways in response to novel cognitive stimuli and physical trauma.",
    "Zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs) allow one party to prove ownership of a statement without disclosing the underlying payload.",
    "Byzantine fault tolerance guarantees system reliability in adversarial environments where individual nodes may fail arbitrarily or transmit conflicting data.",
    "Vectorized SIMD (Single Instruction, Multiple Data) processor registers accelerate matrix transformations and neural network inference by orders of magnitude.",
    "Functional purity enforces referential transparency, eliminating hidden state mutations and simplifying deterministic parallel execution.",
    "Garbage collection algorithms, such as generational mark-and-sweep or reference counting with cycle detection, balance pause-times with throughput.",
    "Formal verification utilizes mathematical proofs to guarantee that mission-critical aerospace and financial software complies with specifications."
  ],
  Code: [
    "const calculateWpm = (chars: number, seconds: number): number => {\n  if (seconds <= 0) return 0;\n  return Math.round(((chars / 5) / (seconds / 60)) * 10) / 10;\n};",
    "export function useTypingEngine(target: string) {\n  const [typed, setTyped] = useState('');\n  const [startTime, setStartTime] = useState(null);\n  return { typed, startTime };\n}",
    "def bubble_sort(arr: list[int]) -> list[int]:\n  n = len(arr)\n  for i in range(n):\n    for j in range(0, n - i - 1):\n      if arr[j] > arr[j + 1]:\n        arr[j], arr[j + 1] = arr[j + 1], arr[j]\n  return arr",
    "async function fetchTelemetry(endpoint: string): Promise<Response> {\n  try {\n    return await fetch(endpoint);\n  } catch (err) {\n    throw new Error('Telemetry network failure');\n  }\n}",
    "type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };",
    "pub fn binary_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {\n    arr.binary_search(target).ok()\n}",
    "const debounce = <F extends (...args: any[]) => any>(fn: F, ms: number) => {\n  let t: any;\n  return (...args: Parameters<F>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };\n};"
  ],
  Quotes: QUOTES_COLLECTION.map(q => q.text),
  'N-Grams': [
    "th er on in an he nd re ed to it ha is ou ea at ve st ws qu op ui py lk jm",
    "the and ing ion ent tha for tis thi ive ote with you out have from they some",
    "tion ment ence able ible ight ould ound ough ence ation form port sign struct",
    "tr br cr dr fr gr pr str scr spr thr phr chr sch tw dw sw sm sn sp st",
    "al ar er or ur an en in on un at et it ot ut as es is os us ad ed id od ud",
    "ch sh th wh ph gh tch dge ng nk qu wr kn gn ps rh pt mn pn",
    "con dis pro pre per sub sur tra trans inter intra super semi under over counter"
  ]
};

// 400+ Common Typing Words for Sprint Mode
export const SPRINT_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you",
  "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one",
  "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some",
  "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "great", "between", "need", "large", "under", "both", "every", "never", "same", "another",
  "while", "last", "might", "sound", "below", "something", "thought", "few", "those", "always", "show", "large", "often",
  "together", "ask", "house", "world", "place", "such", "point", "home", "small", "end", "follow", "found", "study", "still",
  "learn", "should", "america", "line", "right", "too", "mean", "old", "any", "same", "tell", "boy", "follow", "came",
  "want", "show", "also", "around", "farm", "three", "small", "set", "put", "end", "does", "another", "well", "large",
  "must", "big", "even", "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need", "land", "different",
  "home", "us", "move", "try", "kind", "hand", "picture", "again", "change", "off", "play", "spell", "air", "away", "animal",
  "house", "point", "page", "letter", "mother", "answer", "found", "study", "still", "learn", "should", "world",
  "stream", "horizon", "velocity", "cadence", "focus", "rhythm", "signal", "pulse", "vector", "matrix", "beacon", "circuit",
  "quantum", "neural", "biomechanics", "friction", "latency", "keystroke", "kinetic", "equilibrium", "frequency", "buffer",
  "system", "engine", "precision", "mastery", "flow", "dynamo", "synthesizer", "spectrum", "terminal", "algorithm"
];

// Helper to get random quote with author
export function getRandomQuote(): QuoteItem {
  return QUOTES_COLLECTION[Math.floor(Math.random() * QUOTES_COLLECTION.length)];
}

// Helper to get either a curated passage or procedurally generated sentence
export function getRandomPassage(difficulty: 'Easy' | 'Medium' | 'Hard' | 'Quotes' | 'Code' | 'N-Grams' | 'Dynamic'): string {
  if (difficulty === 'Dynamic') {
    return generateRandomPassage(2 + Math.floor(Math.random() * 2), 'Medium');
  }
  
  if (difficulty === 'Quotes') {
    return getRandomQuote().text;
  }

  if (difficulty === 'Easy' || difficulty === 'Medium' || difficulty === 'Hard') {
    if (Math.random() < 0.4) {
      return generateRandomPassage(difficulty === 'Easy' ? 2 : difficulty === 'Hard' ? 3 : 2, difficulty);
    }
  }

  const list = WEB_PASSAGES[difficulty] || WEB_PASSAGES.Medium;
  return list[Math.floor(Math.random() * list.length)];
}
