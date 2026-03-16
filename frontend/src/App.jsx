import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Translation from './pages/Translation';
import Learning from './pages/Learning';
import TextToISL from './pages/TextToISL';
import History from './pages/History';
import Learn from './pages/Learn';
import Tutorial from './pages/Tutorial';
import Phrases from './pages/Phrases';
import ImageGuide from './pages/ImageGuide';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Context
import ISLTrainer from './pages/ISLTrainer';
import ISLPredictor from './pages/ISLPredictor';
import Chatbot from './pages/Chatbot';
import axios from 'axios';
import { useSelector } from 'react-redux';

 function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const email = useSelector((state)=>state.counter.user_email)
  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post("http://localhost:4000/auth/verify", { token,email, });      
        console.log(res.data);
          
        if (!res.data.tokenExpired) {
          if(res.data.userMatched) setValid(true);
        }           
      } catch (err) {
        setValid(false);
      }
      setLoading(false);
    };

    verify();
  }, []);

  if (loading) return <div>Loading...</div>;

  return valid ? children : <Navigate to="/login" />;
}

function AppContent() {

  return (
    <div className="App">
      <Router>
        {<Navbar />}
        <Routes>
          <Route path="/login" element={ <Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/translation" element={<ProtectedRoute><Translation /></ProtectedRoute>} />
          <Route path="/train" element={<ProtectedRoute><ISLTrainer /></ProtectedRoute>} />
          <Route path="/isl-to-text" element={<ProtectedRoute><ISLPredictor /></ProtectedRoute>} />
          <Route path="/text-to-isl" element={<ProtectedRoute><TextToISL /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
          <Route path="/phrases" element={<ProtectedRoute><Phrases /></ProtectedRoute>} />
          <Route path="/image-guide" element={<ProtectedRoute><ImageGuide /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </Router>
      <Chatbot/>
    </div>
  );
}

function App() {
  return (
      <AppContent />
  );
}

export default App;

