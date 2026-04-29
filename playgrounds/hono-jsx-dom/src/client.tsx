import { createInertiaApp, router, type ResolvedComponent } from '@inertiajs/hono-jsx-dom'

declare global {
  interface Window {
    playground: {
      Inertia: typeof router
    }
  }
}

window.playground = { Inertia: router }

createInertiaApp({
  resolve: (name: string) => {
    const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx', { eager: true })

    return pages[`./Pages/${name}.tsx`]
  },
  progress: {
    delay: 0,
    color: '#22c55e',
  },
})
