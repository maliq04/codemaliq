import { getAdminDatabase } from '@/lib/firebase-admin'

export type AuditAction = 'create' | 'update' | 'delete'
export type AuditResourceType = 'blog' | 'project' | 'chat' | 'contact' | 'media' | 'config' | 'learn' | 'roadmap'

export interface AuditLog {
  id: string
  adminEmail: string
  adminName?: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  resourceTitle: string
  changes?: Record<string, any>
  timestamp: string
  ipAddress?: string
}

export interface CreateAuditLogParams {
  adminEmail: string
  adminName?: string
  action: AuditAction
  resourceType: AuditResourceType
  resourceId: string
  resourceTitle: string
  changes?: Record<string, any>
  ipAddress?: string
}

/**
 * Create an audit log entry in Firebase
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<string | null> {
  try {
    const database = getAdminDatabase()

    if (!database) {
      console.warn('Database not available for audit logging')
      return null
    }

    const auditLogsRef = database.ref('audit_logs')

    // Clean the log entry to remove undefined values that Firebase doesn't allow
    const logEntry: Omit<AuditLog, 'id'> = {
      adminEmail: params.adminEmail,
      adminName: params.adminName || 'Unknown Admin',
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceTitle: params.resourceTitle,
      timestamp: new Date().toISOString()
    }

    // Only add optional fields if they have values
    if (params.changes && Object.keys(params.changes).length > 0) {
      logEntry.changes = params.changes
    }

    if (params.ipAddress) {
      logEntry.ipAddress = params.ipAddress
    }

    const newLogRef = await auditLogsRef.push(logEntry)
    return newLogRef.key
  } catch (error) {
    console.error('Error creating audit log:', error)
    return null
  }
}

/**
 * Get audit logs with pagination
 */
export async function getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  try {
    const database = getAdminDatabase()

    if (!database) {
      console.warn('Database not available for audit logs')
      return []
    }

    const auditLogsRef = database.ref('audit_logs')
    const logsQuery = auditLogsRef.orderByChild('timestamp').limitToLast(limit)

    const snapshot = await logsQuery.once('value')

    if (!snapshot.exists()) {
      return []
    }

    const logs: AuditLog[] = []
    snapshot.forEach((childSnapshot: any) => {
      logs.push({
        id: childSnapshot.key!,
        ...childSnapshot.val()
      })
      return false // Continue iteration
    })

    // Reverse to get most recent first
    return logs.reverse()
  } catch (error) {
    console.error('Error getting audit logs:', error)
    return []
  }
}

/**
 * Get audit logs filtered by resource type
 */
export async function getAuditLogsByResourceType(
  resourceType: AuditResourceType,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const allLogs = await getAuditLogs(limit * 2) // Get more to account for filtering
    return allLogs.filter(log => log.resourceType === resourceType).slice(0, limit)
  } catch (error) {
    console.error('Error getting audit logs by resource type:', error)
    return []
  }
}

/**
 * Get audit logs filtered by action
 */
export async function getAuditLogsByAction(action: AuditAction, limit: number = 50): Promise<AuditLog[]> {
  try {
    const allLogs = await getAuditLogs(limit * 2)
    return allLogs.filter(log => log.action === action).slice(0, limit)
  } catch (error) {
    console.error('Error getting audit logs by action:', error)
    return []
  }
}

/**
 * Get audit logs for a specific admin
 */
export async function getAuditLogsByAdmin(adminEmail: string, limit: number = 50): Promise<AuditLog[]> {
  try {
    const allLogs = await getAuditLogs(limit * 2)
    return allLogs.filter(log => log.adminEmail === adminEmail).slice(0, limit)
  } catch (error) {
    console.error('Error getting audit logs by admin:', error)
    return []
  }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  return getAuditLogs(limit)
}

/**
 * Helper to format audit log for display
 */
export function formatAuditLog(log: AuditLog): string {
  const action = log.action.charAt(0).toUpperCase() + log.action.slice(1)
  const resource = log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)
  return `${action}d ${resource}: ${log.resourceTitle}`
}

/**
 * Helper to get action color for UI
 */
export function getActionColor(action: AuditAction): string {
  switch (action) {
    case 'create':
      return 'green'
    case 'update':
      return 'blue'
    case 'delete':
      return 'red'
    default:
      return 'gray'
  }
}
