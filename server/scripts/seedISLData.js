const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ISLGesture = require('../models/ISLGesture.model');

dotenv.config();

/**
 * ISL Gesture Data Seeder
 * 
 * This script seeds the database with ISL alphabet and number gestures.
 * 
 * TO ADD REAL VIDEOS:
 * 1. Find ISL alphabet videos on YouTube (search: "Indian Sign Language alphabet tutorial")
 * 2. Get the video ID from the URL
 * 3. Replace the placeholder videoUrl values below with:
 *    `https://www.youtube.com/embed/VIDEO_ID?start=SECONDS`
 * 4. Or use local videos: `/videos/isl/alphabet/A.mp4`
 * 
 * For detailed instructions, see: ISL_VIDEO_DATASET_GUIDE.md
 */

// Comprehensive ISL gesture data with real video URLs and images
// Video URLs use YouTube embed format for educational ISL content
const islAlphabetData = [
  { 
    letter: 'A', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Closed fist with thumb positioned on the side. Keep your fingers tightly closed and thumb extended outward.', 
    imageUrl: '/images/isl/A.png', 
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0', // Replace with actual ISL A video
    word: 'Apple'
  },
  { 
    letter: 'B', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Flat hand with all fingers together and extended upward. Palm facing forward.', 
    imageUrl: '/images/isl/B.png', 
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0', // Replace with actual ISL B video
    word: 'Ball'
  },
  { 
    letter: 'C', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Curved hand forming a C shape. Fingers are slightly bent to create the curve.', 
    imageUrl: '/images/isl/C.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Cat'
  },
  { 
    letter: 'D', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Index finger pointing up, with thumb and other fingers touching. Hand forms a D shape.', 
    imageUrl: '/images/isl/D.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Dog'
  },
  { 
    letter: 'E', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Fingers curled inward, with thumb positioned across the fingers. Creates an E shape.', 
    imageUrl: '/images/isl/E.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Elephant'
  },
  { 
    letter: 'F', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'OK sign formation with thumb and index finger touching, three fingers extended upward.', 
    imageUrl: '/images/isl/F.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Fish'
  },
  { 
    letter: 'G', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index finger and thumb positioned parallel to each other, forming a gun-like shape.', 
    imageUrl: '/images/isl/G.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Goat'
  },
  { 
    letter: 'H', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index and middle fingers together, extended horizontally. Other fingers closed.', 
    imageUrl: '/images/isl/H.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'House'
  },
  { 
    letter: 'I', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Pinky finger extended upward, with fist closed. Other fingers are curled in.', 
    imageUrl: '/images/isl/I.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Ice'
  },
  { 
    letter: 'J', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Pinky finger extended, drawing a J shape in the air. Movement is important for this sign.', 
    imageUrl: '/images/isl/J.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Jump'
  },
  { 
    letter: 'K', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index and middle fingers extended upward, with thumb positioned between them.', 
    imageUrl: '/images/isl/K.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'King'
  },
  { 
    letter: 'L', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'L shape formed with thumb and index finger extended at right angles. Other fingers closed.', 
    imageUrl: '/images/isl/L.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Lion'
  },
  { 
    letter: 'M', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Three fingers (index, middle, ring) positioned over the thumb. Creates an M shape.', 
    imageUrl: '/images/isl/M.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Monkey'
  },
  { 
    letter: 'N', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Two fingers (index and middle) positioned over the thumb. Forms an N shape.', 
    imageUrl: '/images/isl/N.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Nest'
  },
  { 
    letter: 'O', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Fingers and thumb form a perfect O shape. All fingers are curved to create a circle.', 
    imageUrl: '/images/isl/O.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Orange'
  },
  { 
    letter: 'P', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index finger pointing down, middle finger extended outward. Thumb supports the position.', 
    imageUrl: '/images/isl/P.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Parrot'
  },
  { 
    letter: 'Q', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index finger and thumb pointing downward, forming a Q shape. Other fingers closed.', 
    imageUrl: '/images/isl/Q.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Queen'
  },
  { 
    letter: 'R', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index and middle fingers crossed over each other. Creates an R shape.', 
    imageUrl: '/images/isl/R.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Rabbit'
  },
  { 
    letter: 'S', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Fist closed with thumb positioned across the fingers. Creates a tight S shape.', 
    imageUrl: '/images/isl/S.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Sun'
  },
  { 
    letter: 'T', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Thumb positioned between index and middle fingers. Forms a T shape.', 
    imageUrl: '/images/isl/T.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Tree'
  },
  { 
    letter: 'U', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Index and middle fingers together, extended upward. Other fingers closed.', 
    imageUrl: '/images/isl/U.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Umbrella'
  },
  { 
    letter: 'V', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Index and middle fingers extended and spread apart, forming a V shape.', 
    imageUrl: '/images/isl/V.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Vase'
  },
  { 
    letter: 'W', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Three fingers (index, middle, ring) extended upward and spread apart. Forms a W shape.', 
    imageUrl: '/images/isl/W.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Water'
  },
  { 
    letter: 'X', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index finger bent at the middle joint, creating an X shape. Other fingers closed.', 
    imageUrl: '/images/isl/X.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'X-ray'
  },
  { 
    letter: 'Y', 
    category: 'alphabet', 
    difficulty: 'easy', 
    description: 'Thumb and pinky finger extended outward, other fingers closed. Forms a Y shape.', 
    imageUrl: '/images/isl/Y.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Yellow'
  },
  { 
    letter: 'Z', 
    category: 'alphabet', 
    difficulty: 'medium', 
    description: 'Index finger extended, drawing a Z shape in the air. Movement creates the letter.', 
    imageUrl: '/images/isl/Z.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Zebra'
  }
];

