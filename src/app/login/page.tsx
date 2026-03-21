import { LoginButton } from '@/components/auth/login-button'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 p-8 rounded-3xl bg-card border border-border w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-5xl">🚀</span>
          <h1 className="text-3xl font-bold text-foreground">Vesty</h1>
          <p className="text-muted-foreground text-sm">
            תיק המניות שלך, בצורה כיפית
          </p>
        </div>
        <LoginButton />
      </div>
    </main>
  )
}
