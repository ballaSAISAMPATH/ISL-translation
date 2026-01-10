const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// ISL Phrases Schema
const islPhraseSchema = new mongoose.Schema({
  phrase: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['greeting', 'daily', 'question', 'emotion', 'emergency', 'polite'],
    default: 'daily'
  },
  signs: [{
    word: String,
    imageUrl: String,
    description: String
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  explanation: {
    type: String
  },
  usage: {
    type: String
  }
});

const ISLPhrase = mongoose.model('ISLPhrase', islPhraseSchema);

// Common ISL Phrases with explanations
const commonPhrases = [
  // Greetings
  {
    phrase: "HELLO",
    category: "greeting",
    difficulty: "easy",
    explanation: "A friendly greeting used when meeting someone. Wave your hand with palm facing outward.",
    usage: "Use when meeting someone for the first time or greeting friends.",
    signs: [
      { word: "HELLO", description: "Wave hand with open palm" }
    ]
  },
  {
    phrase: "GOOD MORNING",
    category: "greeting",
    difficulty: "easy",
    explanation: "Morning greeting. Sign 'GOOD' by touching chin, then 'MORNING' with arm rising like sunrise.",
    usage: "Use this greeting before noon.",
    signs: [
      { word: "GOOD", description: "Touch chin with flat hand" },
      { word: "MORNING", description: "Arm rises like sunrise" }
    ]
  },
  {
    phrase: "HOW ARE YOU",
    category: "greeting",
    difficulty: "medium",
    explanation: "Asking about someone's wellbeing. Point forward for 'YOU', make question face.",
    usage: "Use when checking on someone's condition or mood.",
    signs: [
      { word: "HOW", description: "Both hands together, twist" },
      { word: "ARE", description: "Point forward" },
      { word: "YOU", description: "Point to person" }
    ]
  },
  {
    phrase: "THANK YOU",
    category: "polite",
    difficulty: "easy",
    explanation: "Expressing gratitude. Touch chin with flat hand and move forward.",
    usage: "Use to show appreciation or thanks.",
    signs: [
      { word: "THANK", description: "Touch chin, move forward" },
      { word: "YOU", description: "Point to person" }
    ]
  },
  {
    phrase: "PLEASE",
    category: "polite",
    difficulty: "easy",
    explanation: "Making a polite request. Circle flat hand on chest.",
    usage: "Use when asking for something politely.",
    signs: [
      { word: "PLEASE", description: "Circle hand on chest" }
    ]
  },
  {
    phrase: "SORRY",
    category: "polite",
    difficulty: "easy",
    explanation: "Apologizing. Make circular motion with fist on chest.",
    usage: "Use when apologizing or expressing regret.",
    signs: [
      { word: "SORRY", description: "Circle fist on chest" }
    ]
  },
  {
    phrase: "EXCUSE ME",
    category: "polite",
    difficulty: "medium",
    explanation: "Getting attention or apologizing for interruption.",
    usage: "Use when needing to pass by or interrupt politely.",
    signs: [
      { word: "EXCUSE", description: "Brush hand across other hand" },
      { word: "ME", description: "Point to self" }
    ]
  },
  
  // Daily phrases
  {
    phrase: "I NEED HELP",
    category: "emergency",
    difficulty: "medium",
    explanation: "Requesting assistance. Point to self, then make helping gesture.",
    usage: "Use in emergency or when you need assistance.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "NEED", description: "Bent hand moves down" },
      { word: "HELP", description: "Fist on flat palm, raise together" }
    ]
  },
  {
    phrase: "WHERE IS BATHROOM",
    category: "daily",
    difficulty: "medium",
    explanation: "Asking for restroom location. Make 'W' sign and questioning face.",
    usage: "Use when looking for restroom facilities.",
    signs: [
      { word: "WHERE", description: "Point and shake index finger" },
      { word: "IS", description: "Small 'I' sign" },
      { word: "BATHROOM", description: "Shake 'T' hand sign" }
    ]
  },
  {
    phrase: "I AM HUNGRY",
    category: "daily",
    difficulty: "medium",
    explanation: "Expressing hunger. Point to self, then stroke throat downward.",
    usage: "Use when you want to eat or looking for food.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "AM", description: "Move hand forward from mouth" },
      { word: "HUNGRY", description: "Claw hand down chest" }
    ]
  },
  {
    phrase: "I AM THIRSTY",
    category: "daily",
    difficulty: "medium",
    explanation: "Expressing thirst. Point to self, then draw line down throat.",
    usage: "Use when you need water or a drink.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "AM", description: "Move hand forward" },
      { word: "THIRSTY", description: "Draw finger down throat" }
    ]
  },
  {
    phrase: "I UNDERSTAND",
    category: "daily",
    difficulty: "easy",
    explanation: "Confirming comprehension. Point to self, then flick finger from forehead.",
    usage: "Use when you grasp or comprehend something.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "UNDERSTAND", description: "Flick finger from forehead" }
    ]
  },
  {
    phrase: "I DO NOT UNDERSTAND",
    category: "daily",
    difficulty: "medium",
    explanation: "Expressing confusion. Shake head while signing 'NOT UNDERSTAND'.",
    usage: "Use when you need clarification or don't comprehend.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "NOT", description: "Thumb out from chin" },
      { word: "UNDERSTAND", description: "Flick finger from forehead" }
    ]
  },
  
  // Questions
  {
    phrase: "WHAT IS YOUR NAME",
    category: "question",
    difficulty: "medium",
    explanation: "Asking someone's name. Use questioning facial expression.",
    usage: "Use when meeting someone new.",
    signs: [
      { word: "WHAT", description: "Shake index finger side to side" },
      { word: "YOUR", description: "Point forward" },
      { word: "NAME", description: "Two fingers tap together" }
    ]
  },
  {
    phrase: "HOW MUCH",
    category: "question",
    difficulty: "medium",
    explanation: "Asking about price or quantity.",
    usage: "Use when shopping or asking about amounts.",
    signs: [
      { word: "HOW", description: "Both hands together" },
      { word: "MUCH", description: "Fingers together, pull apart" }
    ]
  },
  {
    phrase: "CAN YOU HELP ME",
    category: "question",
    difficulty: "medium",
    explanation: "Politely requesting assistance.",
    usage: "Use when you need help with something.",
    signs: [
      { word: "CAN", description: "Both fists move down" },
      { word: "YOU", description: "Point forward" },
      { word: "HELP", description: "Fist on palm, raise" },
      { word: "ME", description: "Point to self" }
    ]
  },
  
  // Emotions
  {
    phrase: "I AM HAPPY",
    category: "emotion",
    difficulty: "easy",
    explanation: "Expressing happiness. Smile while signing, brush chest upward.",
    usage: "Use when feeling joyful or pleased.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "AM", description: "Move hand forward" },
      { word: "HAPPY", description: "Brush chest upward, twice" }
    ]
  },
  {
    phrase: "I AM SAD",
    category: "emotion",
    difficulty: "easy",
    explanation: "Expressing sadness. Show sad face, hands move down in front of face.",
    usage: "Use when feeling unhappy or down.",
    signs: [
      { word: "I", description: "Point to self" },
      { word: "AM", description: "Move hand forward" },
      { word: "SAD", description: "Hands move down face" }
    ]
  },
  {
    phrase: "I LOVE YOU",
    category: "emotion",
    difficulty: "easy",
    explanation: "Expressing love. Show I-L-Y with hand: thumb, index, and pinky extended.",
    usage: "Use to express affection to loved ones.",
    signs: [
      { word: "I LOVE YOU", description: "Thumb, index, pinky extended" }
    ]
  }
];

async function seedPhrases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/isl_translation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing phrases
    await ISLPhrase.deleteMany({});
    console.log('🗑️  Cleared existing phrases');

    // Insert phrases
    await ISLPhrase.insertMany(commonPhrases);
    console.log('✅ Inserted common ISL phrases');

    console.log('🎉 Phrases seeded successfully!');
    console.log(`📊 Total phrases: ${commonPhrases.length}`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding phrases:', error);
    process.exit(1);
  }
}

seedPhrases();



