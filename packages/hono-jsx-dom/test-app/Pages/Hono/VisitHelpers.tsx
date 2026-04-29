import { router, usePage, usePoll, usePrefetch, WhenVisible } from '@inertiajs/hono-jsx-dom'
import { useState } from 'hono/jsx'

export default function VisitHelpers() {
  const page = usePage<{ visibleValue?: string; pollCount: number }>()
  const prefetch = usePrefetch()
  const [pollValue, setPollValue] = useState(page.props.pollCount)
  const poll = usePoll(
    250,
    {
      only: ['pollCount'],
      onSuccess: (page) => setPollValue(page.props.pollCount as number),
    },
    { autoStart: false },
  )

  return (
    <main>
      <h1>Visit Helpers</h1>
      <p data-testid="prefetch-state">{prefetch.isPrefetching ? 'prefetching' : prefetch.isPrefetched ? 'prefetched' : 'idle'}</p>
      <button type="button" onClick={() => router.prefetch('/hono/visit-helpers?prefetch=1', {}, { cacheFor: 30000 })}>
        Trigger prefetch
      </button>
      <button type="button" onClick={() => prefetch.flush()}>
        Flush prefetch
      </button>
      <p data-testid="poll-count">{pollValue}</p>
      <button type="button" onClick={() => poll.start()}>
        Start helper poll
      </button>
      <button type="button" onClick={() => poll.stop()}>
        Stop helper poll
      </button>
      <div style={{ height: '120vh' }}>Spacer</div>
      <WhenVisible data="visibleValue" fallback={<p data-testid="visible-helper-fallback">Waiting visible helper</p>}>
        <p data-testid="visible-helper-value">{page.props.visibleValue}</p>
      </WhenVisible>
    </main>
  )
}
