// Offline-first mock AI service for the Poetry Writing Companion

export type Emotion = 'sad' | 'hopeful' | 'dark' | 'romantic' | 'angry' | 'peaceful' | 'nostalgic' | 'neutral';

export interface EmotionResult {
  primary: Emotion;
  score: number;
  description: string;
  color: string;
  emoji: string;
}

// ─── Emotion Detection ───────────────────────────────────────────────────────

const EMOTION_KEYWORDS: Record<Emotion, string[]> = {
  sad: ['tears', 'cry', 'lost', 'gone', 'empty', 'pain', 'broken', 'shadow', 'alone', 'grief', 'sorrow', 'weep', 'fade', 'hollow', 'miss', 'ache', 'wither', 'mourn', 'bleed', 'hurt', 'wound', 'numb'],
  hopeful: ['light', 'hope', 'rise', 'bloom', 'new', 'dream', 'bright', 'tomorrow', 'begin', 'morning', 'shine', 'grow', 'heal', 'forward', 'believe', 'wings', 'dawn', 'spring', 'soar', 'open', 'warm'],
  dark: ['death', 'black', 'night', 'fear', 'cold', 'void', 'nothing', 'despair', 'abyss', 'grave', 'decay', 'dread', 'haunt', 'curse', 'bleed', 'haunted', 'ghosts', 'hollow', 'darkness', 'monster'],
  romantic: ['love', 'heart', 'kiss', 'touch', 'hold', 'desire', 'gentle', 'sweet', 'tender', 'longing', 'caress', 'embrace', 'adore', 'cherish', 'whisper', 'soul', 'together', 'beloved', 'passion'],
  angry: ['rage', 'burn', 'hate', 'fury', 'storm', 'thunder', 'break', 'shatter', 'scream', 'fire', 'blaze', 'roar', 'crush', 'defy', 'rebel', 'bitter', 'wrath', 'spite', 'boil', 'snap'],
  peaceful: ['calm', 'still', 'quiet', 'rest', 'peace', 'soft', 'breathe', 'flow', 'serene', 'tranquil', 'ease', 'soothe', 'drift', 'cloud', 'meadow', 'breeze', 'float', 'hush', 'gentle', 'lull'],
  nostalgic: ['remember', 'once', 'past', 'childhood', 'memory', 'old', 'years', 'ago', 'used', 'return', 'long', 'back', 'days', 'faded', 'photograph', 'yesterday', 'before', 'when', 'again', 'reminisce'],
  neutral: [],
};

const EMOTION_META: Record<Emotion, { description: string; color: string; emoji: string }> = {
  sad:       { description: 'Melancholic & sorrowful',  color: '#6b7ab8', emoji: '🌧' },
  hopeful:   { description: 'Uplifting & optimistic',   color: '#f0a500', emoji: '🌅' },
  dark:      { description: 'Intense & shadowy',        color: '#7c5cbf', emoji: '🌑' },
  romantic:  { description: 'Tender & affectionate',    color: '#e05577', emoji: '🌹' },
  angry:     { description: 'Passionate & fierce',      color: '#c0392b', emoji: '🔥' },
  peaceful:  { description: 'Serene & tranquil',        color: '#27ae60', emoji: '🍃' },
  nostalgic: { description: 'Wistful & reflective',     color: '#c8893a', emoji: '📷' },
  neutral:   { description: 'Thoughtful & balanced',    color: '#7f8c8d', emoji: '✨' },
};

