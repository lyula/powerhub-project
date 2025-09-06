const SystemSettings = require('../models/SystemSettings');

const maintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for IT dashboard routes
    if (req.path.startsWith('/api/it-dashboard')) {
      return next();
    }

    // Skip maintenance check for health check endpoints
    if (req.path.startsWith('/api/health')) {
      return next();
    }

    // Skip maintenance check for auth routes (login/register)
    if (req.path.startsWith('/api/auth')) {
      return next();
    }

    const systemSettings = await SystemSettings.findOne();
    
    if (systemSettings && systemSettings.maintenanceMode.enabled) {
      // Check if user is authenticated and has IT or Admin role
      if (req.user && (req.user.role === 'IT' || req.user.role === 'admin')) {
        return next(); // Allow IT and Admin users to access during maintenance
      }
      
      // Return maintenance response for all other users
      return res.status(503).json({
        error: 'Maintenance Mode',
        message: systemSettings.maintenanceMode.message || 'System is under maintenance. Please try again later.',
        maintenanceMode: true,
        estimatedResumeTime: systemSettings.maintenanceMode.enabledAt ? 
          new Date(systemSettings.maintenanceMode.enabledAt.getTime() + 2 * 60 * 60 * 1000) : // 2 hours from enabled time
          null
      });
    }
    
    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next(); // Continue if there's an error checking maintenance mode
  }
};

module.exports = maintenanceMode;
