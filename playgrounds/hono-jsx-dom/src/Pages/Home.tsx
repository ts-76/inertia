import { Deferred, Head, Link, router, useForm, usePage, usePrefetch, useRemember } from '@inertiajs/hono-jsx-dom'
import { AppLayout } from '../components/AppLayout'
import { PageShell } from '../components/PageShell'
import { RoleSummary } from '../components/RoleSummary'
import { UserExplorer } from '../components/UserExplorer'
import { VisitCounter } from '../components/VisitCounter'

type User = {
  id: number
  name: string
  role: string
}

export default function Home() {
  const { props } = usePage<{ message: string; users: User[]; stats?: { visits: number } }>()
  const [rememberedNote, setRememberedNote] = useRemember('', 'home.note')
  const form = useForm({
    name: '',
    role: 'Guest',
  })
  const prefetch = usePrefetch()

  return (
    <PageShell>
      <Head title="Hono JSX DOM Home">
        <meta head-key="description" name="description" content="Hono JSX DOM Inertia playground home" />
      </Head>

      <h1>Hono JSX DOM + Inertia</h1>
      <p>{props.message}</p>
      <p>Prefetched: {prefetch.isPrefetched ? 'yes' : 'no'}</p>

      <nav>
        <Link href="/users">View users</Link>
        <Link href="/adapter/form">Form checks</Link>
        <Link href="/adapter/head">Head checks</Link>
        <Link href="/adapter/infinite?manualPage=2&autoPage=1">Infinite checks</Link>
      </nav>

      <section>
        <h2>Remembered input</h2>
        <input
          value={rememberedNote}
          placeholder="This survives history navigation"
          onInput={(event) => setRememberedNote((event.currentTarget as HTMLInputElement).value)}
        />
      </section>

      <section>
        <h2>useForm state</h2>
        <input
          value={form.data.name}
          placeholder="Name"
          onInput={(event) => form.setData('name', (event.currentTarget as HTMLInputElement).value)}
        />
        <button type="button" onClick={() => form.setData('role', form.data.role === 'Guest' ? 'Member' : 'Guest')}>
          Toggle role: {form.data.role}
        </button>
        <button type="button" onClick={() => form.reset()}>
          Reset form
        </button>
        <p>Dirty: {form.isDirty ? 'yes' : 'no'}</p>
        <p>Processing: {form.processing ? 'yes' : 'no'}</p>
      </section>

      <Deferred data="stats" fallback={<p>Stats are not loaded yet.</p>}>
        <p>Stats visits: {props.stats?.visits}</p>
      </Deferred>
      <button
        type="button"
        onClick={() =>
          router.reload({
            only: ['stats'],
          })
        }
      >
        Load stats
      </button>

      <VisitCounter />
      <RoleSummary users={props.users} />
      <UserExplorer users={props.users} />
    </PageShell>
  )
}

Home.layout = (page: any) => <AppLayout section="Home">{page}</AppLayout>
