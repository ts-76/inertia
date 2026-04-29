import { usePage } from '@inertiajs/hono-jsx-dom'

export default function UsePage() {
  const page = usePage<{ name: string }>()

  return <p data-testid="page-name">{page.props.name}</p>
}
