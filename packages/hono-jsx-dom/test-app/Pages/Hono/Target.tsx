import { usePage } from '@inertiajs/hono-jsx-dom'

export default function Target() {
  const page = usePage<{ message: string }>()

  return <p>{page.props.message}</p>
}
