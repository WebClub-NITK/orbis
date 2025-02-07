import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { uploadImage } from '../helpers/images';

const EventForm = ({
    mode,
    localFormData,
    apiCall
    }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // This block of code stores the initalization of all the state variables (fields and entries) in the form
  const [formData, setFormData] = useState({
    ...localFormData,
    customQuestions: localFormData.customQuestions || [],
    eventBranding: {
      ...localFormData.eventBranding,
      logo: null,  // Initialize as null
      banner: null // Initialize as null
    }
  });
  console.log(formData);

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

  const handleCheckboxChange = (e, group, field) => {
    const { checked } = e.target;
  
    setFormData((prevState) => {
      const applicationForm = typeof prevState.applicationForm === 'object' && prevState.applicationForm !== null
        ? { ...prevState.applicationForm }
        : {};
  
      applicationForm[field] = checked;
  
      return {
        ...prevState,
        applicationForm,
      };
    });
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
      [section]: section === "eventPeople"
        ? [...prevState[section], { role: 'JUDGE' }]
        : [...prevState[section], {}]
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

  // Validations before creating a published event
  const createValidationErrorHandling  = (data) => {
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
            if (( (description && description.trim().length !== 0) || parseInt(value)) && (!title || title.trim().length === 0)) {
              // If prize details are given, prize name is required
              validationErrors[`tracks[${index}].prizes[${prizeIndex}].title`] =
                'Prize title is required if description or quantity is provided.';
            }
          });
        }
      });
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrorsInValidation(validationErrors);
      return false;
    } else {
      return true;
    }
  };

  // Validations before creating a draft
  const draftValidationErrorHandling = () => {
    const validationError = {};
      if (!formData.name || formData.name.trim().length < 3) {
        validationError.name = 'Event name is required for a draft (minimum 3 characters).';
      }
      if (Object.keys(validationError).length > 0) {
        setErrorsInValidation(validationError);
        return false;
      } else {
        return true;
      }
  }

  // This block of code sends the form data to the backend to create a new event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const eventPayload = {
        ...formData,
        status: 'PUBLISHED',
        eventTimeline: {
          eventStart: new Date(formData.eventTimeline.eventStart).toISOString(),
          eventEnd: new Date(formData.eventTimeline.eventEnd).toISOString(),
          applicationsStart: new Date(formData.eventTimeline.applicationsStart).toISOString(),
          applicationsEnd: new Date(formData.eventTimeline.applicationsEnd).toISOString()
        }
      };

      await apiCall(eventPayload);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to create event');
    }
  };

  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const eventPayload = {
        ...formData,
        status: 'DRAFT',
        eventTimeline: {
          eventStart: new Date(formData.eventTimeline.eventStart).toISOString(),
          eventEnd: new Date(formData.eventTimeline.eventEnd).toISOString(),
          applicationsStart: new Date(formData.eventTimeline.applicationsStart).toISOString(),
          applicationsEnd: new Date(formData.eventTimeline.applicationsEnd).toISOString()
        }
      };

      await apiCall(eventPayload);
    } catch (error) {
      console.error('Error saving draft:', error);
      setError(error.message || 'Failed to save draft');
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
  

  const [dragActive, setDragActive] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // File size limit in bytes
  const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB

  // Generalized handle file change function
  const handleFileChange = async (e, type) => {
    console.log(type);
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE_LIMIT) {
        setErrorMessage("File size exceeds 2MB. Please upload a smaller file.");
        return;
      }
      setErrorMessage(""); // Clear any previous error messages
      console.log(selectedFile);
      const {filePath, publicUrl, bucket} = await uploadImage(selectedFile);
      console.log("yo1");
      setFormData((prevState) => ({
        ...prevState,
        eventBranding: {
          ...prevState.eventBranding,
          [`${type}`]: {
            filePath: filePath,
            bucket: bucket,
            publicUrl: publicUrl,
          }
        },
      }));
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    setDragActive(false);
    console.log(type);
    const droppedFile = e.dataTransfer.files[0];
    console.log(droppedFile);
    if (droppedFile) {
      if (droppedFile.size > FILE_SIZE_LIMIT) {
        setErrorMessage("File size exceeds 2MB. Please upload a smaller file.");
        return;
      }
      setErrorMessage(""); // Clear any previous error messages
      const {filePath, publicUrl, bucket} = await uploadImage(droppedFile);
      console.log("yo2");
      setFormData((prevState) => ({
        ...prevState,
        eventBranding: {
          ...prevState.eventBranding,
          [`${type}`]: {
            filePath: filePath,
            bucket: bucket,
            publicUrl: publicUrl,
          }
        },
      }));
    }
  };


  // Reusable component for input field styling
  const inputFieldStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50";

  // Generalized handle remove image function
  const handleRemoveImage = (type) => {
    setFormData((prevState) => ({
      ...prevState,
      eventBranding: {
        ...prevState.eventBranding,
        [`${type}`]: {
          filePath: '',
          bucket: '',
          publicUrl: '',
        }
      },
    }));
    setErrorMessage(""); // Clear error message on remove
  };

  // Add this function to safely get image URLs
  const getImageUrl = (image) => {
    if (!image) return '';
    return typeof image === 'string' ? image : image.publicUrl || '';
  };

  // This block of code returns the form to be displayed on the page (every element is a part of the form)
  return (
    <div className="bg-gray-100 py-12 pb-8">
    <div className="w-[70%] mx-auto mt-14 px-10 py-8 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold mb-4 mt-2">{mode === 1 ? 'Create Event' : 'Edit Event'}</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <ul className="hidden md:flex justify-center items-center space-x-3">
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 1 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(1)}>
              Details
          </li>
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 2 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(2)}>
              Timeline
          </li>
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 3 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(3)}>
              Links &amp; Branding
          </li>
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 4 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(4)}>
              Track Prizes
          </li>
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 5 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(5)}>
              Sponsors
          </li>
          <li
            className={`px-6 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 6 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(6)}>
              People
          </li>
          <li
            className={`px-4 py-2 cursor-pointer text-base border-b-2 font-medium text-center
            ${toggle === 7 
              ? 'text-black border-black font-medium' 
              : 'text-gray-500 hover:text-gray-600'}`}
            onClick={() => updateToggle(7)}>
              Application
          </li>
        </ul>
        {/* Navigation bar for small screens */}
        <div className="w-full overflow-x-auto border-b border-gray-300 pb-3 md:hidden">
          <ul className="md:hidden flex justify-start items-center space-x-2">
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border  
              ${toggle === 1 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(1)}>
              Details
            </li>
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 2 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(2)}>
              Timeline
            </li>
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 3 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(3)}>
              Links
            </li>
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border  
              ${toggle === 4 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(4)}>
              Prizes
            </li>
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 5 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(5)}>
              Sponsors
            </li>
            <li
              className={`px-6 py-2 cursor-pointer text-base font-medium text-center rounded-full border
              ${toggle === 6 
              ? 'text-white font-medium bg-black border-black' 
              : 'text-gray-500 border-gray-200 shadow-sm hover:text-white hover:bg-black hover:border-black'}`}
              onClick={() => updateToggle(6)}>
              People
            </li>
            <li
              className={`px-5 py-1 cursor-pointer text-base font-medium text-center rounded-full border 
              ${toggle === 7 
              ? 'text-blue-500 border-blue-500 bg-blue-50' 
              : 'text-gray-500 hover:text-gray-600 hover:border-gray-600 border-gray-200 shadow-sm'}`}
              onClick={() => updateToggle(7)}>
              Application
            </li>
          </ul>
        </div>  

        <div style={fieldStyle(1)}>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={inputFieldStyle}
          />
        </div>

        <div style={fieldStyle(1)}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value="HACKATHON">Hackathon</option>
            <option value="GENERAL_EVENT">General Event</option>
          </select>
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700">Event Mode</label>
          <select
            id="mode"
            name="mode"
            value={formData.mode} 
            onChange={handleChange}
            className={inputFieldStyle}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">Tagline</label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            value={formData.tagline || ''}
            onChange={handleChange}
            className={inputFieldStyle}
          />
        </div>

        <div style={fieldStyle(1)}>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
          <textarea
            id="about"
            name="about"
            value={formData.about || ''}
            onChange={handleChange}
            rows="4"
            className={inputFieldStyle}
          ></textarea>
        </div>

        <div className="grid grid-cols-3 gap-4" style={fieldStyle(1)}>
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants || ''}
              onChange={handleChange}
              min="0"
              className={inputFieldStyle}
            />
          </div>
          <div style={fieldStyle(1)}>
            <label htmlFor="minTeamSize" className="block text-sm font-medium text-gray-700 mt-5">Min Team Size</label>
            <input
              type="number"
              id="minTeamSize"
              name="minTeamSize"
              value={formData.minTeamSize || 1}
              onChange={handleChange}
              min="1"
              className={inputFieldStyle}
            />
          </div>
          <div style={fieldStyle(1)}>
            <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mt-5">Max Team Size</label>
            <input
              type="number"
              id="maxTeamSize"
              name="maxTeamSize"
              value={formData.maxTeamSize || 4}
              onChange={handleChange}
              min="1"
              className={inputFieldStyle}
            />
          </div>
          <button className="btn-primary mt-6 flex ml-auto !py-2.5" onClick={handleClick}>
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
                value={formData.eventTimeline.eventStart || ''}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className={inputFieldStyle}
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="eventEnd" className="block text-sm font-medium text-gray-700">Event End</label>
              <input
                type="datetime-local"
                id="eventEnd"
                name="eventEnd"
                value={formData.eventTimeline.eventEnd || ''}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className={inputFieldStyle}
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="applicationsStart" className="block text-sm font-medium text-gray-700">Applications Start</label>
              <input
                type="datetime-local"
                id="applicationsStart"
                name="applicationsStart"
                value={formData.eventTimeline.applicationsStart || ''}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className={inputFieldStyle}
              />
            </div>
            <div style={fieldStyle(2)}>
              <label htmlFor="applicationsEnd" className="block text-sm font-medium text-gray-700">Applications End</label>
              <input
                type="datetime-local"
                id="applicationsEnd"
                name="applicationsEnd"
                value={formData.eventTimeline.applicationsEnd || ''}
                onChange={(e) => handleChange(e, 'eventTimeline')}
                className={inputFieldStyle}
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
              className={inputFieldStyle}
              disabled
            />
          </div>
          <div style={fieldStyle(2)}>
            <label htmlFor="rsvpDeadlineDays" className="block text-sm font-medium text-gray-700">RSVP Deadline (days before event)</label>
            <input
              type="number"
              id="rsvpDeadlineDays"
              name="rsvpDeadlineDays"
              value={formData.eventTimeline.rsvpDeadlineDays || 7}
              onChange={(e) => handleChange(e, 'eventTimeline')}
              min="0"
              className={inputFieldStyle}
            />
          </div>
          <button className="btn-primary mt-6 flex ml-auto !py-2.5" onClick={handleClick}>
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
              value={formData.eventLinks.websiteUrl || ''}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className={inputFieldStyle}
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="micrositeUrl" className="block text-sm font-medium text-gray-700">Microsite URL</label>
            <input
              type="url"
              id="micrositeUrl"
              name="micrositeUrl"
              value={formData.eventLinks.micrositeUrl || ''}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className={inputFieldStyle}
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.eventLinks.contactEmail || ''}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className={inputFieldStyle}
            />
          </div>
          <div style={fieldStyle(3)}>
            <label htmlFor="codeOfConductUrl" className="block text-sm font-medium text-gray-700">Code of Conduct URL</label>
            <input
              type="url"
              id="codeOfConductUrl"
              name="codeOfConductUrl"
              value={formData.eventLinks.codeOfConductUrl || ''}
              onChange={(e) => handleChange(e, 'eventLinks')}
              className={inputFieldStyle}
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
              className={inputFieldStyle}
            />
          </div>

          <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Upload Logo</h2>
            {/* File Upload & Drag-and-Drop */}
            
              <label htmlFor="logoFile" className="block text-sm font-medium text-gray-700 mt-2 mb-2">
                Logo File (Upload or Drag & Drop)
              </label>

              <p className="text-sm text-gray-500 mb-2">
                Maximum file size: <strong>2MB</strong>
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'logoImage')}
                className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logoImage')}
                className="hidden"
                id="logoFile"
                />
                <label htmlFor="logoFile" className="cursor-pointer">
                  {dragActive
                  ? 'Drop the file here...'
                  : getImageUrl(formData.eventBranding.logoImage)
                    ? `Selected File: ${getImageUrl(formData.eventBranding.logoImage)}`
                    : 'Click or drag to upload a logo file'}
                </label>
              </div>
              {/* Error Message */}
              {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

              {/* File Preview */}
              {getImageUrl(formData.eventBranding.logoImage) && (
              <div className="mt-4">
              <img
                src={getImageUrl(formData.eventBranding.logoImage)}
                alt="Logo Preview"
                className="w-32 h-32 object-contain mx-auto border border-gray-300 rounded-md"
              />
              <button
                onClick={() => handleRemoveImage('logoImage')}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 mb-2"
              >
                Remove Image
              </button>
            </div>
              )}
          </div>

          <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Upload Favicon</h2>

            <label htmlFor="faviconFile" className="block text-sm font-medium text-gray-700 mt-2 mb-2">
              Favicon File (Upload or Drag & Drop)
            </label>

            <p className="text-sm text-gray-500 mb-2">
              Maximum file size: <strong>2MB</strong>
            </p>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'faviconImage')}
              className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'faviconImage')}
                className="hidden"
                id="faviconFile"
              />
              <label htmlFor="faviconFile" className="cursor-pointer">
                {dragActive
                  ? 'Drop the file here...'
                  : getImageUrl(formData.eventBranding.faviconImage)
                  ? `Selected File: ${getImageUrl(formData.eventBranding.faviconImage)}`
                  : 'Click or drag to upload a favicon file'}
              </label>
            </div>
            {/* Error Message */}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

            {/* File Preview */}
            {getImageUrl(formData.eventBranding.faviconImage) && (
              <div className="mt-4">
                <img
                  src={getImageUrl(formData.eventBranding.faviconImage)}
                  alt="Favicon Preview"
                  className="w-32 h-32 object-contain mx-auto border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => handleRemoveImage('faviconImage')}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 mb-2"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border rounded-lg shadow-md bg-white">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Upload Cover Image</h2>

            <label htmlFor="coverImageFile" className="block text-sm font-medium text-gray-700 mt-2 mb-2">
              Cover Image File (Upload or Drag & Drop)
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Maximum file size: <strong>2MB</strong>
            </p>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'coverImage')}
              className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'coverImage')}
                className="hidden"
                id="coverImageFile"
              />
              <label htmlFor="coverImageFile" className="cursor-pointer">
                {dragActive
                  ? 'Drop the file here...'
                  : getImageUrl(formData.eventBranding.coverImage)
                  ? `Selected File: ${getImageUrl(formData.eventBranding.coverImage)}`
                  : 'Click or drag to upload a cover image file'}
              </label>
            </div>
            {/* Error Message */}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

            {/* File Preview */}
            {getImageUrl(formData.eventBranding.coverImage) && (
              <div className="mt-4">
                <img
                  src={getImageUrl(formData.eventBranding.coverImage)}
                  alt="Cover Image Preview"
                  className="w-2/3 h-64 object-contain mx-auto border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => handleRemoveImage('coverImage')}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 mb-2"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          
          <button className="btn-primary mt-10 flex ml-auto !py-2.5" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(4)}>
          <div className="flex items-center justify-between space-x-4">
            <h3 className="text-lg font-medium text-gray-700">Tracks & Prizes</h3>
            <button
              type="button"
              onClick={addTrack}
              className="mt-2 btn-secondary !py-2 !px-5"
            >
              Add new Track
            </button>
          </div>

          {formData.tracks.map((track, trackIndex) => (
            <div key={trackIndex} className="border p-4 rounded">
              <div className="flex items-center justify-between space-x-4">
                <input
                  type="text"
                  value={track.name || ''}
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
                value={track.description || ''}
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
                      value={prize.title || ''}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="title"
                      placeholder="Prize Title"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <input
                      type="text"
                      value={prize.description || ''}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="description"
                      placeholder="Prize Description"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <input
                      type="number"
                      value={prize.value || 0}
                      onChange={(e) => handleArrayChange(e, 'tracks', trackIndex, 'prizes', prizeIndex)}
                      name="value"
                      placeholder="Prize Value"
                      className="input-field w-full md:w-1/3 mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => removePrize(trackIndex, prizeIndex)}
                      className="mt-2 text-red-500 border border-red-500 bg-white hover:bg-red-500 hover:text-white rounded-full p-2 w-1/2 sm:w-1/3 md:w-1/6"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPrizeToTrack(trackIndex)}
                  className="mt-4 btn-secondary !py-2 !px-5"
                >
                  Add more prizes
                </button>
              </div>
            </div>
          ))}
          
          <button className="btn-primary mt-6 flex ml-auto !py-2.5" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(5)}>
          <h3 className="text-lg font-medium text-gray-700">Sponsors</h3>
          {formData.sponsors.map((sponsor, index) => (
            <div key={index} className="space-y-2 border rounded p-4">
              <input
                type="text"
                value={sponsor.name || ''}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="name"
                placeholder="Sponsor Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.logo || ''}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="logo"
                placeholder="Sponsor Logo URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={sponsor.website || ''}
                onChange={(e) => handleArrayChange(e, 'sponsors', index)}
                name="website"
                placeholder="Sponsor Website URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button type="button" onClick={() => removeArrayItem('sponsors', index)} className="block mt-4 text-red-500 border border-red-500 bg-white rounded-full p-2 w-1/3 md:w-1/5 hover:bg-red-500 hover:text-white">
                Remove Sponsor
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('sponsors')} className="mt-4 btn-secondary !py-2 !px-5">
            Add Sponsor
          </button>
          <button className="btn-primary mt-6 flex ml-auto !py-2.5" onClick={handleClick}>
            Next
          </button>
        </div>

        <div className="space-y-4" style={fieldStyle(6)}>
          <h3 className="text-lg font-medium text-gray-700">Event People</h3>
          {formData.eventPeople.map((person, index) => (
            <div key={index} className="border p-4 rounded">
              <input
                type="text"
                value={person.name || ''}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="name"
                placeholder="Name"
                className="input-field mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <select
                value={person.role || ''}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="role"
                className="input-field mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="JUDGE">Judge</option>
                <option value="SPEAKER">Speaker</option>
              </select>
              <textarea
                value={person.bio || ''}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="bio"
                placeholder="Bio"
                className="input-field mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={person.avatar || ''}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="avatar"
                placeholder="Avatar URL"
                className="input-field mt-2 mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="url"
                value={person.socialLinks || ''}
                onChange={(e) => handleArrayChange(e, 'eventPeople', index)}
                name="socialLinks"
                placeholder="Social Links"
                className="input-field mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                onClick={() => removePerson(index)}
                className="block mt-4 text-red-500 border border-red-500 bg-white rounded-full p-2 w-1/3 md:w-1/5 hover:bg-red-500 hover:text-white"
              >
                Remove Person
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('eventPeople')}
            className="mt-4 btn-secondary !py-2 !px-5"
          >
            Add new Person
          </button>
          <button className="btn-primary mt-6 flex ml-auto !py-2.5" onClick={handleClick}>
            Next
          </button>
        </div>
        

        <div style={fieldStyle(7)}>
        <h3 className="text-xl font-semibold text-gray-800">Application Form</h3>
        <h5 className="text-md font-medium text-gray-600">
          (Choose the profile fields you want to make mandatory for participants.)
        </h5>
          <div className="space-y-2">
            {/* Education Required */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="educationRequired"
                value="educationRequired"
                checked={
                  formData.applicationForm?.educationRequired || false
                }
                onChange={(e) =>
                  handleCheckboxChange(e, "applicationForm", "educationRequired")
                }
                className="checkbox-input rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              Education Required
            </label>

            {/* Experience Required */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="experienceRequired"
                value="experienceRequired"
                checked={
                  formData.applicationForm?.experienceRequired || false
                }
                onChange={(e) =>
                  handleCheckboxChange(e, "applicationForm", "experienceRequired")
                }
                className="checkbox-input rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              Experience Required
            </label>

            {/* Profiles Required */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="profilesRequired"
                value="profilesRequired"
                checked={
                  formData.applicationForm?.profilesRequired || false
                }
                onChange={(e) =>
                  handleCheckboxChange(e, "applicationForm", "profilesRequired")
                }
                className="checkbox-input rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              Profiles Required
            </label>

            {/* Contact Required */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="contactRequired"
                value="contactRequired"
                checked={
                  formData.applicationForm?.contactRequired || false
                }
                onChange={(e) =>
                  handleCheckboxChange(e, "applicationForm", "contactRequired")
                }
                className="checkbox-input rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              Contact Required
            </label>

            {/* T Shirt Size Required */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="tShirtSizeRequired"
                value="tShirtSizeRequired"
                checked={
                  formData.applicationForm?.tShirtSizeRequired || false
                }
                onChange={(e) =>
                  handleCheckboxChange(e, "applicationForm", "tShirtSizeRequired")
                }
                className="checkbox-input rounded border-gray-300 text-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
              />
              T-Shirt Size Required
            </label>

            {/*Custom Questions*/}
            {(formData.customQuestions || []).map((question, index) => (
              <div key={index} className="border p-4 rounded mt-4">
                <input
                  type="text"
                  value={question.questionText || ''}
                  onChange={(e) => handleArrayChange(e, 'customQuestions', index)}
                  name="questionText"
                  placeholder="Question Text"
                  className="input-field mr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <select
                  value={question.questionType || ''}
                  onChange={(e) => handleArrayChange(e, 'customQuestions', index)}
                  name="questionType"
                  className="input-field mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                  <option value="TEXT">Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="ENUM">Enum</option>
                  <option value="CHECKBOX">Checkbox</option>
                </select>
                {['ENUM', 'CHECKBOX'].includes(question.questionType) && (
                  <div className="mt-2">
                    <h4 className="text-gray-600">Options</h4>
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center mt-1">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const updatedOptions = [...question.options];
                            updatedOptions[optionIndex] = e.target.value;
                            handleArrayChange(
                              { target: { name: 'options', value: updatedOptions } },
                              'customQuestions',
                              index
                            );
                          }}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="input-field rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
                            handleArrayChange(
                              { target: { name: 'options', value: updatedOptions } },
                              'customQuestions',
                              index
                            );
                          }}
                          className="ml-2 text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedOptions = [...(question.options || []), ''];
                        handleArrayChange(
                          { target: { name: 'options', value: updatedOptions } },
                          'customQuestions',
                          index
                        );
                      }}
                      className="mt-2 text-blue-500"
                    >
                      Add Option
                    </button>
                  </div>
                )}
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={question.isRequired}
                    onChange={(e) => {
                      const updatedQuestions = [...formData.customQuestions];
                      updatedQuestions[index].isRequired = e.target.checked;
                      setFormData({ ...formData, customQuestions: updatedQuestions });
                    }}
                    className="mr-2"
                  />
                  <label className="text-gray-600">Is Required?</label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updatedQuestions = formData.customQuestions?.filter((_, i) => i !== index);
                    setFormData({ ...formData, customQuestions: updatedQuestions });
                  }}
                  className="mt-4 text-red-500"
                >
                  Remove Question
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newQuestion = {
                  questionText: '',
                  questionType: 'TEXT',
                  options: [],
                  isRequired: false,
                };
                setFormData(prev => ({
                  ...prev,
                  customQuestions: [...(prev.customQuestions || []), newQuestion]
                }));
              }}
              className="mt-4 text-blue-500"
            >
              Add Question
            </button>
            
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={handleSaveAsDraft}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-black rounded hover:bg-gray-900"
        >
          {mode === 1 ? 'Create Event' : 'Update Event'}
        </button>
      </div>



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
    </div>
  );
};

export default EventForm;