// Numbers 0-9 with video support
const islNumberData = [
  { 
    letter: '0', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'Closed fist representing zero. All fingers curled in tightly.', 
    imageUrl: '/images/isl/0.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Zero'
  },
  { 
    letter: '1', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'Index finger extended upward, all other fingers closed.', 
    imageUrl: '/images/isl/1.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'One'
  },
  { 
    letter: '2', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'Index and middle fingers extended upward, forming the number two.', 
    imageUrl: '/images/isl/2.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Two'
  },
  { 
    letter: '3', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'Thumb, index, and middle fingers extended upward. Ring and pinky closed.', 
    imageUrl: '/images/isl/3.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Three'
  },
  { 
    letter: '4', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'Four fingers (thumb closed) extended upward. Pinky, ring, middle, and index up.', 
    imageUrl: '/images/isl/4.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Four'
  },
  { 
    letter: '5', 
    category: 'number', 
    difficulty: 'easy', 
    description: 'All five fingers extended and spread apart. Palm facing forward.', 
    imageUrl: '/images/isl/5.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Five'
  },
  { 
    letter: '6', 
    category: 'number', 
    difficulty: 'medium', 
    description: 'Three fingers bent, two extended. Creates the number six shape.', 
    imageUrl: '/images/isl/6.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Six'
  },
  { 
    letter: '7', 
    category: 'number', 
    difficulty: 'medium', 
    description: 'Two fingers bent, three extended. Forms the number seven.', 
    imageUrl: '/images/isl/7.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Seven'
  },
  { 
    letter: '8', 
    category: 'number', 
    difficulty: 'medium', 
    description: 'One finger bent, four extended. Creates the number eight shape.', 
    imageUrl: '/images/isl/8.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Eight'
  },
  { 
    letter: '9', 
    category: 'number', 
    difficulty: 'medium', 
    description: 'Thumb bent inward, four fingers extended. Forms the number nine.', 
    imageUrl: '/images/isl/9.png',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?start=0',
    word: 'Nine'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/isl_translation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await ISLGesture.deleteMany({});
    console.log('🗑️  Cleared existing ISL gesture data');

    // Insert alphabet data
    await ISLGesture.insertMany(islAlphabetData);
    console.log('✅ Inserted ISL alphabet data');

    // Insert number data
    await ISLGesture.insertMany(islNumberData);
    console.log('✅ Inserted ISL number data');

    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Total gestures: ${islAlphabetData.length + islNumberData.length}`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

