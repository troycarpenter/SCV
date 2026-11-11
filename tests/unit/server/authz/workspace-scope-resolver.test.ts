
import { decideWorkspaceScope } from '~/server/authz/workspace-scope-resolver'

describe('decideWorkspaceScope', () => {
  it('uses the explicit session organization when it has a linked wedding', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: 'org-session',
      lastActiveOrganizationId: 'org-preferred',
      scopedSessionRow: {
        organizationId: 'org-session',
        isPrimaryWedding: false,
        role: 'admin',
        weddingId: 'wedding-session',
      },
      candidateScopes: [],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-session',
        role: 'admin',
      },
      activeWeddingId: 'wedding-session',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: null,
    })
  })

  it('clears stale session organization and uses saved preference when available', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: 'org-stale',
      lastActiveOrganizationId: 'org-preferred',
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-primary',
          isPrimaryWedding: true,
          role: 'owner',
          weddingId: 'wedding-primary',
        },
        {
          organizationId: 'org-preferred',
          isPrimaryWedding: false,
          role: 'admin',
          weddingId: 'wedding-preferred',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-preferred',
        role: 'admin',
      },
      activeWeddingId: 'wedding-preferred',
      clearSessionActiveOrganizationId: true,
      persistActiveOrganizationId: 'org-preferred',
    })
  })

  it('clears stale session organization and uses primary candidate when preference is unavailable', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: 'org-stale',
      lastActiveOrganizationId: null,
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-primary',
          isPrimaryWedding: true,
          role: 'owner',
          weddingId: 'wedding-primary',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-primary',
        role: 'owner',
      },
      activeWeddingId: 'wedding-primary',
      clearSessionActiveOrganizationId: true,
      persistActiveOrganizationId: 'org-primary',
    })
  })

  it('clears stale session organization and returns empty scope when no candidates exist', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: 'org-stale',
      lastActiveOrganizationId: null,
      scopedSessionRow: undefined,
      candidateScopes: [],
    })

    expect(result).toEqual({
      activeOrganization: null,
      activeWeddingId: null,
      clearSessionActiveOrganizationId: true,
      persistActiveOrganizationId: null,
    })
  })

  it('uses saved preference when no session organization exists', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: null,
      lastActiveOrganizationId: 'org-preferred',
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-primary',
          isPrimaryWedding: true,
          role: 'owner',
          weddingId: 'wedding-primary',
        },
        {
          organizationId: 'org-preferred',
          isPrimaryWedding: false,
          role: 'admin',
          weddingId: 'wedding-preferred',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-preferred',
        role: 'admin',
      },
      activeWeddingId: 'wedding-preferred',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: 'org-preferred',
    })
  })

  it('ignores saved preference when it does not match an available wedding', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: null,
      lastActiveOrganizationId: 'org-unavailable',
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-primary',
          isPrimaryWedding: true,
          role: 'owner',
          weddingId: 'wedding-primary',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-primary',
        role: 'owner',
      },
      activeWeddingId: 'wedding-primary',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: 'org-primary',
    })
  })

  it('uses primary candidate when no session organization or saved preference exists', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: null,
      lastActiveOrganizationId: null,
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-primary',
          isPrimaryWedding: true,
          role: 'member',
          weddingId: 'wedding-primary',
        },
        {
          organizationId: 'org-secondary',
          isPrimaryWedding: false,
          role: 'admin',
          weddingId: 'wedding-secondary',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-primary',
        role: 'member',
      },
      activeWeddingId: 'wedding-primary',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: 'org-primary',
    })
  })

  it('uses sole candidate when no primary or saved preference exists', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: null,
      lastActiveOrganizationId: null,
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-only',
          isPrimaryWedding: false,
          role: 'viewer',
          weddingId: 'wedding-only',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-only',
        role: 'viewer',
      },
      activeWeddingId: 'wedding-only',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: 'org-only',
    })
  })

  it('picks first candidate when multiple non-primary candidates exist', () => {
    const result = decideWorkspaceScope({
      sessionActiveOrganizationId: null,
      lastActiveOrganizationId: null,
      scopedSessionRow: undefined,
      candidateScopes: [
        {
          organizationId: 'org-1',
          isPrimaryWedding: false,
          role: 'owner',
          weddingId: 'wedding-1',
        },
        {
          organizationId: 'org-2',
          isPrimaryWedding: false,
          role: 'admin',
          weddingId: 'wedding-2',
        },
      ],
    })

    expect(result).toEqual({
      activeOrganization: {
        organizationId: 'org-1',
        role: 'owner',
      },
      activeWeddingId: 'wedding-1',
      clearSessionActiveOrganizationId: false,
      persistActiveOrganizationId: 'org-1',
    })
  })
})
