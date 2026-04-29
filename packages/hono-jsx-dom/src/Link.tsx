import {
  ActiveVisit,
  isUrlMethodPair,
  LinkComponentBaseProps,
  mergeDataIntoQueryString,
  Method,
  PendingVisit,
  router,
  shouldIntercept,
  VisitOptions,
} from '@inertiajs/core'
import { useMemo, useState } from 'hono/jsx'

const noop = () => undefined

type LinkElementProps = Record<string, unknown>

export type InertiaLinkProps = Omit<LinkComponentBaseProps, 'preserveState'> &
  LinkElementProps & {
    as?: keyof HTMLElementTagNameMap
    children?: unknown
    onClick?: (event: MouseEvent) => void
    preserveState?: LinkComponentBaseProps['preserveState'] | null
  }

export default function Link({
  children,
  as = 'a',
  data = {},
  href = '',
  method = 'get',
  preserveScroll = false,
  preserveState = null,
  preserveUrl = false,
  replace = false,
  only = [],
  except = [],
  headers = {},
  queryStringArrayFormat = 'brackets',
  async = false,
  onClick = noop,
  onCancelToken = noop,
  onBefore = noop,
  onStart = noop,
  onProgress = noop,
  onFinish = noop,
  onCancel = noop,
  onSuccess = noop,
  onError = noop,
  viewTransition = false,
  ...props
}: InertiaLinkProps) {
  const [inFlightCount, setInFlightCount] = useState(0)

  const _method = useMemo(() => {
    return isUrlMethodPair(href) ? href.method : (method.toLowerCase() as Method)
  }, [href, method])

  const _as = useMemo(() => {
    return _method !== 'get' && as.toLowerCase() === 'a' ? 'button' : as.toLowerCase()
  }, [as, _method])

  const mergeDataArray = useMemo(
    () => mergeDataIntoQueryString(_method, isUrlMethodPair(href) ? href.url : href, data, queryStringArrayFormat),
    [href, _method, data, queryStringArrayFormat],
  )

  const url = useMemo(() => mergeDataArray[0], [mergeDataArray])
  const _data = useMemo(() => mergeDataArray[1], [mergeDataArray])

  const visitParams = useMemo<VisitOptions>(
    () => ({
      data: _data,
      method: _method,
      preserveScroll,
      preserveState: preserveState ?? _method !== 'get',
      preserveUrl,
      replace,
      only,
      except,
      headers,
      async,
      viewTransition,
      onCancelToken,
      onBefore,
      onStart(visit: PendingVisit) {
        setInFlightCount((count) => count + 1)
        onStart(visit)
      },
      onProgress,
      onFinish(visit: ActiveVisit) {
        setInFlightCount((count) => count - 1)
        onFinish(visit)
      },
      onCancel,
      onSuccess,
      onError,
    }),
    [
      _data,
      _method,
      preserveScroll,
      preserveState,
      preserveUrl,
      replace,
      only,
      except,
      headers,
      async,
      viewTransition,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
    ],
  )

  const elProps = useMemo(() => {
    if (_as === 'button') {
      return { type: 'button' }
    }

    if (_as === 'a') {
      return { href: url }
    }

    return {}
  }, [_as, url])

  const linkProps = {
    ...props,
    ...elProps,
    onClick: (event: MouseEvent) => {
      onClick(event)

      if (shouldIntercept(event)) {
        event.preventDefault()

        router.visit(url, visitParams)
      }
    },
    'data-loading': inFlightCount > 0 ? '' : undefined,
  }

  const Element = _as

  return <Element {...linkProps}>{children}</Element>
}
