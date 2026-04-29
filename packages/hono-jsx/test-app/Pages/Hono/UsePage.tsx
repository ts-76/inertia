import { usePage } from '@inertiajs/hono-jsx'

export default function UsePage() {
  const page = usePage<{ name: string }>()

  return <p data-testid="page-name">{page.props.name}</p>
}
