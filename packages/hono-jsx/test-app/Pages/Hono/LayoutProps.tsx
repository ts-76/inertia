import { Link, setLayoutProps, usePage } from '@inertiajs/hono-jsx'
import { useEffect } from 'hono/jsx'
import type { Child } from 'hono/jsx/dom'

function NamedShell({
  children,
  namedLabel = 'no-named-layout-props',
  sharedLabel = 'no-shared-layout-props',
}: {
  children?: Child
  namedLabel?: string
  sharedLabel?: string
}) {
  return (
    <section data-testid="named-layout">
      <p data-testid="named-layout-shared">{sharedLabel}</p>
      <p data-testid="named-layout-named">{namedLabel}</p>
      {children}
    </section>
  )
}

export default function LayoutProps() {
  const page = usePage<{ preserve: boolean }>()

  useEffect(() => {
    setLayoutProps({ sharedLabel: 'shared layout value' })
    setLayoutProps('namedShell', { namedLabel: 'named layout value' })
  }, [])

  return (
    <main>
      <h1>Layout Props</h1>
      <p data-testid="layout-preserve">{page.props.preserve ? 'preserve' : 'fresh'}</p>
      <Link href="/hono/layout-props?preserve=1" preserveState>
        Preserve layout props
      </Link>
      <Link href="/hono/use-page">Reset layout props</Link>
    </main>
  )
}

LayoutProps.layout = { namedShell: NamedShell }
