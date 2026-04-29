import { usePage } from '@inertiajs/hono-jsx-dom'

declare global {
  interface Window {
    _inertia_request_dump?: unknown
  }
}

export default function Dump() {
  const page = usePage<{ method: string }>()

  window._inertia_request_dump = page.props

  return <pre>{JSON.stringify(page.props)}</pre>
}
