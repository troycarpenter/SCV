'use client'

import { AuthUIProvider } from '@daveyplate/better-auth-ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { ThemeProvider } from '~/components/theme-provider'
import { PostHogProvider } from '~/lib/analytics/posthog-client'
import { authClient } from '~/lib/auth-client'
import { authUiCustomOrganizationRoles } from '~/lib/organization-roles'

const EMAIL_VERIFICATION_PATH = '/auth/email-verification'

// The auth UI navigates to the OTP step without the current query string, which drops
// `redirectTo` (e.g. an organization invite to accept after sign-up). Carry it over so the
// user still lands where they were headed once verification succeeds.
const AUTH_HANDOFF_PARAMS = ['redirectTo', 'callbackUrl'] as const

function withAuthRedirects(path: string): string {
  if (typeof window === 'undefined') return path
  const url = new URL(path, window.location.origin)
  if (url.pathname !== EMAIL_VERIFICATION_PATH) return path
  const currentParams = new URLSearchParams(window.location.search)
  for (const key of AUTH_HANDOFF_PARAMS) {
    const value = currentParams.get(key)
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value)
  }
  return `${url.pathname}${url.search}`
}

export function Providers({
  children,
  signupsEnabled = true,
}: {
  children: ReactNode
  /** Server-resolved ALLOW_SIGNUPS flag; hides sign-up UI when false. */
  signupsEnabled?: boolean
}) {
  const router = useRouter()

  return (
    <PostHogProvider>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <AuthUIProvider
          authClient={authClient}
          navigate={(path) => {
            // Better Auth UI sends unverified signups to sign-in because no session token exists.
            // Route that specific signup outcome to our custom email verification form.
            if (path.startsWith('/auth/sign-in') && window.location.pathname === '/auth/sign-up') {
              router.push(withAuthRedirects(EMAIL_VERIFICATION_PATH))
              return
            }

            router.push(withAuthRedirects(path))
          }}
          replace={(path) => router.replace(path)}
          onSessionChange={() => {
            router.refresh()
          }}
          Link={Link}
          emailOTP
          signUp={signupsEnabled}
          emailVerification={true}
          organization={{
            customRoles: authUiCustomOrganizationRoles,
          }}
        >
          {children}
        </AuthUIProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
