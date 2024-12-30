import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // This block of code stores the initalization of all the state variables (fields and entries) in the form
  const [formData, setFormData] = useState({
    name: '',
    type: 'HACKATHON',
    tagline: '',
    about: '',
    maxParticipants: '',
    minTeamSize: '1',
    maxTeamSize: '4',
    eventTimeline: {
      eventStart: '',
      eventEnd: '',
      applicationsStart: '',
      applicationsEnd: '',
      timezone: 'UTC',
      rsvpDeadlineDays: 7
    },
    eventLinks: {
      websiteUrl: '',
      micrositeUrl: '',
      contactEmail: '',
      codeOfConductUrl: '',
      socialLinks: {}
    },
    eventBranding: {
      brandColor: '#000000',
      logoUrl: '',
      faviconUrl: '',
      coverImageUrl: ''
    },
    tracks: [
      {
        name: '',
        description: '',
        prizes: [
          {
            title: '',
            description: '',
            value: 0
          }
        ]
      }
    ],
    sponsors: [
      {
        name: '',
        logoUrl: '',
        websiteUrl: '',
        tier: 'GOLD'
      }
    ],
    eventPeople: [
      {
        name: '',
        role: 'JUDGE',
        bio: '',
        imageUrl: '',
        linkedinUrl: ''
      }
    ]
  });

  // This block of code changes the state of the form data when the user types in the input fields
  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    if (section) {
      setFormData(prevState => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [name]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // This block of code changes the state of the form data when the user types in the input fields of an array
  const handleArrayChange = (e, section, index, subSection = null, subIndex = null) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      const newArray = [...prevState[section]];
      if (subSection) {
        newArray[index] = {
          ...newArray[index],
          [subSection]: newArray[index][subSection].map((item, idx) =>
            idx === subIndex ? { ...item, [name]: value } : item
          )
        };
      } else {
        newArray[index] = { ...newArray[index], [name]: value };
      }
      return { ...prevState, [section]: newArray };
    });
  };

  const addArrayItem = (section) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: [...prevState[section], {}]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: prevState[section].filter((_, i) => i !== index)
    }));
  };

  const addTrack = () => {
    setFormData(prevState => ({
      ...prevState,
      tracks: [...prevState.tracks, {
        name: '',
        description: '',
        prizes: [{ title: '', description: '', value: '0' }]
      }]
    }));
  };

  const addPrizeToTrack = (trackIndex) => {
    setFormData(prevState => {
      const newTracks = [...prevState.tracks];
      newTracks[trackIndex].prizes.push({ title: '', description: '', value: '0' });
      return { ...prevState, tracks: newTracks };
    });
  };

  // This block of code stores the errors in the form validation
  const [errorsInValidation, setErrorsInValidation] = useState('');
  const validateForm = (data) => {
    let validationErrors = {};

    if(!data.name || data.name.trim().length < 3) {
      validationErrors.name = 'Event name is required (minimum 3 characters).';
    }
    if (!data.eventTimeline.eventStart || data.eventTimeline.eventStart.trim() === '') {
      validationErrors.eventStart = 'Event start date is required.';
    }
    if (!data.eventTimeline.eventEnd || data.eventTimeline.eventEnd.trim() === '') {
      validationErrors.eventEnd = 'Event end date is required.';
    }
    if (!data.eventTimeline.applicationsStart || data.eventTimeline.applicationsStart.trim() === '') {
      validationErrors.applicationsStart = 'Applications start date is required.';
    }
    if (!data.eventTimeline.applicationsEnd || data.eventTimeline.applicationsEnd.trim() === '') {
      validationErrors.applicationsEnd = 'Applications end date is required.';
    }
    if (!data.eventLinks.contactEmail || !data.eventLinks.contactEmail.trim().includes('@')) {
      validationErrors.contactEmail = 'Contact email is required and must be a valid email address.';
    }
    if(data.sponsors && Array.isArray(data.sponsors)) {
      data.sponsors.forEach((sponsor, index) => {
        // If a sponsor logo or website URL is provided, a name is required
        if((sponsor.logoUrl || sponsor.websiteUrl) && !sponsor.name) {
          validationErrors[`sponsors[${index}].name`] = 'Sponsor name is required if a sponsor logo or website URL is provided.';
        }
      });
    }
    if(data.eventPeople && Array.isArray(data.eventPeople)) {
      data.eventPeople.forEach((person, index) => {
        // If an event person exists, a name is required
        if(person.name && person.name.trim().length === 0) {
          validationErrors[`eventPeople[${index}].name`] = 'Event person name is required.';
        }
        // If details of a event person is provided, the person name is required
        if((person.bio || person.imageUrl || person.linkedinUrl) && !person.name) {
          validationErrors[`eventPeople[${index}].name`] = 'Event person name is required if details of a event person is provided.';
        }
      });
    }
    if (data.tracks && Array.isArray(data.tracks)) {
      data.tracks.forEach((track, index) => {
        // If a track exists, it must have a valid name (minimum 3 characters)
        if (track.name && track.name.trim().length >= 0 && track.name.trim().length < 3) {
          validationErrors[`tracks[${index}].name`] = 'Track name must be at least 3 characters if provided.';
        }
        // If a track description is provided, a name is required
        if (track.description && !track.name) {
          validationErrors[`tracks[${index}].name`] = 'Track name is required if a track description is provided.';
        }
        if (track.prizes && Array.isArray(track.prizes)) {
          track.prizes.forEach((prize, prizeIndex) => {
            const { title, description, value } = prize;
            if ((description.trim().length !== 0 || value) && (!title || title.trim().length === 0)) {
              // If prize details are given, prize name is required
              validationErrors[`tracks[${index}].prizes[${prizeIndex}].title`] =
                'Prize title is required if description or quantity is provided.';
            }
          });
        }
      });
    }
    
    return validationErrors;
  };

  // This block of code sends the form data to the backend to create a new event
  const handleSubmit = async (e) => {

    e.preventDefault();
    const ValidationError = validateForm(formData);
    setErrorsInValidation(ValidationError);
    
    if (!formData.name || formData.name.trim().length < 3) {
      return;
    }
    if (!formData.eventTimeline.eventStart || formData.eventTimeline.eventStart.trim() === '') {
      return;
    }
    if (!formData.eventTimeline.eventEnd || formData.eventTimeline.eventEnd.trim() === '') {
      return;
    }
    if (!formData.eventTimeline.applicationsStart || formData.eventTimeline.applicationsStart.trim() === '') {
      return;
    }
    if (!formData.eventTimeline.applicationsEnd || formData.eventTimeline.applicationsEnd.trim() === '') {
      return;
    }
    if (!formData.eventLinks.contactEmail || !formData.eventLinks.contactEmail.trim().includes('@')) {
      return;
    }
    if (formData.sponsors && Array.isArray(formData.sponsors)) {
      for (let i = 0; i < formData.sponsors.length; i++) {
        const sponsor = formData.sponsors[i];
        // If a sponsor logo or website URL is provided, a name is required.
        if ((sponsor.logoUrl || sponsor.websiteUrl) && !sponsor.name) {
          return;
        }
      }
    }
    if(formData.eventPeople && Array.isArray(formData.eventPeople)) {
      for (let i = 0; i < formData.eventPeople.length; i++) {
        const person = formData.eventPeople[i];
        // If an event person exists, a name is required
        if (person.name && person.name.trim().length === 0) {
          return;
        }
        // If details of a event person is provided, the person name is required
        if ((person.bio || person.imageUrl || person.linkedinUrl) && !person.name) {
          if (!person.name) {
            return;
          }
        }
      }
    }
    if (formData.tracks && Array.isArray(formData.tracks)) {
      for (let i = 0; i < formData.tracks.length; i++) {
        const track = formData.tracks[i];
        // If a track exists, it must have a valid name (minimum 3 characters)
        if (track.name && track.name.trim().length >= 0 && track.name.trim().length < 3) {
          return;
        }
        // If a track description is provided, a name is required
        if (track.description && !track.name) {
          return;
        }
        if (track.prizes && Array.isArray(track.prizes)) {
          for (let j = 0; j < track.prizes.length; j++) {
            const prize = track.prizes[j];
            const { title, description, value } = prize;
            // If description or quantity exists, prize title must also be valid
            if ((description.trim().length !== 0 || value) && (!title || title.trim().length === 0)) {
              return;
            }
          }
        }
      }
    }
    

    // Sanitize form data into a structured payload before sending the API request
    const payload = {
      name: formData.name,     // Event name is a mandatory field
      type: formData.type,
      tagline: formData.tagline || null,
      about: formData.about || null, 
      maxParticipants: parseInt(formData.maxParticipants, 10) || null,
      minTeamSize: parseInt(formData.minTeamSize, 10) || null,
      maxTeamSize: parseInt(formData.maxTeamSize, 10) || null,
      eventTimeline: {         // Event timeline is a mandatory field
        eventStart: new Date(formData.eventTimeline.eventStart).toISOString(),
        eventEnd: new Date(formData.eventTimeline.eventEnd).toISOString(),
        applicationsStart: new Date(formData.eventTimeline.applicationsStart).toISOString(),
        applicationsEnd: new Date(formData.eventTimeline.applicationsEnd).toISOString(),
        timezone: formData.eventTimeline.timezone,
        rsvpDeadlineDays: parseInt(formData.eventTimeline.rsvpDeadlineDays, 10) || 0
      },
      ...(formData.eventLinks.contactEmail && {
        eventLinks: {
          websiteUrl: formData.eventLinks.websiteUrl || null,
          micrositeUrl: formData.eventLinks.micrositeUrl || null,
          contactEmail: formData.eventLinks.contactEmail,       // Contact email is a mandatory field
          codeOfConductUrl: formData.eventLinks.codeOfConductUrl || null
        }
      }),
      eventBranding: {
        brandColor: formData.eventBranding.brandColor,
        logoUrl: formData.eventBranding.logoUrl || null,
        faviconUrl: formData.eventBranding.faviconUrl || null,
        coverImageUrl: formData.eventBranding.coverImageUrl || null
      },
      eventPeople: formData.eventPeople
      .filter(person => person.name || person.bio || person.imageUrl || person.linkedinUrl)       // Event people are optional, but if provided, persons name must be present
      .map(person => ({
        name: person.name?.trim(),       
        role: person.role,
        bio: person.bio || null,
        imageUrl: person.imageUrl || null,
        linkedinUrl: person.linkedinUrl || null,
      })),
      sponsors: formData.sponsors
      .filter(sponsor => sponsor.name || sponsor.logoUrl || sponsor.websiteUrl)       // Sponsors are optional, but if provided, each sponsor must have a name
      .map(sponsor => ({
        name: sponsor.name.trim(),
        logoUrl: sponsor.logoUrl || null,
        websiteUrl: sponsor.websiteUrl || null,
        tier: sponsor.tier ?? "GOLD"
      })
      ),
      tracks: formData.tracks
      .filter(track => {
      const hasTrackDetails = track.name.trim() !== '' || track.description.trim() !== '';
      const hasPrizes = track.prizes && track.prizes.some(prize => 
        prize.title.trim() !== '' || prize.description.trim() !== '' || prize.value != 0
      );

      // Include the track if it has either track details or valid prizes
      return hasTrackDetails || hasPrizes;
    })
    .map(track => ({
      ...track,
      description: track.description.trim() !== '' ? track.description : null,
      prizes: track.prizes
        .filter(prize => prize.title.trim() !== '' || prize.description.trim() !== '' || prize.value != 0)  // If any details of a prize is provided, only then considered
        .map(prize => ({
          ...prize,
          description: prize.description.trim() !== '' ? prize.description : null,
          value: parseInt(prize.value, 10) || 0
        }))
    }))

    };

    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, payload, { withCredentials: true });
      console.log('Event created:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.response?.data?.error || 'An error occurred while creating the event. Please try again.');
    }
  };

  // To switch between different modules in the create event page
  const [toggle, setToggle] = useState(1);
  function updateToggle(id) {
    setToggle(id)
  }

  //shows the content only if fieldIndex is equal to the toggle value
  const fieldStyle = (fieldIndex) => ({
    display: toggle === fieldIndex ? 'block' : 'none',
  });

  // Increments toggle variable by 1 when the button is clicked
  const handleClick = async (e) => {
    e.preventDefault();
    setToggle(toggle + 1); 
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const removeTrack = (trackIndex) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tracks: prevFormData.tracks.filter((_, index) => index !== trackIndex),
    }));
  };

  const removePrize = (trackIndex, prizeIndex) => {
    setFormData((prevFormData) => {
      const updatedTracks = [...prevFormData.tracks];
      updatedTracks[trackIndex].prizes = updatedTracks[trackIndex].prizes.filter(
        (_, index) => index !== prizeIndex
      );
      return { ...prevFormData, tracks: updatedTracks };
    });
  };
  
  const removePerson = (index) => {
    removeArrayItem('eventPeople', index);
  };
  
  // This block of code returns the form to be displayed on the page (every element is a part of the form)
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 mt-2">Create Event</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <ul className="hidden md:flex justify-center items-center space-x-4 border-b border-gray-300">
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 1 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(1)}>
              Details
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 2 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(2)}>
              Timeline
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 3 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(3)}>
              Links and Branding
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 4 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(4)}>
              Tracks and Prizes
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 5 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(5)}>
              Sponsors
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 6 
              ? 'text-blue-500 border-blue-500 font-medium' 
              : 'text-gray-500 hover:text-gray-600 border-transparent'}`}
            onClick={() => updateToggle(6)}>
              People
          </li>
        </ul>
        {/* Navigation bar for small screens */}
        <div className="w-full overflow-x-auto border-b border-gray-300 pb-3 md:hidden">
          <ul className="md:hidden flex justify-start items-center space-x-2">
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 1 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(1)}>
              Details
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 2 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(2)}>
              Timeline
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 3 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(3)}>
              Links
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 4 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(4)}>
              Prizes
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 5 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(5)}>
              Sponsors
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 6 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(6)}>
              People
            </li>
          </ul>
        </div>  

        <div style={fieldStyle(1)}>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="HACKATHON">Hackathon</option>
            <option value="GENERAL_EVENT">General Event</option>
          </select>
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline</label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4" style={fieldStyle(1)}>
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(1)}>
            <label htmlFor="minTeamSize" className="block text-sm font-medium text-gray-700 mt-5">Min Team Size</label>
            <input
              type="number"
              id="minTeamSize"
              name="minTeamSize"
              value={formData.minTeamSize}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(1)}>
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mt-5">Max Team Size</label>
            <input
              type="number"
              id="maxTeamSize"
              name="maxTeamSize"
              value={formData.maxTeamSize}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 mt-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(2)}>
          <h3 className="text-lg font-medium text-gray-700">Event Timeline</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventStart" className="block text-sm font-medium text-gray-700">Event Start</label>
              <input
                type="datetime-local"
                id="eventStart"
                name="eventStart"
                value={formData.eventTimeline.eventStart}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="eventEnd" className="block text-sm font-medium text-gray-700">Event End</label>
              <input
                type="datetime-local"
                id="eventEnd"
                name="eventEnd"
                value={formData.eventTimeline.eventEnd}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="applicationsStart" className="block text-sm font-medium text-gray-700">Applications Start</label>
              <input
                type="datetime-local"
                id="applicationsStart"
                name="applicationsStart"
                value={formData.eventTimeline.applicationsStart}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="applicationsEnd" className="block text-sm font-medium text-gray-700">Applications End</label>
              <input
                type="datetime-local"
                id="applicationsEnd"
                name="applicationsEnd"
                value={formData.eventTimeline.applicationsEnd}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div style={fieldStyle(2)}>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              type="text"
              id="timezone"
              name="timezone"
              value={formData.eventTimeline.timezone}
              onChange={(e) => handleChange(e, 'eventTimeline')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(2)}>
            <label htmlFor="rsvpDeadlineDays" className="block text-sm font-medium text-gray-700">RSVP Deadline (days before event)</label>
            <input
              type="number"
              id="rsvpDeadlineDays"
              name="rsvpDeadlineDays"
              value={formData.eventTimeline.rsvpDeadlineDays}
              onChange={(e) => handleChange(e, 'eventTimeline')}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleClick}>
            Next
          </button>
        </div>
        

        <div className="space-y-4" style={fieldStyle(3)}>
          <h3 className="text-lg font-medium text-gray-700">Event Links</h3>
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.eventLinks.websiteUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="micrositeUrl" className="block text-sm font-medium text-gray-700">Microsite URL</label>
            <input
              type="url"
              id="micrositeUrl"
              name="micrositeUrl"
              value={formData.eventLinks.micrositeUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.eventLinks.contactEmail}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="codeOfConductUrl" className="block text-sm font-medium text-gray-700">Code of Conduct URL</label>
            <input
              type="url"
              id="codeOfConductUrl"
              name="codeOfConductUrl"
              value={formData.eventLinks.codeOfConductUrl}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4" style={fieldStyle(3)}>
          <h3 className="text-lg font-medium text-gray-700">Event Branding</h3>
          <div>
            <label htmlFor="brandColor" className="block text-sm font-medium text-gray-700">Brand Color</label>
            <input
              type="color"
              id="brandColor"
              name="brandColor"
              value={formData.eventBranding.brandColor}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">Logo URL</label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.eventBranding.logoUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700">Favicon URL</label>
            <input
              type="url"
              id="faviconUrl"
              name="faviconUrl"
              value={formData.eventBranding.faviconUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.eventBranding.coverImageUrl}
              onChange={(e) => handleChange(e, 'eventBranding')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(4)}>
          <div className="flex items-center justify-between space-x-4">
            <h3 className="text-lg font-medium text-gray-700">Tracks & Prizes</h3>
            <button
              type="button"
              onClick={addTrack}
              className="mt-2 text-blue-500 border border-blue-500 bg-white rounded-md p-2 hover:bg-blue-500 hover:text-white"
            >
              Add new Track
            </button>
          </div>

          {formData.tracks.map((track, trackIndex) => (
            <div key={trackIndex} className="border p-4 rounded">
              <div className="flex items-center justify-between space-x-4">
                <input
                  type="text"
                  value={track.name}
                  onChange={(e) => handleArrayChange(e, 'tracks', trackIndex)}
                  name="name"
                  placeholder="Track Name"
                  className="input-field rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />

                <button
                  type="button"
                  onClick={() => removeTrack(trackIndex)}
                  className="mt-2 text-red-500 hover:text-red-600"
                >
                  Remove this Track
                </button>
              </div>
              <textarea
                value={track.description}
                onChange={(e) => handleArrayChange(e, 'tracks', trackIndex)}
                name="description"
                placeholder="Track Description"
                className="input-field mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              
              <div className="mt-4">
                <h4 className="font-medium">Prizes for this track</h4>
                {track.prizes.map((prize, prizeIndex) => (
                  <div key={prizeIndex} className="mt-2 flex flex-col sm:flex-row sm:space-x-4 md:space-x-6">
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="title"
                      placeholder="Prize Title"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={prize.description}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="description"
                      placeholder="Prize Description"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <input
                      type="number"
                      value={prize.value}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="value"
                      placeholder="Prize Value"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => removePrize(trackIndex, prizeIndex)}
                      className="mt-2 text-red-500 border border-red-500 bg-white hover:bg-red-500 hover:text-white rounded-md p-2 w-1/2 sm:w-1/3 md:w-1/6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPrizeToTrack(trackIndex)}
                  className="mt-4 text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
                >
                  Add more prizes
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(5)}>
          <h3 className="text-lg font-medium text-gray-700">Sponsors</h3>
          {formData.sponsors.map((sponsor, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                value={sponsor.name}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="name"
                placeholder="Sponsor Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.logoUrl}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="logoUrl"
                placeholder="Sponsor Logo URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.websiteUrl}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="websiteUrl"
                placeholder="Sponsor Website URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button type="button" onClick={() => removeArrayItem('sponsors', index)} className="text-red-500 hover:text-red-600">
                Remove Sponsor
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('sponsors')} className="text-blue-500 hover:text-blue-600">
            Add Sponsor
          </button>
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(6)}>
          <h3 className="text-lg font-medium text-gray-700">Event People</h3>
          {formData.eventPeople.map((person, index) => (
            <div key={index} className="border p-4 rounded">
              <input
                type="text"
                value={person.name}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="name"
                placeholder="Name"
                className="input-field w-1/3 mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <select
                value={person.role}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="role"
                className="input-field mt-2 w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="JUDGE">Judge</option>
                <option value="SPEAKER">Speaker</option>
              </select>
              <textarea
                value={person.bio}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="bio"
                placeholder="Bio"
                className="input-field mt-2 w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={person.imageUrl}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="imageUrl"
                placeholder="Image URL"
                className="input-field mt-2 w-1/3 mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={person.linkedinUrl}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="linkedinUrl"
                placeholder="LinkedIn URL"
                className="input-field mt-2 w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => removePerson(index)}
                className="block mt-4 text-red-500 border border-red-500 bg-white rounded-md p-2 hover:bg-red-500 hover:text-white"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('eventPeople')}
            className="mt-4 text-blue-500 border border-blue-500 rounded-md p-2 hover:bg-blue-500 hover:text-white"
          >
            Add new Person
          </button>
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" style={fieldStyle(6)}>
          Create Event
        </button>

        {/* This block of code displays the validation errors on the form */}
        <div>
        <div className="space-y-2">
          {errorsInValidation.name && <span className="text-red-500 block">{errorsInValidation.name}</span>}
          {errorsInValidation.eventStart && <span className="text-red-500 block">{errorsInValidation.eventStart}</span>}
          {errorsInValidation.eventEnd && <span className="text-red-500 block">{errorsInValidation.eventEnd}</span>}
          {errorsInValidation.applicationsStart && <span className="text-red-500 block">{errorsInValidation.applicationsStart}</span>}
          {errorsInValidation.applicationsEnd && <span className="text-red-500 block">{errorsInValidation.applicationsEnd}</span>}
          {errorsInValidation.contactEmail && <span className="text-red-500 block">{errorsInValidation.contactEmail}</span>}
          {/* Track Validation Errors */}
          {formData.tracks &&
            formData.tracks.map((track, index) => (
              <div key={index}>
                {errorsInValidation[`tracks[${index}].name`] && (
                  <span className="text-red-500 block">
                    Track {index + 1}: {errorsInValidation[`tracks[${index}].name`]}
                  </span>
                )}
                {track.prizes &&
                  track.prizes.map((prize, prizeIndex) => (
                    <div key={prizeIndex}>
                      {errorsInValidation[`tracks[${index}].prizes[${prizeIndex}].title`] && (
                        <span className="text-red-500 block">
                          Track {index + 1}, Prize {prizeIndex + 1}: {errorsInValidation[`tracks[${index}].prizes[${prizeIndex}].title`]}
                        </span>
                      )}    
                    </div>
                  ))}
              </div>
            ))}
          {/* Sponsor Validation Errors */}
          {formData.sponsors &&
            formData.sponsors.map((sponsor, index) => (
              <div key={index}>
                {errorsInValidation[`sponsors[${index}].name`] && (
                  <span className="text-red-500 block">
                    Sponsor {index + 1}: {errorsInValidation[`sponsors[${index}].name`]}
                  </span>
                )}
              </div>
            ))}
          {/* Event Person Validation Errors */}
          {formData.eventPeople &&
            formData.eventPeople.map((person, index) => (
              <div key={index}>
                {errorsInValidation[`eventPeople[${index}].name`] && (
                  <span className="text-red-500 block">
                    Event Person {index + 1}: {errorsInValidation[`eventPeople[${index}].name`]}
                  </span>
                )}
              </div>
            ))}
        </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;

