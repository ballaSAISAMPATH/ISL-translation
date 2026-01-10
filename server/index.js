const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/isl_translation', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth.routes');
const translationRoutes = require('./routes/translation.routes');
const historyRoutes = require('./routes/history.routes');
const islDataRoutes = require('./routes/islData.routes');
const phrasesRoutes = require('./routes/phrases.routes');
const communityValidationRoutes = require('./routes/community_validation.routes');

app.use('/api/auth', authRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/isl-data', islDataRoutes);
app.use('/api/phrases', phrasesRoutes);
app.use('/api/community', communityValidationRoutes);

// ML Service Proxy Routes (Flask - MediaPipe based)
app.use('/api/ml', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ml': ''
  },
  onError: (err, req, res) => {
    console.error('ML Service Proxy Error:', err);
    res.status(500).json({ 
      error: 'ML service is not available',
      message: 'Please start the ML service on port 5001'
    });
  }
}));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ISL Translation Server is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('👤 New client connected:', socket.id);

  socket.on('gesture-frame', async (data) => {
    try {
      // Emit back to the client with prediction
      socket.emit('gesture-prediction', {
        gesture: data.prediction,
        confidence: data.confidence,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing gesture:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('👤 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