export function detectEmotion(text: string): EmotionResult {
  if (!text.trim()) {
    return { primary: 'neutral', score: 0, ...EMOTION_META.neutral };
  }

  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const scores: Record<Emotion, number> = {
    sad: 0, hopeful: 0, dark: 0, romantic: 0,
    angry: 0, peaceful: 0, nostalgic: 0, neutral: 0,
  };

  for (const word of words) {
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [Emotion, string[]][]) {
      if (keywords.includes(word)) scores[emotion]++;
    }
  }

  let maxEmotion: Emotion = 'neutral';
  let maxScore = 0;
  for (const [emotion, score] of Object.entries(scores) as [Emotion, number][]) {
    if (emotion !== 'neutral' && score > maxScore) {
      maxScore = score;
      maxEmotion = emotion as Emotion;
    }
  }

  return {
    primary: maxEmotion,
    score: maxScore,
    description: EMOTION_META[maxEmotion].description,
    color: EMOTION_META[maxEmotion].color,
    emoji: EMOTION_META[maxEmotion].emoji,
  };
}

// ─── Rhyme Suggestions ───────────────────────────────────────────────────────

const RHYME_GROUPS: string[][] = [
  ['light', 'night', 'bright', 'sight', 'flight', 'right', 'might', 'white', 'write', 'kite', 'ignite'],
  ['love', 'above', 'dove', 'of', 'shove'],
  ['dream', 'stream', 'gleam', 'seem', 'beam', 'cream', 'theme', 'extreme'],
  ['heart', 'start', 'art', 'part', 'apart', 'smart', 'chart'],
  ['sky', 'fly', 'cry', 'die', 'by', 'high', 'sigh', 'lie', 'try', 'why', 'defy'],
  ['rain', 'pain', 'vain', 'again', 'chain', 'plain', 'remain', 'strain', 'drain', 'refrain'],
  ['soul', 'whole', 'role', 'toll', 'goal', 'control', 'roll', 'stroll'],
  ['time', 'rhyme', 'climb', 'crime', 'prime', 'sublime', 'dime'],
  ['fire', 'desire', 'inspire', 'wire', 'higher', 'entire', 'expire'],
  ['sea', 'free', 'be', 'me', 'see', 'tree', 'key', 'flee', 'agree', 'plea'],
  ['dark', 'spark', 'mark', 'bark', 'park', 'lark', 'stark', 'embark'],
  ['fall', 'call', 'all', 'wall', 'tall', 'small', 'hall', 'enthrall'],
  ['stone', 'alone', 'bone', 'tone', 'moan', 'groan', 'known', 'own', 'shown', 'phone'],
  ['flower', 'power', 'tower', 'hour', 'shower', 'devour', 'cower'],
  ['moon', 'soon', 'tune', 'bloom', 'room', 'gloom', 'doom', 'loom', 'swoon'],
  ['day', 'way', 'say', 'play', 'stay', 'ray', 'lay', 'pray', 'sway', 'away'],
  ['hold', 'cold', 'bold', 'gold', 'old', 'fold', 'told', 'untold'],
  ['breath', 'death', 'beneath'],
  ['wind', 'find', 'mind', 'blind', 'kind', 'bind', 'behind', 'remind'],
  ['blue', 'true', 'you', 'through', 'new', 'knew', 'grew', 'flew', 'dew', 'hue'],
  ['tears', 'years', 'fears', 'hears', 'nears', 'appears', 'clears'],
  ['deep', 'sleep', 'keep', 'weep', 'seep', 'leap', 'creep'],
  ['end', 'bend', 'friend', 'send', 'blend', 'tend', 'mend'],
  ['voice', 'choice', 'noise', 'rejoice'],
  ['name', 'flame', 'same', 'came', 'blame', 'shame', 'claim', 'frame'],
];

export function suggestRhymes(text: string): string[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  const lastLine = lines[lines.length - 1] ?? '';
  const words = lastLine.trim().split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') ?? '';

  if (!lastWord) return ['light', 'night', 'dream', 'stream', 'sky', 'fly'];

  // Exact group match
  for (const group of RHYME_GROUPS) {
    if (group.includes(lastWord)) {
      return group.filter(w => w !== lastWord).slice(0, 6);
    }
  }

  // Suffix match (last 3 chars)
  if (lastWord.length >= 3) {
    const ending = lastWord.slice(-3);
    const matches = RHYME_GROUPS.flat().filter(w => w.endsWith(ending) && w !== lastWord);
    if (matches.length > 0) return matches.slice(0, 6);
  }

  return ['light', 'night', 'dream', 'sky', 'fire', 'soul'];
}

