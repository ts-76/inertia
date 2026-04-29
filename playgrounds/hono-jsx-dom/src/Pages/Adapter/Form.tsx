import { Form, Link, useForm, usePage } from '@inertiajs/hono-jsx-dom'
import { useState } from 'hono/jsx'
import { AppLayout } from '../../components/AppLayout'
import { PageShell } from '../../components/PageShell'

type Props = {
  submitted: Record<string, unknown> | null
}

export default function AdapterForm() {
  const { props } = usePage<Props>()
  const cancelForm = useForm({ name: '' })
  const [cancelled, setCancelled] = useState(false)
  const [finished, setFinished] = useState(false)

  return (
    <PageShell>
      <h1>Form adapter checks</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>

      <section>
        <h2>Form reset</h2>
        <Form action="/adapter/form/success" method="post" resetOnSuccess>
          {({ isDirty, processing }) => (
            <div>
              <input name="tags[]" placeholder="First tag" />
              <input name="tags[]" placeholder="Second tag" />
              <label>
                <input name="active" type="checkbox" value="yes" />
                Active
              </label>
              <p>Dirty: {isDirty ? 'yes' : 'no'}</p>
              <p>Processing: {processing ? 'yes' : 'no'}</p>
              <button type="submit">Submit and reset</button>
            </div>
          )}
        </Form>
        <pre>{JSON.stringify(props.submitted, null, 2)}</pre>
      </section>

      <section>
        <h2>useForm cancel</h2>
        <input
          value={cancelForm.data.name}
          placeholder="Slow request name"
          onInput={(event) => cancelForm.setData('name', (event.currentTarget as HTMLInputElement).value)}
        />
        <button
          type="button"
          onClick={() => {
            setCancelled(false)
            setFinished(false)
            cancelForm.post('/adapter/form/cancel-slow', {
              onCancel: () => setCancelled(true),
              onFinish: () => setFinished(true),
            })
          }}
        >
          Start slow submit
        </button>
        <button type="button" onClick={() => cancelForm.cancel()}>
          Cancel
        </button>
        <p>Processing: {cancelForm.processing ? 'yes' : 'no'}</p>
        <p>Cancelled: {cancelled ? 'yes' : 'no'}</p>
        <p>Finished: {finished ? 'yes' : 'no'}</p>
      </section>
    </PageShell>
  )
}

AdapterForm.layout = (page: any) => <AppLayout section="Form checks">{page}</AppLayout>
