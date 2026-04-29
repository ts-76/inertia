import { Link, usePage } from '@inertiajs/hono-jsx-dom'

export default function Partial() {
  const page = usePage<{ message: string; other: string }>()

  return (
    <main>
      <p data-testid="message">{page.props.message}</p>
      <p data-testid="other">{page.props.other}</p>
      <Link href="/hono/partial?count=1" only={['headers', 'message']}>
        Only message
      </Link>
    </main>
  )
}
