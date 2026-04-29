import { Head } from '@inertiajs/hono-jsx'
import { useState } from 'hono/jsx'

export default function HeadKeys() {
  const [swapped, setSwapped] = useState(false)

  return (
    <main>
      <Head title="Head Keys">
        <meta head-key="hono-dedup" name="hono-dedup" content={swapped ? 'second' : 'first'} />
        {!swapped && <meta head-key="hono-extra" name="hono-extra" content="present" />}
      </Head>
      <h1>Head Keys</h1>
      <button type="button" onClick={() => setSwapped((value) => !value)}>
        Swap head keys
      </button>
    </main>
  )
}
