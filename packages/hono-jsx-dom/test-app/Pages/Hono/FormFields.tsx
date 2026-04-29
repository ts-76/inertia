import { Form, Link, usePage } from '@inertiajs/hono-jsx-dom'

type Props = {
  submitted: Record<string, unknown> | null
}

export default function FormFields() {
  const page = usePage<Props>()

  return (
    <main>
      <h1>Form Fields</h1>
      <Form action="/hono/form/fields-success" method="post" resetOnSuccess>
        {({ isDirty }) => (
          <div>
            <input data-testid="field-tag-0" name="tags[]" />
            <input data-testid="field-tag-1" name="tags[]" />
            <label>
              <input data-testid="field-active" name="active" type="checkbox" value="yes" />
              Active
            </label>
            <p data-testid="field-dirty">{isDirty ? 'dirty' : 'clean'}</p>
            <button type="submit">Submit field form</button>
          </div>
        )}
      </Form>
      <pre data-testid="field-submitted">{JSON.stringify(page.props.submitted)}</pre>
      <Link href="/">Back home</Link>
    </main>
  )
}
