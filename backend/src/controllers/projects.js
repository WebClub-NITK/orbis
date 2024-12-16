import prisma from '../config/database.js';

/**
 * Get all projects for an event
 */
export const getEventProjects = async (req, res) => {
  const { eventId } = req.params;
  
  try {
    const projects = await prisma.projectSubmission.findMany({
      where: {
        eventId: parseInt(eventId)
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    throw error;
  }
};

/**
 * Submit a new project
 */
export const submitProject = async (req, res) => {
  const { eventId, teamId, title, description, githubUrl, demoUrl } = req.body;

  try {
    // Check if user is part of the team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: req.session.userId
      }
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'You must be a team member to submit a project' });
    }

    const project = await prisma.projectSubmission.create({
      data: {
        eventId,
        teamId,
        title,
        description,
        githubUrl,
        demoUrl
      },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    throw error;
  }
};
