import { formatCoupleNames } from '~/app/utils/helpers'

type WeddingInfoInput = {
  brideFirstName?: string | null
  nameOrder?: 'BRIDE_FIRST' | 'GROOM_FIRST' | null
  groomFirstName?: string | null
  date?: {
    standardFormat?: string | null
  } | null
  location?: string | null
}

type SidebarWeddingInfo = {
  coupleName: string | undefined
  weddingDate: string | undefined
  weddingLocation: string | undefined
}

export function getSidebarWeddingInfo(weddingData?: WeddingInfoInput): SidebarWeddingInfo {
  const coupleName = weddingData ? formatCoupleNames(weddingData) || undefined : undefined
  const weddingDate = weddingData?.date?.standardFormat?.trim() || undefined
  const weddingLocation = weddingData?.location?.trim() || undefined

  return {
    coupleName,
    weddingDate,
    weddingLocation,
  }
}
