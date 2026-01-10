/**
 * Text Processing Utilities for ISL Translation
 * Handles normalization, tokenization, and dictionary-based mapping
 */

/**
 * Normalize text input
 * - Removes extra whitespace
 * - Handles punctuation
 * - Converts to uppercase for consistency
 * - Removes special characters that don't affect meaning
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Trim and normalize whitespace
  let normalized = text.trim().replace(/\s+/g, ' ');
  
  // Handle common contractions and abbreviations
  const contractions = {
    "don't": "do not",
    "won't": "will not",
    "can't": "cannot",
    "it's": "it is",
    "I'm": "I am",
    "you're": "you are",
    "we're": "we are",
    "they're": "they are",
    "he's": "he is",
    "she's": "she is",
    "that's": "that is",
    "what's": "what is",
    "who's": "who is",
    "where's": "where is",
    "how's": "how is",
    "let's": "let us",
    "I've": "I have",
    "you've": "you have",
    "we've": "we have",
    "they've": "they have",
    "I'll": "I will",
    "you'll": "you will",
    "we'll": "we will",
    "they'll": "they will",
    "I'd": "I would",
    "you'd": "you would",
    "he'd": "he would",
    "she'd": "she would",
    "we'd": "we would",
    "they'd": "they would"
  };

  // Replace contractions (case-insensitive)
  Object.keys(contractions).forEach(contraction => {
    const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
    normalized = normalized.replace(regex, contractions[contraction]);
  });

  return normalized;
}

/**
 * Tokenize text into words and punctuation
 * Returns array of tokens with metadata
 */
function tokenizeText(text) {
  const normalized = normalizeText(text);
  const tokens = [];
  
  // Split by whitespace and punctuation, but keep punctuation
  const parts = normalized.match(/\b\w+\b|[^\w\s]/g) || [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (/^\w+$/.test(part)) {
      // It's a word
      tokens.push({
        type: 'word',
        value: part.toUpperCase(),
        original: part,
        index: i
      });
    } else if (/^[^\w\s]+$/.test(part)) {
      // It's punctuation
      tokens.push({
        type: 'punctuation',
        value: part,
        original: part,
        index: i
      });
    }
  }
  
  return tokens;
}

/**
 * Common ISL word dictionary
 * Maps common English words to their ISL sign representations
 * This is a simplified dictionary - in production, this would be in a database
 */
