import ActivityLog from '../models/ActivityLog.js';

export default async function logActivity({ actor, action, details, entityId }) {
  await ActivityLog.create({
    actor: actor?._id,
    actorName: actor?.name || 'System',
    actorEmail: actor?.email || 'system@solestride.com',
    actorRole: actor?.role || 'admin',
    action,
    details,
    entityId
  });
}
