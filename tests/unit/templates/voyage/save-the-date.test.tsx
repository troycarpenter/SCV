import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { buildSaveTheDateCalendarLinks } from '~/lib/website/calendar'
import type { WeddingPageData } from '~/server/domains/website/website.types'
import { VoyageSaveTheDate } from '~/templates/voyage/components/save-the-date'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
jest.mock('~/lib/website/calendar', () => ({
  buildSaveTheDateCalendarLinks: jest.fn(() => null),
}))

const mockBuildSaveTheDateCalendarLinks = jest.mocked(buildSaveTheDateCalendarLinks)

const weddingData = {
  nameOrder: 'BRIDE_FIRST',
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

  it('uses the first event venue even when a later event is named Wedding Day', () => {
    const events = [
      weddingData.events[0],
      {
        ...weddingData.events[0],
        id: 'event-2',
        name: 'Wedding Day',
        venue: 'The Ceremony Hall',
      },
    ]
    const data = {
      ...weddingData,
      events: [{ ...events[0], name: 'Welcome Dinner', venue: 'The First Venue' }, events[1]],
    } as WeddingPageData

    render(<VoyageSaveTheDate weddingData={data} path='/w/alex-jordan' />)

    expect(screen.getByText('The First Venue')).toBeInTheDocument()
    expect(screen.queryByText('The Ceremony Hall')).not.toBeInTheDocument()
    expect(mockBuildSaveTheDateCalendarLinks).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'The First Venue', events: data.events })
    )
  })

  it('uses the configured couple-name order in calendar details', () => {
    render(<VoyageSaveTheDate weddingData={weddingData} path='/w/alex-jordan' />)

    expect(screen.getByRole('heading', { name: 'Jordan & Alex' })).toBeInTheDocument()
    expect(mockBuildSaveTheDateCalendarLinks).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Jordan & Alex Wedding',
        description:
          'Save the date for the wedding of Jordan & Alex! Formal invitation to follow. https://example.com/w/alex-jordan',
      })
    )
  })
})