const ISL_WORD_DICTIONARY = {
  // Greetings
  'HELLO': { type: 'word', signs: ['H', 'E', 'L', 'L', 'O'], description: 'A friendly greeting' },
  'HI': { type: 'word', signs: ['H', 'I'], description: 'Casual greeting' },
  'GOODBYE': { type: 'word', signs: ['G', 'O', 'O', 'D', 'B', 'Y', 'E'], description: 'Farewell' },
  'BYE': { type: 'word', signs: ['B', 'Y', 'E'], description: 'Casual farewell' },
  
  // Common words
  'YES': { type: 'word', signs: ['Y', 'E', 'S'], description: 'Affirmation' },
  'NO': { type: 'word', signs: ['N', 'O'], description: 'Negation' },
  'PLEASE': { type: 'word', signs: ['P', 'L', 'E', 'A', 'S', 'E'], description: 'Polite request' },
  'THANK': { type: 'word', signs: ['T', 'H', 'A', 'N', 'K'], description: 'Expression of gratitude' },
  'THANKS': { type: 'word', signs: ['T', 'H', 'A', 'N', 'K', 'S'], description: 'Casual thanks' },
  'YOU': { type: 'word', signs: ['Y', 'O', 'U'], description: 'Second person' },
  'WELCOME': { type: 'word', signs: ['W', 'E', 'L', 'C', 'O', 'M', 'E'], description: 'Greeting or response to thanks' },
  
  // Questions
  'WHAT': { type: 'word', signs: ['W', 'H', 'A', 'T'], description: 'Question word' },
  'WHERE': { type: 'word', signs: ['W', 'H', 'E', 'R', 'E'], description: 'Question word' },
  'WHEN': { type: 'word', signs: ['W', 'H', 'E', 'N'], description: 'Question word' },
  'WHO': { type: 'word', signs: ['W', 'H', 'O'], description: 'Question word' },
  'WHY': { type: 'word', signs: ['W', 'H', 'Y'], description: 'Question word' },
  'HOW': { type: 'word', signs: ['H', 'O', 'W'], description: 'Question word' },
  
  // Pronouns
  'I': { type: 'word', signs: ['I'], description: 'First person singular' },
  'ME': { type: 'word', signs: ['M', 'E'], description: 'First person object' },
  'MY': { type: 'word', signs: ['M', 'Y'], description: 'First person possessive' },
  'WE': { type: 'word', signs: ['W', 'E'], description: 'First person plural' },
  'HE': { type: 'word', signs: ['H', 'E'], description: 'Third person masculine' },
  'SHE': { type: 'word', signs: ['S', 'H', 'E'], description: 'Third person feminine' },
  'THEY': { type: 'word', signs: ['T', 'H', 'E', 'Y'], description: 'Third person plural' },
  'IT': { type: 'word', signs: ['I', 'T'], description: 'Third person neuter' },
  
  // Common verbs
  'IS': { type: 'word', signs: ['I', 'S'], description: 'Present tense of be' },
  'AM': { type: 'word', signs: ['A', 'M'], description: 'First person be' },
  'ARE': { type: 'word', signs: ['A', 'R', 'E'], description: 'Plural be' },
  'WAS': { type: 'word', signs: ['W', 'A', 'S'], description: 'Past tense be' },
  'WERE': { type: 'word', signs: ['W', 'E', 'R', 'E'], description: 'Past tense be plural' },
  'HAVE': { type: 'word', signs: ['H', 'A', 'V', 'E'], description: 'To possess' },
  'HAS': { type: 'word', signs: ['H', 'A', 'S'], description: 'Third person have' },
  'HAD': { type: 'word', signs: ['H', 'A', 'D'], description: 'Past tense have' },
  'DO': { type: 'word', signs: ['D', 'O'], description: 'Auxiliary verb' },
  'DOES': { type: 'word', signs: ['D', 'O', 'E', 'S'], description: 'Third person do' },
  'DID': { type: 'word', signs: ['D', 'I', 'D'], description: 'Past tense do' },
  'WILL': { type: 'word', signs: ['W', 'I', 'L', 'L'], description: 'Future tense' },
  'CAN': { type: 'word', signs: ['C', 'A', 'N'], description: 'Ability' },
  'COULD': { type: 'word', signs: ['C', 'O', 'U', 'L', 'D'], description: 'Past ability' },
  'SHOULD': { type: 'word', signs: ['S', 'H', 'O', 'U', 'L', 'D'], description: 'Obligation' },
  'WOULD': { type: 'word', signs: ['W', 'O', 'U', 'L', 'D'], description: 'Conditional' },
  'MAY': { type: 'word', signs: ['M', 'A', 'Y'], description: 'Permission' },
  'MIGHT': { type: 'word', signs: ['M', 'I', 'G', 'H', 'T'], description: 'Possibility' },
  
  // Common nouns
  'NAME': { type: 'word', signs: ['N', 'A', 'M', 'E'], description: 'Personal identifier' },
  'WATER': { type: 'word', signs: ['W', 'A', 'T', 'E', 'R'], description: 'Liquid' },
  'FOOD': { type: 'word', signs: ['F', 'O', 'O', 'D'], description: 'Nourishment' },
  'HELP': { type: 'word', signs: ['H', 'E', 'L', 'P'], description: 'Assistance' },
  'HOME': { type: 'word', signs: ['H', 'O', 'M', 'E'], description: 'Residence' },
  'SCHOOL': { type: 'word', signs: ['S', 'C', 'H', 'O', 'O', 'L'], description: 'Educational institution' },
  'WORK': { type: 'word', signs: ['W', 'O', 'R', 'K'], description: 'Employment' },
  
  // Numbers (as words)
  'ONE': { type: 'word', signs: ['1'], description: 'Number 1' },
  'TWO': { type: 'word', signs: ['2'], description: 'Number 2' },
  'THREE': { type: 'word', signs: ['3'], description: 'Number 3' },
  'FOUR': { type: 'word', signs: ['4'], description: 'Number 4' },
  'FIVE': { type: 'word', signs: ['5'], description: 'Number 5' },
  'SIX': { type: 'word', signs: ['6'], description: 'Number 6' },
  'SEVEN': { type: 'word', signs: ['7'], description: 'Number 7' },
  'EIGHT': { type: 'word', signs: ['8'], description: 'Number 8' },
  'NINE': { type: 'word', signs: ['9'], description: 'Number 9' },
  'TEN': { type: 'word', signs: ['1', '0'], description: 'Number 10' }
};

