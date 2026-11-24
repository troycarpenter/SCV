import { render, screen } from '@testing-library/react'
import { useRsvpForm } from '~/components/contexts/rsvp-form-context'
import RsvpConfirmation from '~/components/website/rsvp-confirmation'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { coupleNames?: string }) =>
    values?.coupleNames ? `${key} ${values.coupleNames}` : key,
}))
jest.mock('~/components/contexts/rsvp-form-context', () => ({
  useRsvpForm: jest.fn(),
}))

const mockUseRsvpForm = jest.mocked(useRsvpForm)

describe('RsvpConfirmation', () => {
  beforeEach(() => {
    mockUseRsvpForm.mockReturnValue({
      weddingData: {
        groomFirstName: 'Alex',
        brideFirstName: 'Jordan',
        nameOrder: 'BRIDE_FIRST',
        events: [],
      },
      rsvpResponses: [],
      answersToQuestions: [],
    })
  })

  it('renders the homepage control as a native link to the wedding homepage', () => {
    render(<RsvpConfirmation basePath='/wedding' setCurrentStep={jest.fn()} />)

    const link = screen.getByRole('link', { name: 'backToHomepage' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/wedding')
  })

  it('uses the configured couple-name order in the confirmation heading', () => {
    render(<RsvpConfirmation basePath='/wedding' setCurrentStep={jest.fn()} />)

    expect(
      screen.getByRole('heading', { name: 'confirmationTitle Jordan & Alex' })
    ).toBeInTheDocument()
  })
})
