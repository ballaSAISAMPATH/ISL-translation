import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Translation from './pages/Translation';
import Learning from './pages/Learning';
import ISLToText from './pages/ISLToText';
import TextToISL from './pages/TextToISL';
import History from './pages/History';
import Learn from './pages/Learn';
import Tutorial from './pages/Tutorial';
import Phrases from './pages/Phrases';
import ImageGuide from './pages/ImageGuide';
import VisualReference from './pages/VisualReference';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Router>
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/translation" element={<ProtectedRoute><Translation /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
          <Route path="/isl-to-text" element={<ProtectedRoute><ISLToText /></ProtectedRoute>} />
          <Route path="/text-to-isl" element={<ProtectedRoute><TextToISL /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
          <Route path="/phrases" element={<ProtectedRoute><Phrases /></ProtectedRoute>} />
          <Route path="/image-guide" element={<ProtectedRoute><ImageGuide /></ProtectedRoute>} />
          <Route path="/visual-reference" element={<ProtectedRoute><VisualReference /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

