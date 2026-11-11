'use client'

import { api } from '~/trpc/react'

const fallbackWorkspace = {
  organizationId: null,
  weddingId: null,
  role: null,
  capabilities: {
    canInviteMembers: false,
    canManageMembers: false,
    canSendInvites: false,
    canViewPlanning: false,
  },
}

export function useWorkspace() {
  const utils = api.useUtils()
  const query = api.wedding.getWorkspace.useQuery()
  const workspacesQuery = api.wedding.listMyWorkspaces.useQuery()

  const switchMutation = api.wedding.switchWorkspace.useMutation({
    onSuccess: async () => {
      await utils.invalidate()
    },
  })

  return {
    ...query,
    workspace: query.data ?? fallbackWorkspace,
    workspaces: workspacesQuery.data ?? [],
    workspacesLoading: workspacesQuery.isLoading,
    switchWorkspace: switchMutation.mutate,
    isSwitchingWorkspace: switchMutation.isPending,
  }
}