// ─── Next Line Suggestions ────────────────────────────────────────────────────

const CONTEXTUAL_SUGGESTIONS: Array<{ triggers: string[]; lines: string[] }> = [
  {
    triggers: ['light', 'bright', 'sun', 'shine', 'glow', 'lamp'],
    lines: [
      'But shadows follow where the bright things go',
      'And still the dark finds space beneath the glow',
      'Each beam of light reveals what night has kept',
    ],
  },
  {
    triggers: ['love', 'heart', 'kiss', 'beloved', 'tender'],
    lines: [
      'You are the ache I carry without weight',
      'This love is the map I drew before we met',
      'I could not hold you harder than I try',
    ],
  },
  {
    triggers: ['night', 'dark', 'moon', 'stars', 'shadow', 'dusk'],
    lines: [
      'The moon has heard these words a thousand times',
      'In night\'s deep throat, my name dissolves like smoke',
      'What stars remember, morning will forget',
    ],
  },
  {
    triggers: ['time', 'year', 'day', 'hour', 'moment', 'once'],
    lines: [
      'Time is just a scar that learns to breathe',
      'And years fall soft like leaves no one remembers',
      'How strange that moments outlive what they held',
    ],
  },
  {
    triggers: ['rain', 'storm', 'wind', 'cold', 'winter'],
    lines: [
      'The rain does not ask where it falls to rest',
      'Every storm eventually forgets its name',
      'Cold knows the shape of things it cannot hold',
    ],
  },
  {
    triggers: ['home', 'door', 'room', 'walls', 'house'],
    lines: [
      'A home is just the echo of a name',
      'Every door hides a version of goodbye',
      'The walls absorb what we could not release',
    ],
  },
  {
    triggers: ['death', 'grave', 'end', 'gone', 'last'],
    lines: [
      'There is a grace in letting go of form',
      'Not all that ends was ever meant to stay',
      'The final word is one we never speak',
    ],
  },
  {
    triggers: ['remember', 'memory', 'past', 'before', 'ago'],
    lines: [
      'Memory is a house where no one lives',
      'The past is not behind us — it is in',
      'We carry what we meant to leave behind',
    ],
  },
];

const GENERIC_SUGGESTIONS = [
  'And in the silence, something learned to breathe',
  'The world exhales and doesn\'t ask for more',
  'Between each word, a life lived quietly',
  'I find the spaces where the light leaked in',
  'What grief forgets, the body still recalls',
  'A name dissolves the moment it is said',
  'Like water, I find every downward path',
  'The bones know what the mind has not allowed',
  'We are the sum of all we couldn\'t say',
  'Some doors remain unlocked and still won\'t open',
];

export function suggestNextLines(text: string): string[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length === 0) {
    return [
      'I trace the edges of what\'s left behind',
      'The sky forgot to close its eyes tonight',
      'There is a kind of silence that breathes fire',
    ];
  }

  const lastLine = lines[lines.length - 1].toLowerCase();
  const suggestions: string[] = [];

  for (const { triggers, lines: contextLines } of CONTEXTUAL_SUGGESTIONS) {
    if (triggers.some(t => lastLine.includes(t))) {
      suggestions.push(...contextLines);
      break;
    }
  }

  // Fill remaining with generic suggestions (shuffled)
  const shuffled = [...GENERIC_SUGGESTIONS].sort(() => Math.random() - 0.5);
  for (const line of shuffled) {
    if (suggestions.length >= 3) break;
    if (!suggestions.includes(line)) suggestions.push(line);
  }

  return suggestions.slice(0, 3);
}

// ─── Style Rewrite ────────────────────────────────────────────────────────────

