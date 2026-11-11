'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { authClient } from '~/lib/auth-client'

type AuthResult = {
  data?: { status?: boolean; success?: boolean }
  error?: { message?: string } | null
}

export function EmailVerificationForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function verifyEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      setError('Enter your email address and the six-digit verification code.')
      return
    }

    setIsVerifying(true)
    try {
      const result = (await authClient.$fetch('/email-otp/verify-email', {
        method: 'POST',
        body: { email: email.trim(), otp },
      })) as AuthResult

      if (result.error) {
        throw new Error(result.error.message || 'Verification failed.')
      }

      if (!result.data?.status) {
        throw new Error('The verification code could not be confirmed.')
      }

      router.replace('/auth/sign-in?notice=verified')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    } finally {
      setIsVerifying(false)
    }
  }

  async function resendCode() {
    setError('')
    setMessage('')
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }

    setIsResending(true)
    try {
      const result = (await authClient.$fetch('/email-otp/send-verification-otp', {
        method: 'POST',
        body: { email: email.trim(), type: 'email-verification' },
      })) as AuthResult

      if (result.error || !result.data?.success) {
        throw new Error(result.error?.message || 'Unable to resend the verification code.')
      }

      setMessage('A new verification code has been sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend the code.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <h1 className="text-xl font-semibold">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the email address you registered with and the six-digit code we sent you.
      </p>

      <form onSubmit={verifyEmail} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-email">Email address</Label>
          <Input
            id="verification-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification-otp">Verification code</Label>
          <Input
            id="verification-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">{error}</p>
        ) : null}
        {message ? (
          <p role="status" className="text-sm text-muted-foreground">{message}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isVerifying || isResending}>
          {isVerifying ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full"
        onClick={resendCode}
        disabled={isVerifying || isResending}
      >
        {isResending ? 'Sending…' : 'Resend verification code'}
      </Button>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </section>
  )
}