/**
 * Check if a word exists in the ISL dictionary
 */
function lookupWord(word) {
  const upperWord = word.toUpperCase();
  return ISL_WORD_DICTIONARY[upperWord] || null;
}

/**
 * Convert a word to ISL signs
 * First checks dictionary, then falls back to letter-by-letter
 */
async function wordToISLSigns(word, ISLGesture) {
  // Check dictionary first
  const dictEntry = lookupWord(word);
  if (dictEntry) {
    const signs = [];
    for (const signLetter of dictEntry.signs) {
      const gesture = await ISLGesture.findOne({ letter: signLetter });
      if (gesture) {
        signs.push({
          type: 'letter',
          letter: gesture.letter,
          imageUrl: gesture.imageUrl,
          videoUrl: gesture.videoUrl,
          description: gesture.description,
          source: 'dictionary'
        });
      }
    }
    return {
      signs: signs,
      description: dictEntry.description,
      source: 'dictionary'
    };
  }
  
  // Fall back to letter-by-letter
  const signs = [];
  for (const char of word) {
    if (/[A-Z]/.test(char)) {
      const gesture = await ISLGesture.findOne({ letter: char });
      if (gesture) {
        signs.push({
          type: 'letter',
          letter: gesture.letter,
          imageUrl: gesture.imageUrl,
          videoUrl: gesture.videoUrl,
          description: gesture.description,
          source: 'spelling'
        });
      }
    } else if (/[0-9]/.test(char)) {
      const gesture = await ISLGesture.findOne({ letter: char });
      if (gesture) {
        signs.push({
          type: 'number',
          letter: gesture.letter,
          imageUrl: gesture.imageUrl,
          videoUrl: gesture.videoUrl,
          description: gesture.description,
          source: 'spelling'
        });
      }
    }
  }
  
  return {
    signs: signs,
    description: `Spelled letter by letter: ${word}`,
    source: 'spelling'
  };
}

/**
 * Process text and convert to ISL gesture sequence
 */
