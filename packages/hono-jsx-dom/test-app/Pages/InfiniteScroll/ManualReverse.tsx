import { InfiniteScroll, usePage } from '@inertiajs/hono-jsx-dom'

type User = {
  id: number
  name: string
}

type Users = {
  data: User[]
}

export default function ManualReverse() {
  const page = usePage<{ users: Users }>()

  return (
    <main>
      <h1>Infinite Scroll Manual Reverse</h1>
      <InfiniteScroll
        data="users"
        manual
        reverse
        loading={<span data-testid="infinite-reverse-loading">Loading previous</span>}
        previous={({ fetch, loading, hasMore }) =>
          loading ? (
            <span data-testid="infinite-reverse-loading">Loading previous</span>
          ) : (
            <button type="button" disabled={!hasMore} onClick={() => fetch()}>
              {hasMore ? 'Fetch previous' : 'No previous users'}
            </button>
          )
        }
      >
        <ul data-testid="infinite-reverse-users">
          {page.props.users.data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </InfiniteScroll>
    </main>
  )
}
