import prisma from '../config/database.js';

export const register = async (req, res) => {
  try {
    const { user: auth0User } = req.body;
    
    if (!auth0User?.sub || !auth0User?.email) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Try to find existing user first
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { auth0Id: auth0User.sub },
          { email: auth0User.email }
        ]
      }
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Default role
          status: 'ACTIVE',
          profile: {
            upsert: {
              create: {
                firstName: auth0User.given_name || '',
                lastName: auth0User.family_name || '',
                avatarUrl: auth0User.picture || null
              },
              update: {
                firstName: auth0User.given_name || '',
                lastName: auth0User.family_name || '',
                avatarUrl: auth0User.picture || null
              }
            }
          }
        },
        include: {
          profile: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Default role
          status: 'ACTIVE',
          profile: {
            create: {
              firstName: auth0User.given_name || '',
              lastName: auth0User.family_name || '',
              avatarUrl: auth0User.picture || null
            }
          }
        },
        include: {
          profile: true
        }
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.auth.payload.sub },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { profile, education, experience, skills, socialProfiles } = req.body;
    const auth0Id = req.auth.payload.sub;

    console.log('Updating user with ID:', auth0Id);
    
    const updatedUser = await prisma.user.update({
      where: { auth0Id },
      data: {
        profile: profile ? {
          upsert: {
            create: profile,
            update: profile
          }
        } : undefined,
        education: education ? {
          deleteMany: {},
          create: education
        } : undefined,
        experience: experience ? {
          deleteMany: {},
          create: experience
        } : undefined,
        skills: skills ? {
          deleteMany: {},
          create: skills
        } : undefined,
        socialProfiles: socialProfiles ? {
          deleteMany: {},
          create: socialProfiles
        } : undefined
      },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
};