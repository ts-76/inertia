import { usePage } from '@inertiajs/hono-jsx'

export default function Target() {
  const page = usePage<{ message: string }>()

  return <p>{page.props.message}</p>
}
