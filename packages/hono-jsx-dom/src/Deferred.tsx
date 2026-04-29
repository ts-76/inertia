import { isSameUrlWithoutQueryOrHash } from '@inertiajs/core'
import { get } from 'es-toolkit/compat'
import { useEffect, useMemo, useRef, useState } from 'hono/jsx'
import type { Child } from 'hono/jsx/dom'
import type { JSX } from 'hono/jsx/dom/jsx-runtime'
import { router } from '.'
import usePage from './usePage'

const keysAreBeingReloaded = (only: string[], except: string[], keys: string[]): boolean => {
  if (only.length === 0 && except.length === 0) {
    return true
  }

  if (only.length > 0) {
    return keys.some((key) => only.includes(key))
  }

  return keys.some((key) => !except.includes(key))
}

interface DeferredSlotProps {
  reloading: boolean
}

interface DeferredProps {
  children: Child | ((props: DeferredSlotProps) => Child)
  fallback: Child | (() => Child)
  data: string | string[]
}

const Deferred = ({ children, data, fallback }: DeferredProps): JSX.Element | null => {
  if (!data) {
    throw new Error('`<Deferred>` requires a `data` prop to be a string or array of strings')
  }

  const [loaded, setLoaded] = useState(false)
  const [reloading, setReloading] = useState(false)
  const activeReloads = useRef(new Set<object>())
  const pageProps = usePage().props
  const keys = useMemo(() => (Array.isArray(data) ? data : [data]), [data])

  useEffect(() => {
    const removeStartListener = router.on('start', (e) => {
      const visit = e.detail.visit

      if (
        visit.preserveState === true &&
        isSameUrlWithoutQueryOrHash(visit.url, window.location) &&
        keysAreBeingReloaded(visit.only, visit.except, keys)
      ) {
        activeReloads.current!.add(visit)
        setReloading(true)
      }
    })

    const removeFinishListener = router.on('finish', (e) => {
      const visit = e.detail.visit

      if (activeReloads.current!.has(visit)) {
        activeReloads.current!.delete(visit)
        setReloading(activeReloads.current!.size > 0)
      }
    })

    return () => {
      removeStartListener()
      removeFinishListener()
      activeReloads.current!.clear()
    }
  }, [keys])

  useEffect(() => {
    setLoaded(keys.every((key) => get(pageProps, key) !== undefined))
  }, [pageProps, keys])

  const propsAreDefined = useMemo(() => keys.every((key) => get(pageProps, key) !== undefined), [keys, pageProps])

  if (loaded && propsAreDefined) {
    if (typeof children === 'function') {
      return children({ reloading }) as JSX.Element
    }

    return children as JSX.Element
  }

  return (typeof fallback === 'function' ? fallback() : fallback) as JSX.Element
}

Deferred.displayName = 'InertiaDeferred'

export default Deferred

