import { InfiniteScroll, usePage } from '@inertiajs/hono-jsx-dom'

type User = {
  id: number
  name: string
}

type Users = {
  data: User[]
}

export default function Manual() {
  const page = usePage<{ users: Users }>()

  return (
    <main>
      <h1>Infinite Scroll Manual</h1>
      <InfiniteScroll
        data="users"
        manual
        loading={<span data-testid="infinite-loading">Loading next</span>}
        next={({ fetch, loading, hasMore }) => (
          <button type="button" disabled={loading || !hasMore} onClick={() => fetch()}>
            {loading ? 'Loading next' : hasMore ? 'Fetch next' : 'No more users'}
          </button>
        )}
      >
        <ul data-testid="infinite-users">
          {page.props.users.data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </InfiniteScroll>
    </main>
  )
}
