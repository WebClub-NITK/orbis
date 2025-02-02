import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import CreateEvent from './components/CreateEvent';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import EditEvent from './components/EditEvent';


import {useAuth0} from "@auth0/auth0-react";
import axios from "axios";
import PostAuthenticate from "./components/PostAuthenticate.jsx";



const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth0();
  console.log('User:', user);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole) {
    const hasPermission = requiredRole === 'ADMIN' ? 
      (user.role === 'ADMIN' || user.role === 'ORGANIZER') : 
      user.role === requiredRole;
      
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

const App = () => {
  const { user, isLoading} = useAuth0();



  if (isLoading) {
    return null;
  }
  console.log('User:', user);
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
              <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
              <Route path="/create-event" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <CreateEvent />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
      <div className="App min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/authenticate" element={<PostAuthenticate />} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/create-event" element={
              <ProtectedRoute requiredRole="ADMIN">
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
