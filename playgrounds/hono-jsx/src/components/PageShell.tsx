import type { PropsWithChildren } from 'hono/jsx'

export function PageShell({ children }: PropsWithChildren) {
  return (
    <main>
      <header>
        <p>Hono JSX adapter playground</p>
      </header>

      {children}
    </main>
  )
}

