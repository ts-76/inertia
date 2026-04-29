import { Head, Link, WhenVisible, usePage, usePoll } from '@inertiajs/hono-jsx'
import { useMemo, useState } from 'hono/jsx'
import { AppLayout } from '../../components/AppLayout'
import { PageShell } from '../../components/PageShell'

type User = {
  id: number
  name: string
  role: string
}

export default function UsersIndex() {
  const { props } = usePage<{ users: User[] }>()
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
  const poll = usePoll(30000, {}, { autoStart: false })

  const sortedUsers = useMemo(() => {
    return [...props.users].sort((first, second) => {
      const result = first.name.localeCompare(second.name)
      return direction === 'asc' ? result : -result
    })
  }, [direction, props.users])

  return (
    <PageShell>
      <Head title="Hono JSX Users" />
      <h1>Users</h1>

      <nav>
        <Link href="/" preserveState>
          Home
        </Link>
      </nav>

      <button type="button" onClick={() => setDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}>
        Sort {direction === 'asc' ? 'descending' : 'ascending'}
      </button>
      <button type="button" onClick={() => poll.start()}>
        Start poll
      </button>
      <button type="button" onClick={() => poll.stop()}>
        Stop poll
      </button>

      <ul>
        {sortedUsers.map((user: User) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`} preserveState>
              {user.name} - {user.role}
            </Link>
          </li>
        ))}
      </ul>

      <WhenVisible data="users" fallback={<p>Waiting for users section.</p>} always>
        {({ fetching }: { fetching: boolean }) => <p>Visible reload fetching: {fetching ? 'yes' : 'no'}</p>}
      </WhenVisible>
    </PageShell>
  )
}

UsersIndex.layout = (page: any) => <AppLayout section="Users">{page}</AppLayout>
