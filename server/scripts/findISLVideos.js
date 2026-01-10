/**
 * Helper script to find and update ISL video URLs
 * 
 * This script helps you find ISL videos and update the database
 * 
 * Usage:
 * 1. Search YouTube for ISL alphabet videos
 * 2. Update the videoMap below with actual video IDs
 * 3. Run: node server/scripts/findISLVideos.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ISLGesture = require('../models/ISLGesture.model');

dotenv.config();

// YouTube video mapping
// Format: { videoId: 'YOUTUBE_VIDEO_ID', startTime: SECONDS }
// Find videos by searching: "Indian Sign Language alphabet tutorial"
const videoMap = {
  // Example structure - replace with actual video IDs
  // You can use one video for all letters (with different start times)
  // Or use separate videos for each letter
  
  // Option 1: Single video with timestamps
  // 'A': { videoId: 'YOUR_VIDEO_ID', startTime: 5 },
  // 'B': { videoId: 'YOUR_VIDEO_ID', startTime: 10 },
  
  // Option 2: Separate videos for each letter
  // 'A': { videoId: 'VIDEO_ID_FOR_A', startTime: 0 },
  // 'B': { videoId: 'VIDEO_ID_FOR_B', startTime: 0 },
};

async function updateVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/isl_translation', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    if (Object.keys(videoMap).length === 0) {
      console.log('⚠️  No videos in videoMap. Please add video IDs first.');
      console.log('\n📝 How to find video IDs:');
      console.log('1. Go to YouTube');
      console.log('2. Search: "Indian Sign Language alphabet tutorial"');
      console.log('3. Copy video ID from URL (after v=)');
      console.log('4. Add to videoMap in this file');
      console.log('\nExample:');
      console.log("'A': { videoId: 'dQw4w9WgXcQ', startTime: 5 },");
      process.exit(0);
    }

    let updated = 0;
    let notFound = 0;

    // Update each gesture with video URL
    for (const [letter, video] of Object.entries(videoMap)) {
      const embedUrl = `https://www.youtube.com/embed/${video.videoId}?start=${video.startTime}`;
      
      const result = await ISLGesture.updateOne(
        { letter: letter.toUpperCase() },
        { 
          $set: { videoUrl: embedUrl }
        }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated ${letter}: ${embedUrl}`);
        updated++;
      } else {
        console.log(`⚠️  Gesture ${letter} not found in database`);
        notFound++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated} gestures`);
    if (notFound > 0) {
      console.log(`⚠️  Not found: ${notFound} gestures`);
    }
    console.log('\n🎉 Video URLs updated successfully!');
    console.log('💡 Restart your app to see the changes.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating videos:', error);
    process.exit(1);
  }
}

// Run the update
updateVideoUrls();

