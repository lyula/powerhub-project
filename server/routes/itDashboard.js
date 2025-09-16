const express = require('express');
const router = express.Router();
const itDashboardController = require('../controllers/itDashboardController');
const { auth, isIT } = require('../middleware/auth');

// Public endpoint for checking maintenance mode (no auth required)
router.get('/maintenance-status', itDashboardController.getMaintenanceStatus);

// Apply auth and IT middleware to all other routes
router.use(auth);
router.use(isIT);

// System overview and metrics
router.get('/overview', itDashboardController.getSystemOverview);

// Maintenance mode
router.post('/maintenance/toggle', itDashboardController.toggleMaintenanceMode);
router.get('/maintenance/session-stats', itDashboardController.getSessionStats);

// Flagged content management
router.get('/flagged-content', itDashboardController.getFlaggedContent);
router.put('/flagged-content/:flaggedContentId/review', itDashboardController.reviewFlaggedContent);

// User management
router.get('/users', itDashboardController.getUserManagement);
router.put('/users/:userId/role', itDashboardController.updateUserRole);
router.delete('/users/:userId', itDashboardController.deleteUser);
router.put('/users/:userId/suspend', itDashboardController.toggleUserSuspension);
router.put('/users/:userId/edit', itDashboardController.editUser);

// Security overview
router.get('/security', itDashboardController.getSecurityOverview);

// System health endpoints
router.get('/system-health', itDashboardController.getSystemHealth);
router.get('/security-alerts', itDashboardController.getSecurityAlerts);
router.get('/recent-activities', itDashboardController.getRecentActivities);
router.get('/audit-logs', itDashboardController.getAuditLogs);
router.put('/security-alerts/:alertId/resolve', itDashboardController.resolveSecurityAlert);

// Advanced analytics endpoint
router.get('/advanced-analytics', itDashboardController.getAdvancedAnalytics);

// Audit log management
router.post('/audit-logs/cleanup', itDashboardController.cleanupAuditLogs);

module.exports = router;
