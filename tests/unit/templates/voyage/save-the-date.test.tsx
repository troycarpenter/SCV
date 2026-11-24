import { render, screen } from '@testing-library/react'
import { buildSaveTheDateCalendarLinks } from '~/lib/website/calendar'
import { VoyageSaveTheDate } from '~/templates/voyage/components/save-the-date'
import type { WeddingPageData } from '~/server/domains/website/website.types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
jest.mock('~/lib/website/calendar', () => ({
  buildSaveTheDateCalendarLinks: jest.fn(() => null),
}))

const mockBuildSaveTheDateCalendarLinks = jest.mocked(buildSaveTheDateCalendarLinks)

const weddingData = {
  nameOrder: 'GROOM_FIRST',
  groomFirstName: 'Alex',
  groomLastName: 'Smith',
  brideFirstName: 'Jordan',
  brideLastName: 'Jones',
  date: { standardFormat: 'June 12, 2027', numberFormat: '06.12.2027' },
  websiteBuilderEnabled: true,
  website: {
    id: 'website-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    weddingId: 'wedding-1',
    subUrl: 'alex-jordan',
    templateId: 'voyage',
    isPasswordEnabled: false,
    password: null,
    isRsvpEnabled: true,
    coverPhotoUrl: null,
    headerImageUrl: null,
    coupleImageUrls: [],
    url: 'https://example.com/w/alex-jordan',
    introText: '',
    generalQuestions: [],
  },
  sections: [],
  daysRemaining: 0,
  events: [
    {
      id: 'event-1',
      name: 'Wedding Day',
      date: new Date('2027-06-12T00:00:00.000Z'),
      startTime: null,
      endTime: null,
      venue: 'The Garden',
      attire: null,
      description: null,
      weddingId: 'wedding-1',
      collectRsvp: true,
      questions: [],
    },
  ],
} as WeddingPageData

describe('VoyageSaveTheDate', () => {
  beforeEach(() => {
    mockBuildSaveTheDateCalendarLinks.mockClear()
  })

  it('uses the configured couple-name order in calendar details', () => {
    render(<VoyageSaveTheDate weddingData={weddingData} path='/w/alex-jordan' />)

    expect(screen.getByRole('heading', { name: 'Alex & Jordan' })).toBeInTheDocument()
    expect(mockBuildSaveTheDateCalendarLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Alex & Jordan Wedding',
        description:
          'Save the date for the wedding of Alex & Jordan! Formal invitation to follow. https://example.com/w/alex-jordan',
      })
    )
  })
})
