import { render, screen } from '@testing-library/react'

import EventsPage from '~/app/(authenicated)/events/page'

const mockGetRequiredWedding = jest.fn()
const mockGetEventsWithStats = jest.fn()
const mockEventsPageClient = jest.fn(
  ({ initialEvents, timeFormat }: { initialEvents: unknown[]; timeFormat?: string }) => (
    <div data-testid='events-page-client'>
      {initialEvents.length}:{timeFormat}
    </div>
  )
)
const mockDashboardTopbar = jest.fn(
  (_props: { title?: string; showManagementActions?: boolean }) => (
    <header data-testid='dashboard-topbar'>Topbar</header>
  )
)

jest.mock('~/server/application/authenticated-route/authenticated-route-data', () => ({
  getRequiredWedding: () => mockGetRequiredWedding(),
}))

jest.mock('~/trpc/server', () => ({
  api: {
    event: {
      getAllByUserIdWithStats: () => mockGetEventsWithStats(),
    },
  },
}))

jest.mock('~/app/(authenicated)/events/_components/events-page-client', () => ({
  EventsPageClient: ({
    initialEvents,
    timeFormat,
  }: {
    initialEvents: unknown[]
    timeFormat?: string
  }) => mockEventsPageClient({ initialEvents, timeFormat }),
}))

jest.mock('~/components/dashboard/dashboard-topbar', () => ({
  __esModule: true,
  default: (props: { title?: string; showManagementActions?: boolean }) =>
    mockDashboardTopbar(props),
}))

describe('EventsPage', () => {
  beforeEach(() => {
    mockGetRequiredWedding.mockReset()
    mockGetRequiredWedding.mockResolvedValue({ timeFormat: 'TWENTY_FOUR_HOUR' })
    mockGetEventsWithStats.mockReset()
    mockEventsPageClient.mockClear()
    mockDashboardTopbar.mockClear()
  })

  it('fetches events on server and passes initialEvents to client', async () => {
    mockGetRequiredWedding.mockResolvedValue({ timeFormat: 'TWENTY_FOUR_HOUR' })
    mockGetEventsWithStats.mockResolvedValue([{ id: 'evt-1' }])

    const page = await EventsPage({})
    render(page)

    expect(mockGetRequiredWedding).toHaveBeenCalledTimes(1)
    expect(mockGetEventsWithStats).toHaveBeenCalledTimes(1)
    expect(mockEventsPageClient).toHaveBeenCalledWith({
      initialEvents: [{ id: 'evt-1' }],
      timeFormat: 'TWENTY_FOUR_HOUR',
    })
    expect(screen.getByTestId('events-page-client')).toBeInTheDocument()
  })

  it('passes an empty array when server query returns undefined', async () => {
    mockGetRequiredWedding.mockResolvedValue({ timeFormat: 'TWENTY_FOUR_HOUR' })
    mockGetEventsWithStats.mockResolvedValue(undefined)

    const page = await EventsPage({})
    render(page)

    expect(mockEventsPageClient).toHaveBeenCalledWith({
      initialEvents: [],
      timeFormat: 'TWENTY_FOUR_HOUR',
    })
  })

  it('renders dashboard topbar and authenticated page shell', async () => {
    mockGetRequiredWedding.mockResolvedValue({ timeFormat: 'TWENTY_FOUR_HOUR' })
    mockGetEventsWithStats.mockResolvedValue([])

    const page = await EventsPage({})
    const { container } = render(page)

    expect(mockDashboardTopbar).toHaveBeenCalledWith({
      title: 'Events',
      showManagementActions: false,
    })
    expect(screen.getByTestId('dashboard-topbar')).toBeInTheDocument()
    expect(
      container.querySelector('main.min-h-0.flex-1.overflow-y-auto.px-4.py-5.lg\\:px-6.lg\\:py-6')
    ).toBeTruthy()
  })
})
