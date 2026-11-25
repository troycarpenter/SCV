import sitemap from '~/app/sitemap'

const mockGetAllPublishedSlugs = jest.fn()
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

jest.mock('~/lib/blog/posts', () => ({
  getAllPublishedSlugs: () => mockGetAllPublishedSlugs(),
}))

describe('sitemap route', () => {
  beforeEach(() => {
    mockGetAllPublishedSlugs.mockReset()
    mockGetAllPublishedSlugs.mockReturnValue(['introducing-oswp', 'release-0-3-0'])
  })

  it('includes static marketing routes and published blog slugs', () => {
    const entries = sitemap()

    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain(`${siteUrl}/`))
    expect(urls).toContain(`${siteUrl}/blog`))
    expect(urls).toContain(`${siteUrl}/pricing`))
    expect(urls).toContain(`${siteUrl}/open-source`))
    expect(urls).toContain(`${siteUrl}/blog/introducing-oswp`))
    expect(urls).toContain(`${siteUrl}/blog/release-0-3-0`))
  })
})
