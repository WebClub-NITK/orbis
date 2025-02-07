import prisma from '../config/database.js';

export const createEvent = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const eventData = req.body;

    // Find user first
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate user role
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Only organizers can create events.' });
    }

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        tagline: eventData.tagline || null,
        about: eventData.about || null,
        type: eventData.type || 'HACKATHON',
        maxParticipants: eventData.maxParticipants,
        minTeamSize: eventData.minTeamSize,
        maxTeamSize: eventData.maxTeamSize,
        mode: eventData.mode,
        status: eventData.status || 'PUBLISHED',
        createdById: user.id,
        
        timeline: {
          create: {
            eventStart: eventData.eventTimeline.eventStart,
            eventEnd: eventData.eventTimeline.eventEnd,
            applicationsStart: eventData.eventTimeline.applicationsStart,
            applicationsEnd: eventData.eventTimeline.applicationsEnd
          }
        },
        
        branding: {
          create: {
            logoUrl: eventData.eventBranding.logo || null,
            coverUrl: eventData.eventBranding.banner || null,
            brandColor: eventData.eventBranding.primaryColor || '#000000'
          }
        },
        
        links: {
          create: {
            websiteUrl: eventData.eventLinks[0]?.websiteUrl || '',
            micrositeUrl: eventData.eventLinks[0]?.micrositeUrl || '',
            contactEmail: eventData.eventLinks[0]?.contactEmail || '',
            socialLinks: eventData.eventLinks[0]?.socialLinks || null
          }
        },
        
        tracks: {
          create: eventData.tracks.map(track => ({
            name: track.name,
            description: track.description,
            prizes: {
              create: track.prizes?.map(prize => ({
                title: prize.title,
                description: prize.description,
                value: parseFloat(prize.value) || 0
              })) || []
            }
          }))
        },
        
        sponsors: {
          create: eventData.sponsors.map(sponsor => ({
            name: sponsor.name,
            website: sponsor.website || '',
            logo: sponsor.logo || null,
            tier: sponsor.tier || 'GOLD'  // Assuming GOLD is a valid tier in your schema
          }))
        },
        
        eventPeople: {
          create: eventData.eventPeople.map(person => ({
            name: person.name,
            role: person.role || 'JUDGE',  // Assuming JUDGE is a valid role in your schema
            bio: person.bio || '',
            avatar: person.avatar || null,
            socialLinks: person.socialLinks || null
          }))
        }
      },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;
    const updateData = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    // If it's just a status update
    if (Object.keys(updateData).length === 1 && updateData.status) {
      const updatedEvent = await prisma.event.update({
        where: { id: parseInt(id) },
        data: { status: updateData.status },
        include: {
          timeline: true,
          branding: true,
          links: true,
          tracks: {
            include: {
              prizes: true
            }
          },
          sponsors: true,
          eventPeople: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              profile: true
            }
          }
        }
      });

      return res.json(updatedEvent);
    }

    // Handle full event update
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        name: updateData.name,
        tagline: updateData.tagline || null,
        about: updateData.about || null,
        type: updateData.type || 'HACKATHON',
        maxParticipants: updateData.maxParticipants,
        minTeamSize: updateData.minTeamSize,
        maxTeamSize: updateData.maxTeamSize,
        mode: updateData.mode,
        status: updateData.status || event.status, // Keep existing status if not specified

        timeline: {
          update: {
            eventStart: updateData.eventTimeline.eventStart,
            eventEnd: updateData.eventTimeline.eventEnd,
            applicationsStart: updateData.eventTimeline.applicationsStart,
            applicationsEnd: updateData.eventTimeline.applicationsEnd
          }
        },

        branding: {
          update: {
            logoUrl: updateData.eventBranding?.logo || null,
            coverUrl: updateData.eventBranding?.banner || null,
            brandColor: updateData.eventBranding?.primaryColor || '#000000'
          }
        },

        links: {
          update: {
            websiteUrl: updateData.eventLinks[0]?.websiteUrl || '',
            micrositeUrl: updateData.eventLinks[0]?.micrositeUrl || '',
            contactEmail: updateData.eventLinks[0]?.contactEmail || '',
            socialLinks: updateData.eventLinks[0]?.socialLinks || null
          }
        }
      },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event', details: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event with its creator
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Delete the event and all related records
    await prisma.$transaction(async (tx) => {
      // Delete applications first
      await tx.application.deleteMany({
        where: { eventId: parseInt(id) }
      });

      // Delete prizes
      await tx.prize.deleteMany({
        where: {
          trackId: {
            in: event.tracks.map(track => track.id)
          }
        }
      });

      // Delete tracks
      await tx.track.deleteMany({
        where: { eventId: parseInt(id) }
      });

      // Delete timeline
      await tx.timeline.delete({
        where: { eventId: parseInt(id) }
      });

      // Delete branding
      await tx.branding.delete({
        where: { eventId: parseInt(id) }
      });

      // Delete links
      await tx.link.delete({
        where: { eventId: parseInt(id) }
      });

      // Delete sponsors
      await tx.sponsor.deleteMany({
        where: { eventId: parseInt(id) }
      });

      // Delete event people
      await tx.eventPerson.deleteMany({
        where: { eventId: parseInt(id) }
      });

      // Finally delete the event
      await tx.event.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event', details: error.message });
  }
};

export const joinEvent = async (req, res) => {
  // ... existing joinEvent code ...
};

// Add the missing applyToEvent function
export const applyToEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.auth.payload.sub;

    // Find user first
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const application = await prisma.application.create({
      data: {
        eventId: parseInt(eventId),
        userId: user.id,
        status: 'PENDING'
      }
    });

    res.json(application);
  } catch (error) {
    console.error('Apply to event error:', error);
    res.status(500).json({ error: 'Failed to apply to event' });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId },
      include: {
        events: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to publish this event' });
    }

    // Update event status
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { status: 'PUBLISHED' },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
};

