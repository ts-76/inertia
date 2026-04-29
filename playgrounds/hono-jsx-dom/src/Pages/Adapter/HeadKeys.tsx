import { Head, Link } from '@inertiajs/hono-jsx-dom'
import { useState } from 'hono/jsx'
import { AppLayout } from '../../components/AppLayout'
import { PageShell } from '../../components/PageShell'

export default function HeadKeys() {
  const [variant, setVariant] = useState<'first' | 'second'>('first')
  const showExtra = variant === 'first'

  return (
    <PageShell>
      <Head title={`Head keys ${variant}`}>
        <meta head-key="playground-dedup" name="playground-dedup" content={variant} />
        {showExtra && <meta head-key="playground-extra" name="playground-extra" content="present" />}
      </Head>

      <h1>Head key checks</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>
      <p>The document title and meta tags update through the Hono JSX DOM Head adapter.</p>
      <button type="button" onClick={() => setVariant((value) => (value === 'first' ? 'second' : 'first'))}>
        Swap head keys
      </button>
      <p>Current variant: {variant}</p>
    </PageShell>
  )
}

HeadKeys.layout = (page: any) => <AppLayout section="Head checks">{page}</AppLayout>
