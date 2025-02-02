import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { user, loginWithRedirect, logout } = useAuth0();
  // const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canCreateEvent = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.mobile-menu-button')) return;
      
      if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleMobileMenuClick = (callback) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 right-0 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-sm py-4' : 'bg-transparent py-6'
    }`}>
      <div className="container-width">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl tracking-tight font-medium z-20">
            <span className="text-black">Orbis</span>
            <span className="text-xs text-gray-400 ml-2">by NITK</span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden z-20 p-2 mobile-menu-button"
          >
            <div className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
            <div className={`w-6 h-0.5 bg-black my-1 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <a href="/#about" className="text-sm text-gray-500 hover:text-black transition-colors tracking-wide">
              About
            </a>
            <Link to="/events" className="text-sm text-gray-500 hover:text-black transition-colors tracking-wide">
              Events
            </Link>
            <a href="/#testimonials" className="text-sm text-gray-500 hover:text-black transition-colors tracking-wide">
              Testimonials
            </a>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>

                {canCreateEvent && (
                  <Button variant="secondary" to="/create-event">Create Event</Button>
                )}
                <Button variant="text" to="/profile">Profile</Button>
                <Button variant="primary" onClick={() => logout({ logoutParams: { returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URI } })}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="text" onClick={ () => loginWithRedirect()}>Login</Button>
                <Button variant="primary" onClick={ () => loginWithRedirect()}>Register</Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div 
            className={`fixed inset-0 bg-white/95 backdrop-blur-md shadow-xl z-10 transition-transform duration-300 md:hidden mobile-menu-container ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col pt-24 px-6 space-y-6 bg-white min-h-screen">
              <a 
                href="/#about" 
                className="text-lg text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => handleMobileMenuClick()}
              >
                About
              </a>
              <Link 
                to="/events" 
                className="text-lg text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => handleMobileMenuClick()}
              >
                Events
              </Link>
              <a 
                href="/#testimonials" 
                className="text-lg text-gray-500 hover:text-black transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => handleMobileMenuClick()}
              >
                Testimonials
              </a>
              
              <div className="pt-6 border-t mt-4">
                {user ? (
                  <div className="space-y-4 p-4">
                    {canCreateEvent && (
                      <Button 
                        variant="secondary" 
                        to="/create-event" 
                        className="w-full bg-white"
                        onClick={() => handleMobileMenuClick()}
                      >
                        Create Event
                      </Button>
                    )}
                    <Button
                      variant="text"
                      to="/profile"
                      className="w-full bg-white hover:bg-gray-50"
                      onClick={() => handleMobileMenuClick()}
                    >
                      Profile
                    </Button>
                    <Button
                      variant="primary" 
                      onClick={() => handleMobileMenuClick(logout)}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    <Button 
                      variant="text" 
                      to="/login" 
                      className="w-full bg-white hover:bg-gray-50"
                      onClick={() => handleMobileMenuClick()}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="primary" 
                      to="/register" 
                      className="w-full"
                      onClick={() => handleMobileMenuClick()}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

