
import type { WorkspaceChoiceRow, WorkspaceScopeRepository } from '~/server/authz/workspace-scope.repository'
import { decideWorkspaceScope } from '~/server/authz/workspace-scope-resolver'

type WorkspaceScope = {
  activeOrganization: {
    organizationId: string
    role: string | null
  } | null
  activeWeddingId: string | null
}

type ResolveWorkspaceScopeInput = {
  userId: string
  sessionToken: string | null
  sessionActiveOrganizationId: string | null
}

type SwitchWorkspaceInput = {
  userId: string
  sessionToken: string | null
  organizationId: string
}

type WorkspaceScopeRepositoryContract = Pick<
  WorkspaceScopeRepository,
  | 'findCandidateScopes'
  | 'findScopeForOrganization'
  | 'findWorkspaceChoices'
  | 'setActiveOrganizationId'
  | 'getLastActiveOrganizationId'
  | 'setLastActiveOrganizationId'
>

export class WorkspaceScopeService {
  constructor(private repository: WorkspaceScopeRepositoryContract) {}

  async resolve(input: ResolveWorkspaceScopeInput): Promise<WorkspaceScope> {
    const { userId, sessionToken, sessionActiveOrganizationId } = input

    const lastActiveOrganizationId =
      await this.repository.getLastActiveOrganizationId(userId)

    const scopedSessionRow = sessionActiveOrganizationId
      ? await this.repository.findScopeForOrganization(userId, sessionActiveOrganizationId)
      : undefined

    const hasValidSessionScope = Boolean(scopedSessionRow?.weddingId)

    const candidateScopes =
      sessionActiveOrganizationId && hasValidSessionScope
        ? []
        : await this.repository.findCandidateScopes(userId)

    const decision = decideWorkspaceScope({
      sessionActiveOrganizationId,
      lastActiveOrganizationId,
      scopedSessionRow,
      candidateScopes,
    })

    if (hasValidSessionScope && sessionActiveOrganizationId) {
      if (lastActiveOrganizationId !== sessionActiveOrganizationId) {
        await this.repository.setLastActiveOrganizationId(
          userId,
          sessionActiveOrganizationId
        )
      }
    } else if (decision.persistActiveOrganizationId) {
      await this.repository.setActiveOrganizationId(
        sessionToken,
        decision.persistActiveOrganizationId
      )

      if (lastActiveOrganizationId !== decision.persistActiveOrganizationId) {
        await this.repository.setLastActiveOrganizationId(
          userId,
          decision.persistActiveOrganizationId
        )
      }
    } else if (decision.clearSessionActiveOrganizationId) {
      await this.repository.setActiveOrganizationId(sessionToken, null)
    }

    return {
      activeOrganization: decision.activeOrganization,
      activeWeddingId: decision.activeWeddingId,
    }
  }

  async listMyWorkspaces(userId: string): Promise<WorkspaceChoiceRow[]> {
    return this.repository.findWorkspaceChoices(userId)
  }

  async switchWorkspace(input: SwitchWorkspaceInput): Promise<WorkspaceScope | null> {
    const { userId, sessionToken, organizationId } = input

    const scope = await this.repository.findScopeForOrganization(
      userId,
      organizationId
    )

    // A user may switch only to an organization where they are a member
    // and which has a linked wedding.
    if (!scope?.weddingId) {
      return null
    }

    await this.repository.setActiveOrganizationId(sessionToken, organizationId)
    await this.repository.setLastActiveOrganizationId(userId, organizationId)

    return {
      activeOrganization: {
        organizationId: scope.organizationId,
        role: scope.role,
      },
      activeWeddingId: scope.weddingId,
    }
  }
}
