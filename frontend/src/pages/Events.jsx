import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { EditBtn } from '../svg/EditBtn';
import { DeleteBtn } from '../svg/DeleteBtn';
import AlertDialog from '../components/AlertDialog';
import { deleteImage } from '../helpers/images';
import {useAuth0} from "@auth0/auth0-react";
import { toast } from 'react-hot-toast';


const Events = () => {
  const [events, setEvents] = useState([]);
  const { user, getAccessToken } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applicationResponses, setApplicationResponses] = useState({});
  const navigate = useNavigate();
  const canCreateEvent = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';
  const [searchWord, setSearchWord] = useState('');
  const [selected, setSelected] = useState("All");
  const [drafts, setDrafts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  

  useEffect(() => {
    fetchEvents();
  }, [searchWord, selected]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events`,
        { withCredentials: true }
      );
      const eventList = response.data;
      const draftedEvents = eventList.filter(event => event.status === 'DRAFT');
      const completeEvents = eventList.filter(event => event.status === 'PUBLISHED');
      setDrafts(draftedEvents);
      
      if(searchWord !== '') {
        const searchedEventList = eventList.filter(event => 
          event.name.toLowerCase().includes(searchWord.toLowerCase())
        );
        setEvents(searchedEventList);
      } else {
        if(selected === 'Hackathons') {
          const hackathons = completeEvents.filter(event => event.type === 'HACKATHON');
          setEvents(hackathons);
        } else if(selected === 'General Events') {
          const generalEvents = completeEvents.filter(event => event.type === 'GENERAL_EVENT');
          setEvents(generalEvents);
        } else if(selected === 'Created Events') {
          const createdEvents = completeEvents.filter(event => event.createdById === user.id);
          setEvents(createdEvents);
        } else if(selected === 'Drafts') {
          const myDrafts = drafts.filter(draft => draft.createdById === user.id);
          setEvents(myDrafts);
        } else {
          setEvents(completeEvents);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/join`, 
        { applicationDetails: applicationResponses[eventId] },
        { withCredentials: true }
      );
      console.log('Joined event:', response.data);
      setSelectedEvent(null);
      setApplicationResponses({});
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleApplicationChange = (eventId, questionIndex, value) => {
    setApplicationResponses(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [questionIndex]: value
      }
    }));
  };

  const handleEventViewClick = (id) => {
    navigate(`/events/${id}`);
  }

  const handleEventEditClick = (id) => {
    navigate(`/edit-event/${id}`);
  }

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = await getAccessToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/events/${eventToDelete.id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      // Delete associated images if they exist
      if (eventToDelete.branding?.logoUrl) {
        await deleteImage(eventToDelete.branding.logoUrl);
      }
      if (eventToDelete.branding?.coverUrl) {
        await deleteImage(eventToDelete.branding.coverUrl);
      }
      
      fetchEvents(); // Refresh the events list
      setIsDialogOpen(false);
      setEventToDelete(null);
      // Add success toast notification
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      // Add error toast notification
      toast.error('Failed to delete event. Please try again.');
    }
  };

  const handlePublishEvent = async (eventId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
        { status: 'PUBLISHED' },
        { withCredentials: true }
      );
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error('Error publishing event:', error);
    }
  };

  function SegmentedControl() {
    return (
      <div className="flex items-center justify-center mb-10 gap-2">
        <button
          onClick={() => setSelected("All")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "All"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setSelected("Hackathons")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "Hackathons"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          Hackathons
        </button>

        <button
          onClick={() => setSelected("General Events")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selected === "General Events"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-100"
          }`}
        >
          General Events
        </button>

        {canCreateEvent && (
          <button
            onClick={() => setSelected("Created Events")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selected === "Created Events"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-100"
            }`}
          >
            Created Events
          </button>
        )}
        
        {!!drafts.length && (
          <button
            onClick={() => setSelected("Drafts")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              selected === "Drafts"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-800 hover:bg-blue-100"
            }`}
          >
            Drafts
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
      </div>

      <SegmentedControl />

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div onClick={() => handleEventViewClick(event.id)}>
                {event.branding?.coverUrl && (
                  <img
                    src={event.branding.coverUrl}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
                  <p className="text-gray-600 mb-2">{event.tagline}</p>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(event.timeline.eventStart).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      event.status === 'DRAFT' ? 'bg-gray-100' : 'bg-green-100'
                    }`}>
                      {event.status}
                    </span>
                    {event.createdById === user?.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventEditClick(event.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <EditBtn />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(event);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <DeleteBtn />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
};

export default Events;
