import {
  Deferred,
  Form,
  Head,
  Link,
  router,
  WhenVisible,
  useForm,
  usePrefetch,
  useRemember,
  usePage,
  usePoll,
} from '@inertiajs/hono-jsx'
import { useState } from 'hono/jsx'

export default function Home() {
  const page = usePage<{ example: string; deferredExample?: string }>()
  const [remembered, setRemembered] = useRemember('', 'hono-test.remembered')
  const form = useForm({ name: '' })
  const poll = usePoll(30000, {}, { autoStart: false })
  const prefetch = usePrefetch()
  const [headVariant, setHeadVariant] = useState('alpha')
  const [showOptionalHead, setShowOptionalHead] = useState(true)

  return (
    <main>
      <Head title={`Hono JSX Test Home ${headVariant}`}>
        <meta head-key="description" name="description" content={`Hono head ${headVariant}`} />
        <meta head-key="hono-head-variant" name="hono-head-variant" content={headVariant} />
        {showOptionalHead ? <meta head-key="hono-optional-head" name="hono-optional-head" content="present" /> : null}
      </Head>
      <h1>Hono JSX Home</h1>
      <p>Example: {page.props.example}</p>
      <button type="button" onClick={() => setHeadVariant((value) => (value === 'alpha' ? 'beta' : 'alpha'))}>
        Toggle head
      </button>
      <button type="button" onClick={() => setShowOptionalHead((value) => !value)}>
        Toggle optional head
      </button>
      <p data-testid="prefetch-state">{prefetch.isPrefetched ? 'prefetched' : 'not-prefetched'}</p>
      <input
        data-testid="remembered-input"
        value={remembered}
        onInput={(event) => setRemembered((event.currentTarget as HTMLInputElement).value)}
      />
      <input
        data-testid="form-name"
        value={form.data.name}
        onInput={(event) => form.setData('name', (event.currentTarget as HTMLInputElement).value)}
      />
      <button type="button" onClick={() => form.reset()}>
        Reset form
      </button>
      <p data-testid="form-dirty">{form.isDirty ? 'dirty' : 'clean'}</p>
      <button type="button" onClick={() => poll.start()}>
        Start poll
      </button>
      <button type="button" onClick={() => poll.stop()}>
        Stop poll
      </button>
      <Deferred data="deferredExample" fallback={<p data-testid="deferred-fallback">Deferred fallback</p>}>
        <p data-testid="deferred-example">Deferred: {page.props.deferredExample}</p>
      </Deferred>
      <button
        type="button"
        onClick={() => router.reload({ only: ['deferredExample'] })}
      >
        Load deferred example
      </button>
      <WhenVisible data="example" fallback={<p>Visible fallback</p>}>
        <p data-testid="visible-example">Visible: {page.props.example}</p>
      </WhenVisible>
      <Form action="/dump/post" method="post">
        {({ processing, isDirty }) => (
          <div>
            <input data-testid="form-component-name" name="formName" />
            <p data-testid="form-component-processing">{processing ? 'processing' : 'idle'}</p>
            <p data-testid="form-component-dirty">{isDirty ? 'dirty' : 'clean'}</p>
            <button type="submit">Submit Form component</button>
          </div>
        )}
      </Form>
      <Form action="/hono/form/errors" method="post" errorBag="honoForm">
        {({ errors, hasErrors }) => (
          <div>
            <input data-testid="form-component-error-name" name="formName" defaultValue="" />
            <p data-testid="form-component-has-errors">{hasErrors ? 'has-errors' : 'no-errors'}</p>
            <p data-testid="form-component-error-message">{errors.formName}</p>
            <button type="submit">Submit error Form component</button>
          </div>
        )}
      </Form>
      <Link href="/hono/target">Target page</Link>
      <Link href="/hono/use-page">Use page props</Link>
      <Link href="/dump/get" data={{ foo: 'bar' }}>
        GET dump
      </Link>
      <Link href="/dump/post" method="post" data={{ foo: 'post' }}>
        POST dump
      </Link>
    </main>
  )
}

Home.layout = (page: any) => <section data-testid="home-layout">{page}</section>
