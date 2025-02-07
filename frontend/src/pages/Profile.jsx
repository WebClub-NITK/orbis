import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api/api';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user: auth0User, isLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile: {},
    education: [],
    experience: [],
    skills: [],
    socialProfiles: [],
    projects: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const userData = await authAPI.getCurrentUser();
        console.log('Received user data:', userData);
        
        setProfile(userData);
        setFormData({
          profile: userData.profile || {},
          education: userData.education || [],
          experience: userData.experience || [],
          skills: userData.skills || [],
          socialProfiles: userData.socialProfiles || [],
          projects: userData.projects || []
        });
        
        console.log('Form data initialized:', formData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (auth0User) {
      fetchProfile();
    }
  }, [auth0User]);

  if (isLoading || loading) {
    return <div className="container-width py-20">Loading...</div>;
  }

  if (error) {
    return <div className="container-width py-20 text-red-500">{error}</div>;
  }

  const handleChange = (e, section, index = null) => {
    const { name, value } = e.target;
    setFormData(prevState => {
      if (index !== null) {
        const newArray = [...prevState[section]];
        newArray[index] = { ...newArray[index], [name]: value };
        return { ...prevState, [section]: newArray };
      } else {
        return { ...prevState, [section]: { ...prevState[section], [name]: value } };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      const response = await authAPI.updateUser(formData);
      console.log('Update response:', response);
      setProfile(response);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.details || 'Failed to update profile');
    }
  };

  const addItem = (section) => {
    const newItems = {
      education: {
        institutionName: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
        activities: ''
      },
      experience: {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      },
      skills: {
        skillName: '',
        expertiseLevel: 'BEGINNER',
        yearsOfExp: null
      },
      socialProfiles: {
        platform: '',
        url: ''
      },
      projects: {
        name: '',
        description: '',
        url: '',
        image: '',
        startDate: '',
        endDate: '',
        technologies: []
      }
    };

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItems[section]]
    }));
  };

  const removeItem = (section, index) => {
    setFormData(prevState => ({
      ...prevState,
      [section]: prevState[section].filter((_, i) => i !== index)
    }));
  };

  const renderField = (field) => (field ? field : '-');

  const renderName = (firstName, lastName) => {
    if(firstName && lastName) {
      return firstName + ' ' + lastName;
    } else if(firstName) {
      return firstName;
    } else {
      return '-';
    }
  }

  // Check if profile is complete
  const isProfileComplete = profile?.profile?.firstName && 
    profile?.profile?.lastName && 
    profile?.profile?.bio && 
    profile?.profile?.phone;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!isEditing ? (
            <div>
              {!isProfileComplete && (
                <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 mb-2">
                    Your profile is incomplete. Please fill in all required fields.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Profile</h1>
                <Button onClick={() => setIsEditing(true)}>
                  {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
                </Button>
              </div>
              
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.profile.firstName || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.profile.lastName || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                    <input
                      type="url"
                      name="avatarUrl"
                      value={formData.profile.avatarUrl || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.profile.gender || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.profile.phone || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.profile.country || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.profile.city || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.profile.bio || ''}
                      onChange={(e) => handleChange(e, 'profile')}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              {profile?.education?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Education</h2>
                  {profile.education.map((edu, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h3 className="font-medium">{edu.institutionName}</h3>
                      <p className="text-sm text-gray-600">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <p className="text-sm text-gray-500">
                        Graduation Year: {edu.graduationYear}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {profile?.skills?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {skill.skillName} - {skill.expertiseLevel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {profile.experience?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Experience</h2>
                  <div className="space-y-6">
                    {profile.experience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{renderField(exp.position)}</h3>
                            <p className="text-gray-600">{renderField(exp.company)}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {renderField(new Date(exp.startDate).toLocaleDateString())} - 
                            {exp.endDate ? renderField(new Date(exp.endDate).toLocaleDateString()) : 'Present'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {profile.projects?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-medium text-lg mb-2">{renderField(project.name)}</h3>
                        <p className="text-gray-600 mb-3">{renderField(project.description)}</p>
                        {project.projectUrl && (
                          <a 
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            View Project
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Profiles Section */}
              {profile.socialProfiles?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Social Profiles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.socialProfiles.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {/* Platform Icons */}
                        {social.platform === 'GITHUB' && (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd" />
                          </svg>
                        )}
                        {social.platform === 'LINKEDIN' && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                        )}
                        <div>
                          <span className="font-medium">{social.platform.charAt(0) + social.platform.slice(1).toLowerCase()}</span>
                          <span className="text-gray-500 text-sm block">View Profile</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">
                  {isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
                </h1>
                <Button variant="text" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl bg-white shadow-xl border-t-black border-solid border-4 rounded-2xl p-12 mt-20 mb-20">
                {/* Basic Information */}
                <div className="space-y-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.profile.firstName || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.profile.lastName || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                        <input
                          type="url"
                          name="avatarUrl"
                          value={formData.profile.avatarUrl || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          name="gender"
                          value={formData.profile.gender || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.profile.phone || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.profile.country || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.profile.city || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.profile.bio || ''}
                          onChange={(e) => handleChange(e, 'profile')}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Education */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Education</h3>
                    {formData.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <input
                          type="text"
                          name="institutionName"
                          value={edu.institutionName || ''}
                          onChange={(e) => handleChange(e, 'education', index)}
                          placeholder="Institution Name"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <select
                          name="degree"
                          value={edu.degree || ''}
                          onChange={(e) => handleChange(e, 'education', index)}
                          className="w-full px-3 py-2 border rounded mb-2"
                        >
                          <option value="">Select Expertise Level</option>
                          <option value="HIGH_SCHOOL">High School</option>
                          <option value="ASSOCIATE">Associate</option>
                          <option value="BACHELOR">Bachelor</option>
                          <option value="MASTER">Master</option>
                          <option value="PHD">PHD</option>
                        </select>
                        <input
                          type="text"
                          name="fieldOfStudy"
                          value={edu.fieldOfStudy || ''}
                          onChange={(e) => handleChange(e, 'education', index)}
                          placeholder="Field of Study"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                          type="number"
                          name="graduationYear"
                          value={edu.graduationYear || ''}
                          onChange={(e) => handleChange(e, 'education', index)}
                          placeholder="Graduation Year"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <button type="button" onClick={() => removeItem('education', index)} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('education')} className="text-blue-500">Add Education</button>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Experience</h3>
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="mb-4">
                        <input
                          type="text"
                          name="company"
                          value={exp.company || ''}
                          onChange={(e) => handleChange(e, 'experience', index)}
                          placeholder="Company"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                          type="text"
                          name="position"
                          value={exp.position || ''}
                          onChange={(e) => handleChange(e, 'experience', index)}
                          placeholder="Position"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                          type="date"
                          name="startDate"
                          value={exp.startDate || ''}
                          onChange={(e) => handleChange(e, 'experience', index)}
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                          type="date"
                          name="endDate"
                          value={exp.endDate || ''}
                          onChange={(e) => handleChange(e, 'experience', index)}
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <button type="button" onClick={() => removeItem('experience', index)} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('experience')} className="text-blue-500">Add Experience</button>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Skills</h3>
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="mb-4">
                        <input
                          type="text"
                          name="skillName"
                          value={skill.skillName || ''}
                          onChange={(e) => handleChange(e, 'skills', index)}
                          placeholder="Skill Name"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <select
                          name="expertiseLevel"
                          value={skill.expertiseLevel || ''}
                          onChange={(e) => handleChange(e, 'skills', index)}
                          className="w-full px-3 py-2 border rounded mb-2"
                        >
                          <option value="">Select Expertise Level</option>
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="EXPERT">Expert</option>
                        </select>
                        <button type="button" onClick={() => removeItem('skills', index)} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('skills')} className="text-blue-500">Add Skill</button>
                  </div>

                  {/* Social Profiles */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Social Profiles</h3>
                    {formData.socialProfiles.map((profile, index) => (
                      <div key={index} className="mb-4">
                        <select
                          name="platform"
                          value={profile.platform || ''}
                          onChange={(e) => handleChange(e, 'socialProfiles', index)}
                          className="w-full px-3 py-2 border rounded mb-2"
                        >
                          <option value="">Select Platform</option>
                          <option value="GITHUB">GitHub</option>
                          <option value="LINKEDIN">LinkedIn</option>
                          <option value="TWITTER">Twitter</option>
                          <option value="PORTFOLIO">Portfolio</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <input
                          type="url"
                          name="url"
                          value={profile.url || ''}
                          onChange={(e) => handleChange(e, 'socialProfiles', index)}
                          placeholder="Profile URL"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <button type="button" onClick={() => removeItem('socialProfiles', index)} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('socialProfiles')} className="text-blue-500">Add Social Profile</button>
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Projects</h3>
                    {formData.projects.map((project, index) => (
                      <div key={index} className="mb-4">
                        <input
                          type="text"
                          name="name"
                          value={project.name || ''}
                          onChange={(e) => handleChange(e, 'projects', index)}
                          placeholder="Project Name"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <textarea
                          name="description"
                          value={project.description || ''}
                          onChange={(e) => handleChange(e, 'projects', index)}
                          placeholder="Project Description"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                          type="url"
                          name="projectUrl"
                          value={project.projectUrl || ''}
                          onChange={(e) => handleChange(e, 'projects', index)}
                          placeholder="Project URL"
                          className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <button type="button" onClick={() => removeItem('projects', index)} className="text-red-500">Remove</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addItem('projects')} className="text-blue-500">Add Project</button>
                  </div>
                </div>

                <Button type="submit">
                  Save Changes
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;