export type WritingStyle = 'shakespearean' | 'modern' | 'haiku';

function toShakespearean(text: string): string {
  return text
    .replace(/\byou\b/gi, 'thee')
    .replace(/\byour\b/gi, 'thy')
    .replace(/\bare\b/gi, 'art')
    .replace(/\bdo not\b/gi, 'dost not')
    .replace(/\bdoes\b/gi, 'doth')
    .replace(/\bhave\b/gi, 'hath')
    .replace(/\bmy\b/gi, 'mine')
    .replace(/\bI will\b/gi, 'I shall')
    .replace(/\bhas\b/gi, 'hath');
}

function toModern(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  return lines
    .map(line => line.toLowerCase().replace(/[,;:!?]+$/, ''))
    .join('\n');
}

function toHaiku(text: string): string {
  const words = text.replace(/\n/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length < 5) return text;
  const l1 = words.slice(0, Math.min(4, words.length)).join(' ');
  const l2 = words.slice(4, Math.min(11, words.length)).join(' ');
  const l3 = words.slice(11, Math.min(15, words.length)).join(' ') || words.slice(-4).join(' ');
  return [l1, l2, l3].filter(Boolean).join('\n');
}

export function rewriteInStyle(text: string, style: WritingStyle): string {
  if (!text.trim()) return text;
  switch (style) {
    case 'shakespearean': return toShakespearean(text);
    case 'modern':        return toModern(text);
    case 'haiku':         return toHaiku(text);
    default:              return text;
  }
}

// ─── Writer's Block Prompts ────────────────────────────────────────────────────

const WRITERS_BLOCK_PROMPTS = [
  'Write about the last time you stood in the rain and felt something shift inside.',
  'Describe a color you\'ve never seen, but have always felt.',
  'What does silence taste like in the mouth of someone who has lost a name?',
  'Write a love letter to a season that left without saying goodbye.',
  'Describe the inside of a clock at 3am when no one is watching.',
  'Write about a door that was never opened — and what waits behind it.',
  'Speak in the voice of the last star before morning swallows it whole.',
  'Write about what hands remember that the mind forgets.',
  'Describe the weight of an apology that was never said out loud.',
  'What does home smell like to someone who has forgotten their mother tongue?',
  'Write about a photograph that lies.',
  'Describe the moment just before something beautiful breaks.',
  'Write to your younger self — but in the language of weather.',
  'What does grief look like when it finally learns to dance?',
  'Write about the space between two heartbeats, and what lives there.',
  'Describe a place that only exists in the hour before you wake.',
  'What would your shadow say about you, if shadows could speak?',
  'Write about the sound of something ending that nobody noticed.',
  'Describe the last word in a language that no one speaks anymore.',
  'Write about a light that isn\'t sunlight — one that comes from within.',
];

export function getWritersBlockPrompt(): string {
  return WRITERS_BLOCK_PROMPTS[Math.floor(Math.random() * WRITERS_BLOCK_PROMPTS.length)];
}

// ─── Writing Insights ─────────────────────────────────────────────────────────

export interface WritingInsights {
  wordCount: number;
  lineCount: number;
  avgWordsPerLine: number;
  longestLine: string;
  mostUsedWords: string[];
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'that', 'this', 'be', 'have', 'do', 'not', 'as', 'by', 'from']);

export function analyzeWriting(text: string): WritingInsights {
  const lines = text.split('\n').filter(l => l.trim());
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lineCount = lines.length;
  const avgWordsPerLine = lineCount > 0 ? Math.round(wordCount / lineCount) : 0;
  const longestLine = lines.reduce((a, b) => a.length >= b.length ? a : b, '');

  const freq: Record<string, number> = {};
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      freq[word] = (freq[word] ?? 0) + 1;
    }
  }
  const mostUsedWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return { wordCount, lineCount, avgWordsPerLine, longestLine, mostUsedWords };
}
