import { enqueueAuditLog } from '../utils/queue.js';

/**
 * Middleware to record audit logs for successful requests.
 * @param {string} action - The action being performed (e.g., 'DEPOSIT', 'UPDATE_PROFILE')
 * @param {string} resource - The resource being affected (e.g., 'TRANSACTION', 'USER')
 */
export const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const resourceId = req.params.id || req.body.id || req.body.accountNumber || null;

          const details = {
            method: req.method,
            url: req.originalUrl,
            query: Object.keys(req.query).length ? req.query : undefined,
          };
          if (req.method !== 'GET' && req.body) {
            const bodyCopy = { ...req.body };
            const sensitiveFields = ['password', 'tpin', 'totpToken', 'newPassword', 'oldPassword'];
            sensitiveFields.forEach(field => delete bodyCopy[field]);
            details.body = bodyCopy;
          }

          await enqueueAuditLog({
            actor: req.user?.id || 'SYSTEM',
            action,
            resource,
            resourceId,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            status: 'SUCCESS'
          });
        } catch (error) {
          console.error('Audit Log Error:', error);
        }
      }
    });

    next();
  };
};
