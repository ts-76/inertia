import { useForm } from '@inertiajs/hono-jsx'
import { useState } from 'hono/jsx'

export default function UseFormCancel() {
  const form = useForm({ name: '' })
  const [cancelled, setCancelled] = useState(false)
  const [finished, setFinished] = useState(false)

  return (
    <main>
      <h1>Use Form Cancel</h1>
      <input
        data-testid="cancel-name"
        value={form.data.name}
        onInput={(event) => form.setData('name', (event.currentTarget as HTMLInputElement).value)}
      />
      <p data-testid="cancel-processing">{form.processing ? 'processing' : 'idle'}</p>
      <p data-testid="cancel-state">{cancelled ? 'cancelled' : 'not-cancelled'}</p>
      <p data-testid="cancel-finished">{finished ? 'finished' : 'not-finished'}</p>
      <button
        type="button"
        onClick={() => {
          setCancelled(false)
          setFinished(false)
          form.post('/hono/use-form/cancel-slow', {
            onCancel: () => setCancelled(true),
            onFinish: () => setFinished(true),
          })
        }}
      >
        Submit cancellable form
      </button>
      <button type="button" onClick={() => form.cancel()}>
        Cancel form
      </button>
    </main>
  )
}
