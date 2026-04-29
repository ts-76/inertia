import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/hono-jsx-dom'
import type { Child } from 'hono/jsx/dom'

declare global {
  interface Window {
    testing: { Inertia: typeof router }
  }
}

window.testing = { Inertia: router }

const DefaultLayout = ({ children, sharedLabel }: { children?: Child; sharedLabel?: string }) => (
  <section data-testid="default-layout">
    <p data-testid="default-layout-shared">{sharedLabel || 'no-shared-layout-props'}</p>
    {children}
  </section>
)

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })

    return pages[`./Pages/${name}.tsx`]
  },
  layout: () => DefaultLayout,
  progress: {
    delay: 0,
    color: 'red',
  },
})
