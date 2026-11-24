import { render, screen } from '@testing-library/react'
import type { Event, Guest } from '~/app/utils/shared-types'
import { useRsvpForm, useUpdateRsvpForm } from '~/components/contexts/rsvp-form-context'
import EventRsvpForm from '~/components/website/forms/steps/event-rsvp'

jest.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
jest.mock('~/components/contexts/rsvp-form-context', () => ({
  useRsvpForm: jest.fn(),
  useUpdateRsvpForm: jest.fn(),
}))

const mockUseRsvpForm = jest.mocked(useRsvpForm)
const mockUseUpdateRsvpForm = jest.mocked(useUpdateRsvpForm)

const event = {
  id: 'event-1',
  name: 'Wedding Ceremony',
  date: new Date('2027-06-12T00:00:00.000Z'),
  startTime: '7:30 PM',
  endTime: null,
  venue: null,
  attire: null,
  description: null,
  weddingId: 'wedding-1',
  collectRsvp: true,
  questions: [],
} as Event

const invitedGuests: Guest[] = []

describe('EventRsvpForm', () => {
  beforeEach(() => {
    mockUseRsvpForm.mockReturnValue({
      weddingData: {
        groomFirstName: 'Alex',
        brideFirstName: 'Jordan',
        timeFormat: 'TWENTY_FOUR_HOUR',
        events: [],
      },
      rsvpResponses: [],
      answersToQuestions: [],
    })
    mockUseUpdateRsvpForm.mockReturnValue(jest.fn())
  })

  it.each([
    ['TWELVE_HOUR', '7:30 PM'],
    ['TWENTY_FOUR_HOUR', '19:30'],
  ] as const)('formats the event start time using %s preference', (timeFormat, expectedTime) => {
    mockUseRsvpForm.mockReturnValue({
      weddingData: {
        groomFirstName: 'Alex',
        brideFirstName: 'Jordan',
        timeFormat,
        events: [],
      },
      rsvpResponses: [],
      answersToQuestions: [],
    })

    render(
      <EventRsvpForm
        event={event}
        invitedGuests={invitedGuests}
        goNext={jest.fn()}
        goBack={jest.fn()}
      />
    )

    expect(screen.getByText(expectedTime, { exact: false })).toBeInTheDocument()
  })
})
