import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EmailVerificationForm } from '~/components/auth/email-verification-form'

const mockFetch = jest.fn()
const mockReplace = jest.fn()

jest.mock('~/lib/auth-client', () => ({
  authClient: { $fetch: (...args: unknown[]) => mockFetch(...args) },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

describe('EmailVerificationForm', () => {
  beforeEach(() => {
    mockFetch.mockReset().mockResolvedValue({ data: { status: true } })
    mockReplace.mockReset()
  })

  async function submitVerification() {
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'person@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Verification code'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))
    await waitFor(() => expect(mockReplace).toHaveBeenCalled())
  }

  it('redirects to redirectTo after successful verification', async () => {
    render(<EmailVerificationForm redirectTo='/auth/accept-invitation?invitationId=inv_1' />)
    await submitVerification()
    expect(mockReplace).toHaveBeenCalledWith('/auth/accept-invitation?invitationId=inv_1')
  })

  it('uses callbackUrl when redirectTo is absent', async () => {
    render(<EmailVerificationForm callbackUrl='/dashboard?welcome=1' />)
    await submitVerification()
    expect(mockReplace).toHaveBeenCalledWith('/dashboard?welcome=1')
  })

  it('falls back to the home page for an external redirect', async () => {
    render(<EmailVerificationForm redirectTo='https://attacker.example/path' />)
    await submitVerification()
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('falls back to the home page for a protocol-relative redirect', async () => {
    render(<EmailVerificationForm redirectTo='//attacker.example/path' />)
    await submitVerification()
    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('uses the home page when no redirect destination is supplied', async () => {
    render(<EmailVerificationForm />)
    await submitVerification()
    expect(mockReplace).toHaveBeenCalledWith('/')
  })
})
