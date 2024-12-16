/**
 * Middleware to check if user is authenticated
 */
export const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Middleware to check if user is an organizer
 */
export const isOrganizer = (req, res, next) => {
  if (req.session.userRole === 'ORGANIZER' || req.session.userRole === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden. Only organizers can perform this action.' });
  }
}; 