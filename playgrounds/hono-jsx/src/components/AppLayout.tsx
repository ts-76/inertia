import { setLayoutProps } from '@inertiajs/hono-jsx'
import type { PropsWithChildren } from 'hono/jsx'

export function AppLayout({ children, section = 'Playground' }: PropsWithChildren<{ section?: string }>) {
  setLayoutProps({ section })

  return (
    <div data-layout="app">
      <aside>
        <strong>{section}</strong>
      </aside>
      {children}
    </div>
  )
}

