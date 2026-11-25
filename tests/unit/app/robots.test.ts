import robots from '~/app/robots'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

describe('robots route', () => {
  it('points to app sitemap', () => {
    const value = robots()

    expect(value.sitemap).toBe(`${siteUrl}/sitemap.xml`)
    expect(value.rules).toEqual({
      userAgent: '*',
      allow: '/',
    })
  })
})