async function processTextToISL(text, ISLGesture, ISLPhrase) {
  // First check for exact phrase match
  const normalizedPhrase = normalizeText(text).toUpperCase();
  const phrase = await ISLPhrase.findOne({ 
    phrase: normalizedPhrase 
  });
  
  if (phrase) {
    return {
      type: 'phrase',
      gestures: phrase.signs,
      explanation: phrase.explanation,
      usage: phrase.usage,
      category: phrase.category,
      source: 'phrase_database'
    };
  }
  
  // Tokenize the text
  const tokens = tokenizeText(text);
  const gestures = [];
  const wordInfo = [];
  let currentWord = null;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'word') {
      // Process word
      currentWord = {
        word: token.value,
        startIndex: gestures.length
      };
      
      // Add word start marker
      gestures.push({
        type: 'word-start',
        word: token.value,
        description: `Start of word: ${token.value}`
      });
      
      // Convert word to ISL signs
      const wordResult = await wordToISLSigns(token.value, ISLGesture);
      gestures.push(...wordResult.signs);
      
      currentWord.endIndex = gestures.length - 1;
      currentWord.description = wordResult.description;
      currentWord.source = wordResult.source;
      wordInfo.push(currentWord);
      
    } else if (token.type === 'punctuation') {
      // Handle punctuation
      if (token.value === '?') {
        gestures.push({
          type: 'punctuation',
          letter: 'QUESTION',
          description: 'Question mark - use questioning facial expression'
        });
      } else if (token.value === '!') {
        gestures.push({
          type: 'punctuation',
          letter: 'EXCLAMATION',
          description: 'Exclamation mark - use emphatic expression'
        });
      } else if (token.value === '.') {
        gestures.push({
          type: 'punctuation',
          letter: 'PERIOD',
          description: 'Period - pause briefly'
        });
      } else if (token.value === ',') {
        gestures.push({
          type: 'punctuation',
          letter: 'COMMA',
          description: 'Comma - brief pause'
        });
      }
    }
    
    // Add space between words (but not after punctuation)
    if (i < tokens.length - 1 && token.type === 'word') {
      const nextToken = tokens[i + 1];
      if (nextToken.type === 'word') {
        gestures.push({
          type: 'space',
          letter: 'SPACE',
          description: 'Pause briefly between words'
        });
      }
    }
  }
  
  // Generate explanation
  const explanation = generateExplanation(tokens, wordInfo);
  
  return {
    type: 'text',
    gestures: gestures,
    explanation: explanation,
    wordCount: wordInfo.length,
    wordInfo: wordInfo,
    source: 'text_processing'
  };
}

/**
 * Generate contextual explanation for the translation
 */
function generateExplanation(tokens, wordInfo) {
  const words = tokens.filter(t => t.type === 'word').map(t => t.value);
  const wordCount = words.length;
  const hasQuestion = tokens.some(t => t.type === 'punctuation' && t.value === '?');
  const hasExclamation = tokens.some(t => t.type === 'punctuation' && t.value === '!');
  
  let explanation = '';
  
  if (wordCount === 1) {
    explanation = `Single word: "${words[0]}". Sign this word clearly and hold the gesture for a moment.`;
  } else if (wordCount <= 3) {
    explanation = `Short phrase with ${wordCount} words. Sign each word separately with smooth transitions between them.`;
  } else {
    explanation = `Sentence with ${wordCount} words. In ISL, sign each word clearly, maintaining appropriate facial expressions and body language.`;
  }
  
  // Add context-specific tips
  const lowerText = words.join(' ').toLowerCase();
  
  if (lowerText.includes('help')) {
    explanation += ' Use an urgent facial expression when signing HELP to convey urgency.';
  } else if (lowerText.includes('thank')) {
    explanation += ' Maintain eye contact and smile when expressing gratitude.';
  } else if (lowerText.includes('please')) {
    explanation += ' Use a polite, gentle expression when signing PLEASE.';
  } else if (lowerText.includes('sorry')) {
    explanation += ' Show sincerity with your facial expression when apologizing.';
  }
  
  if (hasQuestion) {
    explanation += ' Remember to use questioning facial expressions (raised eyebrows, head tilt forward).';
  }
  
  if (hasExclamation) {
    explanation += ' Use emphatic facial expressions and stronger movements for emphasis.';
  }
  
  // Add dictionary usage info
  const dictWords = wordInfo.filter(w => w.source === 'dictionary').length;
  const spelledWords = wordInfo.filter(w => w.source === 'spelling').length;
  
  if (dictWords > 0) {
    explanation += ` ${dictWords} word(s) found in ISL dictionary.`;
  }
  if (spelledWords > 0) {
    explanation += ` ${spelledWords} word(s) spelled letter by letter.`;
  }
  
  return explanation;
}

module.exports = {
  normalizeText,
  tokenizeText,
  lookupWord,
  wordToISLSigns,
  processTextToISL,
  generateExplanation,
  ISL_WORD_DICTIONARY
};

