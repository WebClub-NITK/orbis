import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth API endpoints
export const authAPI = {
  /**
   * Login user with email and password
   * @param {string} email User's email
   * @param {string} password User's password 
   * @returns {Promise} Response with user data
   */
  login: (email, password) => 
    api.post('/api/login', { email, password }),

  /**
   * Register new user
   * @param {Object} userData User registration data (email, username, password, role)
   * @returns {Promise} Response with created user
   */
  register: (userData) => 
    api.post('/api/register', userData),

  /**
   * Logout current user
   * @returns {Promise} Response with logout status
   */
  logout: () => 
    api.post('/api/logout'),

  /**
   * Get current authenticated user
   * @returns {Promise} Response with user data
   */
  getCurrentUser: () =>
    api.get('/api/user')
};

// Events API endpoints
export const eventsAPI = {
  /**
   * Get all events with related data (timeline, links, branding, tracks, sponsors, etc)
   * @returns {Promise} Response with events array
   */
  getEvents: () => 
    api.get('/api/events'),

  /**
   * Get single event by ID with all related data
   * @param {string} id Event ID
   * @returns {Promise} Response with event data
   */
  getEvent: (id) => 
    api.get(`/api/events/${id}`),

  /**
   * Create new event with all related data
   * @param {Object} eventData Event creation data including:
   * - Basic info (name, type, tagline, about, etc)
   * - Timeline (eventStart, eventEnd, applicationsStart, etc)
   * - Links (websiteUrl, micrositeUrl, etc)
   * - Branding (brandColor, logoUrl, etc)
   * - Tracks & Prizes
   * - Sponsors
   * - Event People (judges, speakers)
   * @returns {Promise} Response with created event
   */
  createEvent: (eventData) => 
    api.post('/api/events', eventData),

  /**
   * Save event as a draft with partial data
   * @param {Object} eventData Event draft data including:
   * - Basic info (name, type, event timeline)
   * - optional or partial eventLinks, eventBranding, etc
   * @returns {Promise} Response with draft event
   */
  saveDraft: (eventData) => 
    api.post('/api/events/draft', eventData),

  /**
   * Update existing event
   * @param {string} id Event ID
   * @param {Object} eventData Updated event data
   * @returns {Promise} Response with updated event
   */
  updateEvent: (id, eventData) => 
    api.put(`/api/events/${id}`, eventData),

  /**
   * Delete an event
   * @param {string} id Event ID
   * @returns {Promise} Response confirming the event deletion
   */
  deleteEvent: (id) =>
    api.delete(`/api/events/${id}`),

  /**
   * Join an event as a participant
   * @param {string} eventId Event ID
   * @param {Object} applicationData Application details
   * @returns {Promise} Response with application status
   */
  joinEvent: (eventId, applicationData) => 
    api.post(`/api/events/${eventId}/join`, applicationData)
};

// Teams API endpoints
export const teamsAPI = {
  /**
   * Get all teams for current user
   * @returns {Promise} Response with teams array
   */
  getTeams: () => 
    api.get('/api/teams'),

  /**
   * Create new team for an event
   * @param {Object} teamData Team creation data including:
   * - eventId: ID of the event
   * - name: Team name
   * @returns {Promise} Response with created team
   */
  createTeam: (teamData) => 
    api.post('/api/teams', teamData),

  /**
   * Get team members
   * @param {string} teamId Team ID
   * @returns {Promise} Response with team members
   */
  getTeamMembers: (teamId) =>
    api.get(`/api/teams/${teamId}/members`),

  /**
   * Add member to team
   * @param {string} teamId Team ID
   * @param {Object} memberData Member data
   * @returns {Promise} Response with updated team
   */
  addTeamMember: (teamId, memberData) =>
    api.post(`/api/teams/${teamId}/members`, memberData)
};

// Projects API endpoints
export const projectsAPI = {
  /**
   * Submit new project for a team
   * @param {Object} projectData Project submission data including:
   * - eventId: ID of the event
   * - teamId: ID of the team
   * - title: Project title
   * - description: Project description
   * - githubUrl: GitHub repository URL
   * - demoUrl: Demo/live project URL
   * @returns {Promise} Response with submitted project
   */
  submitProject: (projectData) => 
    api.post('/api/projects', projectData),

  /**
   * Get project details
   * @param {string} projectId Project ID
   * @returns {Promise} Response with project data
   */
  getProject: (projectId) =>
    api.get(`/api/projects/${projectId}`)
};

// Profile API endpoints
export const profileAPI = {
  /**
   * Get user profile with all related data (education, experience, skills, social)
   * @returns {Promise} Response with profile data
   */
  getProfile: () => 
    api.get('/api/profile'),

  /**
   * Update user profile and related data
   * @param {Object} profileData Updated profile data including:
   * - Basic info (firstName, lastName, bio, etc)
   * - Education history
   * - Work experience
   * - Skills
   * - Social profiles
   * @returns {Promise} Response with updated profile
   */
  updateProfile: (profileData) => 
    api.put('/api/profile', profileData)
};

// Error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    // Handle other status codes
    else if (error.response?.status === 403) {
      console.error('Forbidden access');
    }
    else if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    else if (error.response?.status === 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default api;
