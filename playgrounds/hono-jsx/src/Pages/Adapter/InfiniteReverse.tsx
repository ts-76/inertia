import { InfiniteScroll, Link, usePage } from '@inertiajs/hono-jsx'
import { AppLayout } from '../../components/AppLayout'
import { PageShell } from '../../components/PageShell'

type ScrollUser = {
  id: number
  name: string
}

type Users = {
  data: ScrollUser[]
  current_page: number
}

export default function InfiniteReverse() {
  const { props } = usePage<{ manualUsers: Users; autoUsers: Users }>()

  return (
    <PageShell>
      <h1>InfiniteScroll checks</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>

      <section>
        <h2>Manual reverse mode</h2>
        <p>Starts from page {props.manualUsers.current_page}. Click the button to prepend older pages.</p>
        <InfiniteScroll
          data="manualUsers"
          manual
          preserveUrl
          reverse
          previous={({ fetch, loading, hasMore }) =>
            loading ? (
              <span>Loading previous users...</span>
            ) : (
              <button type="button" disabled={!hasMore} onClick={() => fetch()}>
                {hasMore ? 'Fetch previous' : 'No previous users'}
              </button>
            )
          }
        >
          <ul>
            {props.manualUsers.data.map((user) => (
              <li key={user.id}>Manual {user.name}</li>
            ))}
          </ul>
        </InfiniteScroll>
      </section>

      <section>
        <h2>Automatic next-page mode</h2>
        <p>Scroll this panel. When the bottom trigger becomes visible, the next page is appended automatically.</p>
        <div
          data-testid="auto-panel"
          style={{
            border: '1px solid #d1d5db',
            height: '10rem',
            overflowY: 'auto',
            overflowAnchor: 'none',
            padding: '1rem',
            overscrollBehavior: 'contain',
          }}
        >
          <InfiniteScroll
            as="ul"
            data="autoUsers"
            buffer={80}
            preserveUrl
            onlyNext
            loading={<li>Loading more users...</li>}
            next={({ loading, hasMore, autoMode }) =>
              loading ? (
                <span>Loading automatically...</span>
              ) : hasMore && autoMode ? (
                <span>Scroll for more</span>
              ) : (
                <span>No more users</span>
              )
            }
          >
            {props.autoUsers.data.map((user) => (
              <li key={user.id}>Auto {user.name}</li>
            ))}
          </InfiniteScroll>
        </div>
      </section>
    </PageShell>
  )
}

InfiniteReverse.layout = (page: any) => <AppLayout section="Infinite checks">{page}</AppLayout>
