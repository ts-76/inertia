# Inertia.js Hono JSX DOM Adapter

The Hono JSX DOM adapter for Inertia.js.

This package is a client-side adapter for apps that render interactive pages with `hono/jsx/dom`.
It delegates the Inertia protocol, visits, history, progress, partial reloads, remembered state, and
prefetch cache to `@inertiajs/core`.

```tsx
import { createInertiaApp } from '@inertiajs/hono-jsx-dom'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })

    return pages[`./Pages/${name}.tsx`]
  },
})
```

Without a custom `setup`, the adapter mounts `<App />` for you. It uses `hydrateRoot` when the root
element has `data-server-rendered`, otherwise it uses `createRoot`.

## API

The adapter exports:

- `createInertiaApp`
- `App`
- `Link`
- `Head`
- `Deferred`
- `WhenVisible`
- `InfiniteScroll`
- `Form`
- `usePage`
- `useForm`
- `useHttp`
- `useRemember`
- `usePoll`
- `usePrefetch`
- `useFormContext`
- `setLayoutProps`
- `resetLayoutProps`
- `router`, `http`, and `progress` from `@inertiajs/core`
- `@inertiajs/hono-jsx-dom/server`, which re-exports the Inertia SSR server helper

The `createInertiaApp()` `layout` option matches the React adapter shape. The older
`defaultLayout` option is also accepted as an alias.

## Example page

```tsx
import { Form, Head, Link, usePage } from '@inertiajs/hono-jsx-dom'

export default function UsersIndex() {
  const page = usePage<{ users: Array<{ id: number; name: string }> }>()

  return (
    <main>
      <Head title="Users" />
      <h1>Users</h1>

      {page.props.users.map((user) => (
        <Link href={`/users/${user.id}`} key={user.id}>
          {user.name}
        </Link>
      ))}

      <Form action="/users" method="post" resetOnSuccess>
        {({ processing, errors }) => (
          <>
            <input name="name" />
            <p>{errors.name}</p>
            <button type="submit" disabled={processing}>
              Save
            </button>
          </>
        )}
      </Form>
    </main>
  )
}
```

## Server integration

This adapter focuses on the browser rendering layer. In a Hono application, the server-side Inertia
protocol is expected to be handled by a server integration such as `@hono/inertia`.

The split is:

- `@hono/inertia`: server middleware and `c.render()` behavior for initial HTML, Inertia JSON
  responses, redirects, errors, and asset version handling.
- `@inertiajs/hono-jsx-dom`: client boot, component resolution, Hono JSX DOM rendering, links,
  forms, head updates, layouts, remembered state, polling, prefetch state, deferred props, and
  viewport-triggered reloads.

Initial page data should use Inertia's JSON script format, for example:

```html
<script data-page="app" type="application/json">
  {"component":"Home","props":{},"url":"/","version":"1"}
</script>
<div id="app"></div>
```

## SSR

This adapter exposes `@inertiajs/hono-jsx-dom/server`, which re-exports the Inertia SSR server helper.
`createInertiaApp()` can also be used in a server entry with Hono's `renderToString()`:

```tsx
import { createInertiaApp } from '@inertiajs/hono-jsx-dom'
import createServer from '@inertiajs/hono-jsx-dom/server'
import { renderToString } from 'hono/jsx/dom/server'

createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })

      return pages[`./Pages/${name}.tsx`]
    },
  }),
)
```

SSR support is intentionally limited to what Hono's `renderToString()` supports. Async components are not supported, and Hono's DOM hydration is render-like rather than React's strict hydration model.

Supported SSR behavior includes the initial page body, `usePage()` context, `Head`, and simple
layout/default layout rendering. Client hydration should still be treated as Hono DOM rendering, not
React-style strict hydration.

## Tested behavior

The package test app covers initial boot, links, page props, partial reload headers, head updates,
layout props, remembered state, forms, cancellation, polling, prefetch state, deferred props,
viewport-triggered reloads, infinite scroll, and limited SSR.

## Non-goals

This adapter does not aim for complete React adapter parity. It does not provide React-specific
features such as `StrictMode`, React DevTools integration, React ref fidelity, or React's exact
hydration behavior. SSR is intentionally limited, and async component SSR is not supported.
