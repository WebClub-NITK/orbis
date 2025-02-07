import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EventForm from './EventForm';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();

  const localFormData = {
    name: '',
    tagline: '',
    about: '',
    type: 'HACKATHON',
    maxParticipants: 100,
    minTeamSize: 1,
    maxTeamSize: 4,
    mode: 'ONLINE',
    status: 'PUBLISHED',
    eventTimeline: {
      eventStart: '',
      eventEnd: '',
      applicationsStart: '',
      applicationsEnd: ''
    },
    eventLinks: [{
      websiteUrl: '',
      micrositeUrl: '',
      contactEmail: '',
      codeOfConductUrl: '',
      socialLinks: null,
    }],
    eventBranding: {
      primaryColor: '#000000',
      accentColor: '#ffffff',
      logo: null,
      banner: null,
      favicon: null
    },
    tracks: [],
    sponsors: [],
    eventPeople: [],
    customQuestions: []
  };

  const apiCall = async (payload) => {
    try {
      // Get fresh token
      const token = await getAccessToken();
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data) {
        navigate(`/events/${response.data.id}`);
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Internal server error');
    }
  };

  return (
    <EventForm
      mode={1} // create mode
      localFormData={localFormData}
      apiCall={apiCall}
    />
  );
};

export default CreateEvent;

