import { Form, Link, usePage } from '@inertiajs/hono-jsx-dom'

type Props = {
  submitted: Record<string, unknown> | null
  uploadName: string | null
}

export default function FormAdvanced() {
  const page = usePage<Props>()

  return (
    <main>
      <h1>Form Advanced</h1>
      <Form
        action="/hono/form/advanced-success"
        method="post"
        transform={(data) => ({ ...data, transformed: 'yes' })}
        resetOnSuccess={['name']}
        setDefaultsOnSuccess
        disableWhileProcessing
      >
        {({ isDirty, processing, wasSuccessful, recentlySuccessful }) => (
          <div>
            <input data-testid="advanced-name" name="name" />
            <input data-testid="advanced-file" name="avatar" type="file" />
            <p data-testid="advanced-dirty">{isDirty ? 'dirty' : 'clean'}</p>
            <p data-testid="advanced-processing">{processing ? 'processing' : 'idle'}</p>
            <p data-testid="advanced-success">{wasSuccessful ? 'successful' : 'not-successful'}</p>
            <p data-testid="advanced-recent">{recentlySuccessful ? 'recent' : 'not-recent'}</p>
            <button type="submit">Submit advanced success</button>
          </div>
        )}
      </Form>
      <Form action="/hono/form/advanced-error" method="post" errorBag="advanced" resetOnError={['name']}>
        {({ errors, isDirty }) => (
          <div>
            <input data-testid="advanced-error-name" name="name" />
            <p data-testid="advanced-error-dirty">{isDirty ? 'dirty' : 'clean'}</p>
            <p data-testid="advanced-error-message">{errors.name}</p>
            <button type="submit">Submit advanced error</button>
          </div>
        )}
      </Form>
      <pre data-testid="advanced-submitted">{JSON.stringify(page.props.submitted)}</pre>
      <p data-testid="advanced-upload">{page.props.uploadName || 'no-upload'}</p>
      <Link href="/">Back home</Link>
    </main>
  )
}
