'use client'

import { ChevronDown } from 'lucide-react'

type WorkspaceChoice = {
  organizationId: string
  displayName: string
  isActive: boolean
}

interface WeddingChipCardProps {
  coupleName?: string
  weddingDate?: string
  weddingLocation?: string
  workspaces?: WorkspaceChoice[]
  activeOrganizationId?: string | null
  onSwitchWorkspace?: (organizationId: string) => void
  isSwitchingWorkspace?: boolean
}

export default function WeddingChipCard(props: Readonly<WeddingChipCardProps>) {
  const {
    coupleName,
    weddingDate,
    weddingLocation,
    workspaces = [],
    activeOrganizationId,
    onSwitchWorkspace,
    isSwitchingWorkspace = false,
  } = props

  const hasMultipleWorkspaces = workspaces.length > 1

  return (
    <div className='mx-3 mt-3 mb-1 rounded-xl bg-sidebar-accent px-3.5 py-3 shadow-sm'>
      {coupleName && (
        <p className='mb-1 font-display text-[1.35rem] text-sidebar-foreground leading-tight'>
          {coupleName}
        </p>
      )}

      {weddingDate && <p className='text-muted-foreground text-xs'>{weddingDate}</p>}
      {weddingLocation && <p className='text-muted-foreground text-xs'>{weddingLocation}</p>}

      {hasMultipleWorkspaces && (
        <div className='relative mt-3 border-sidebar-border border-t pt-3'>
          <label htmlFor='wedding-workspace-selector' className='mb-1 block text-muted-foreground text-xs'>
            Switch wedding
          </label>
          <select
            id='wedding-workspace-selector'
            value={activeOrganizationId ?? ''}
            disabled={isSwitchingWorkspace}
            onChange={(event) => onSwitchWorkspace?.(event.target.value)}
            className='w-full appearance-none rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 pr-8 text-sm text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:cursor-wait disabled:opacity-60'
          >
            {workspaces.map((workspace) => (
              <option key={workspace.organizationId} value={workspace.organizationId}>
                {workspace.displayName}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden='true'
            className='pointer-events-none absolute right-2.5 bottom-2.5 h-4 w-4 text-muted-foreground'
          />
        </div>
      )}
    </div>
  )
}
