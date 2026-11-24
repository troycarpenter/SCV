import { EmailVerificationForm } from '~/components/auth/email-verification-form'

type SearchParamValue = string | string[] | undefined

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function EmailVerificationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>
}) {
  const params = (await searchParams) ?? {}

  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4 py-8'>
      <EmailVerificationForm
        redirectTo={firstValue(params.redirectTo)}
        callbackUrl={firstValue(params.callbackUrl)}
      />
    </main>
  )
}
