const AuditLog = require('../models/AuditLog');

async function logAdminAction({ adminId, action, resourceType, resourceId, details = {}, ipAddress = '' }) {
  try {
    const log = await AuditLog.create({
      admin: adminId,
      action,
      targetResource: {
        resourceType,
        resourceId
      },
      details,
      ipAddress
    });
    return log;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
    return null;
  }
}

module.exports = { logAdminAction };
