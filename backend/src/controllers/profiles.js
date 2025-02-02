import prisma from '../config/database.js';

/**
 * Get user profile with all related data
 */
export const getProfile = async (req, res) => {
  try {
    // const auth = req.auth;
    // console.log(auth);
    const profile = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });
    res.json(profile);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile and related data
 */
export const updateProfile = async (req, res) => {
  const { profile, education, experience, skills, socialProfiles } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.session.userId },
      data: {
        profile: {
          upsert: {
            create: {
              firstName: profile.firstName || null,
              lastName: profile.lastName || null,
              avatarUrl: profile.avatarUrl || null,
              bio: profile.bio || null,
              gender: profile.gender || null,
              phone: profile.phone || null,
              country: profile.country || null,
              city: profile.city || null,
            },
            update: {
              firstName: profile.firstName || null,
              lastName: profile.lastName || null,
              avatarUrl: profile.avatarUrl || null,
              bio: profile.bio || null,
              gender: profile.gender || null,
              phone: profile.phone || null,
              country: profile.country || null,
              city: profile.city || null
            }
          }
        },
        education: {
          deleteMany: {},
          create: education.map((edu) => ({
            institutionName: edu.institutionName,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            graduationYear: edu.graduationYear ? parseInt(edu.graduationYear, 10) : null,
          })),
        },
        experience: {
          deleteMany: {},
          create: experience.map((exp) => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          })),
        },
        skills: {
          deleteMany: {},
          create: skills.map((skill) => ({
            expertiseLevel: skill.expertiseLevel,
            skillName: skill.skillName,
          })),
        },
        socialProfiles: {
          deleteMany: {},
          create: socialProfiles.map((social) => ({
            platform: social.platform,
            url: social.url,
          })),
        }
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
    throw error;
  }
};

