
import type { ActiveOrganization } from '~/server/authz/authorization.types'
import { WorkspaceScopeRepository } from '~/server/authz/workspace-scope.repository'
import { WorkspaceScopeService } from '~/server/authz/workspace-scope.service'

export type WorkspaceScope = {
  activeOrganization: ActiveOrganization | null
  activeWeddingId: string | null
}

const getSessionToken = (session: unknown): string | null => {
  if (!session || typeof session !== 'object') {
    return null
  }

  const sessionRecord =
    'session' in session && typeof session.session === 'object' && session.session !== null
      ? (session.session as Record<string, unknown>)
      : null

  if (!sessionRecord) {
    return null
  }

  const sessionToken = sessionRecord.token
  return typeof sessionToken === 'string' && sessionToken.length > 0
    ? sessionToken
    : null
}

export const getSessionActiveOrganizationId = (session: unknown): string | null => {
  if (!session || typeof session !== 'object') {
    return null
  }

  const sessionRecord =
    'session' in session && typeof session.session === 'object' && session.session !== null
      ? (session.session as Record<string, unknown>)
      : null

  if (!sessionRecord) {
    return null
  }

  const activeOrganizationId = sessionRecord.activeOrganizationId
  if (typeof activeOrganizationId === 'string' && activeOrganizationId.length > 0) {
    return activeOrganizationId
  }

  const activeOrganization =
    typeof sessionRecord.activeOrganization === 'object' &&
    sessionRecord.activeOrganization !== null
      ? (sessionRecord.activeOrganization as Record<string, unknown>)
      : null

  const nestedOrganizationId = activeOrganization?.id
  if (typeof nestedOrganizationId === 'string' && nestedOrganizationId.length > 0) {
    return nestedOrganizationId
  }

  return null
}

const workspaceScopeService = new WorkspaceScopeService(new WorkspaceScopeRepository())

export async function resolveWorkspaceScope(input: {
  session: unknown
  userId: string
}): Promise<WorkspaceScope> {
  const { session, userId } = input

  return workspaceScopeService.resolve({
    userId,
    sessionToken: getSessionToken(session),
    sessionActiveOrganizationId: getSessionActiveOrganizationId(session),
  })
}

export async function listMyWorkspaces(userId: string) {
  return workspaceScopeService.listMyWorkspaces(userId)
}

export async function switchWorkspace(input: {
  session: unknown
  userId: string
  organizationId: string
}) {
  return workspaceScopeService.switchWorkspace({
    userId: input.userId,
    sessionToken: getSessionToken(input.session),
    organizationId: input.organizationId,
  })
}
